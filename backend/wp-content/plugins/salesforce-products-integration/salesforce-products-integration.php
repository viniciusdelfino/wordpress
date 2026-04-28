<?php
/**
 * Plugin Name: Salesforce Products Integration
 * Plugin URI: https://seusite.com/
 * Description: Integração completa entre WordPress e Salesforce para gerenciamento de produtos. Suporte para ambiente de desenvolvimento e produção.
 * Version: 1.0.0
 * Author: Sua Empresa
 * Author URI: https://seusite.com/
 * License: GPL v2 or later
 * Text Domain: salesforce-products
 * Domain Path: /languages
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Definições do plugin
define('SF_PRODUCTS_VERSION', '1.0.0');
define('SF_PRODUCTS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SF_PRODUCTS_PLUGIN_URL', plugin_dir_url(__FILE__));

if (!defined('DISABLE_SALESFORCE_SYNC')) {
    define('DISABLE_SALESFORCE_SYNC', false);
}

// Carregar classes na ordem correta
require_once SF_PRODUCTS_PLUGIN_DIR . 'includes/class-cache-manager.php'; // Primeiro - sem dependências
require_once SF_PRODUCTS_PLUGIN_DIR . 'includes/class-salesforce-auth.php';
require_once SF_PRODUCTS_PLUGIN_DIR . 'includes/class-salesforce-api.php';
require_once SF_PRODUCTS_PLUGIN_DIR . 'includes/class-product-manager.php';
require_once SF_PRODUCTS_PLUGIN_DIR . 'includes/class-cron-manager.php';

// Classe principal do plugin
class Salesforce_Products_Integration {
    
    private static $instance = null;
    private $auth = null;
    private $api = null;
    private $product_manager = null;
    private $cron_manager = null;
    private $cache_manager = null;

    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init();
    }
    
    private function init() {
        // Inicializar componentes
        $this->cache_manager = new Cache_Manager();
        $this->auth = new Salesforce_Auth();
        $this->api = new Salesforce_API($this->auth);
        $this->product_manager = new Product_Manager($this->api, $this->cache_manager);
        
        // Hooks de ativação/desativação
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);
        
        // Inicializar admin
        if (is_admin()) {
            require_once SF_PRODUCTS_PLUGIN_DIR . 'admin/class-admin.php';
            new Salesforce_Products_Admin($this->auth, $this->api, $this->cache_manager);
        }
        
        // Inicializar endpoints REST
        require_once SF_PRODUCTS_PLUGIN_DIR . 'public/rest-endpoints.php';
        
        // Inicializar cron manager
        $this->cron_manager = new Cron_Manager(
            $this->product_manager,
            $this->cache_manager
        );
        
        // Carregar traduções
        add_action('plugins_loaded', [$this, 'load_textdomain']);
    }
    
    public function activate() {
        global $wpdb;
        
        // Criar tabelas necessárias
        $this->create_tables();
        
        // Adicionar opções padrão
        add_option('salesforce_environment', 'development');
        add_option('salesforce_cache_duration', 3600);
        add_option('salesforce_last_sync', '');
        add_option('salesforce_last_full_sync', '');
        
        // Agendar cron jobs
        Cron_Manager::schedule_all_cron_jobs();
        
        // Registrar ativação
        $this->log_activation();
    }
    
    public function deactivate() {
        // Remover cron jobs
        Cron_Manager::unschedule_all_cron_jobs();
        
        // Limpar cache
        $this->get_cache_manager()->clear();
        
        // Registrar desativação
        $this->log_deactivation();
    }
    
    private function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            sync_type varchar(50) NOT NULL,
            items_count int(11) DEFAULT 0,
            status varchar(20) DEFAULT 'pending',
            error_message text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            finished_at datetime,
            PRIMARY KEY (id),
            KEY sync_type (sync_type),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function log_activation() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $wpdb->insert($table_name, [
            'sync_type' => 'plugin_activation',
            'status' => 'success',
            'error_message' => 'Plugin activated version ' . SF_PRODUCTS_VERSION,
            'finished_at' => current_time('mysql')
        ]);
    }
    
    private function log_deactivation() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $wpdb->insert($table_name, [
            'sync_type' => 'plugin_deactivation',
            'status' => 'info',
            'error_message' => 'Plugin deactivated',
            'finished_at' => current_time('mysql')
        ]);
    }
    
    public function load_textdomain() {
        load_plugin_textdomain(
            'salesforce-products',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }
    
    // Getters para acesso externo
    public function get_auth() {
        return $this->auth;
    }
    
    public function get_api() {
        return $this->api;
    }
    
    public function get_product_manager() {
        return $this->product_manager;
    }
    
    public function get_cron_manager() {
        return $this->cron_manager;
    }

    public function get_cache_manager() {
        return $this->cache_manager;
    }
}

// Inicializar plugin
function sf_products_integration() {
    return Salesforce_Products_Integration::get_instance();
}

// Inicializar depois que o WordPress estiver pronto
add_action('init', 'sf_products_integration', 1);

/**
 * Retorna o mapa padrão de categorias (Definido via Código/Cliente).
 * Use esta função para inserir a lista de termos fornecida pelo cliente.
 * 
 * @return array
 */
function sf_get_default_category_map() {
    return array(
        'CARROS'    => ['carros'],
        'MOTOS'     => ['motos'],
        'INDUSTRIA' => ['maquinas-agricolas'],
        'COMERCIAL' => ['caminhoes']
    );
}