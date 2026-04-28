<?php

/**
 * Admin Class
 * Gerencia a interface administrativa do plugin
 */

class Salesforce_Products_Admin
{
    private static $instance = null;
    private $auth;
    private $api;
    private $cache_manager;
    private $menu_added = false;

    public static function get_instance($auth = null, $api = null, $cache_manager = null)
    {
        if (null === self::$instance && $auth && $api && $cache_manager) {
            self::$instance = new self($auth, $api, $cache_manager);
        }
        return self::$instance;
    }

    public function __construct($auth, $api, $cache_manager)
    {
        $this->auth = $auth;
        $this->api = $api;
        $this->cache_manager = $cache_manager;

        $this->init_hooks();
    }

    private function init_hooks()
    {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_assets']);

        add_action('admin_post_salesforce_save_credentials', [$this, 'save_credentials']);
        add_action('admin_post_salesforce_save_category_map', [$this, 'save_category_map']);
        add_action('admin_post_salesforce_switch_environment', [$this, 'switch_environment']);

        add_action('wp_ajax_salesforce_test_connection', [$this, 'ajax_test_connection']);
        add_action('wp_ajax_salesforce_run_cron_job', [$this, 'ajax_run_cron_job']);

        add_action('wp_ajax_salesforce_clear_cache', [$this, 'ajax_clear_cache']);

    }

    public function add_admin_menu()
    {
        if ($this->menu_added) {
            return;
        }

        global $admin_page_hooks;
        if (isset($admin_page_hooks['salesforce-products'])) {
            $this->menu_added = true;
            return;
        }

        add_menu_page(
            __('Salesforce Settings', 'salesforce-products'),
            'Salesforce',
            'manage_options',
            'salesforce-products',
            [$this, 'render_settings_page'],
            'dashicons-cloud',
            56
        );

        add_submenu_page(
            'salesforce-products',
            __('Credenciais da Salesforce', 'salesforce-products'),
            __('Credenciais', 'salesforce-products'),
            'manage_options',
            'salesforce-products',
            [$this, 'render_settings_page']
        );

        add_submenu_page(
            'salesforce-products',
            __('Categorias', 'salesforce-products'),
            __('Categorias', 'salesforce-products'),
            'manage_options',
            'salesforce-categories',
            [$this, 'render_categories_page']
        );

        add_submenu_page(
            'salesforce-products',
            __('Logs & Status', 'salesforce-products'),
            __('Logs & Status', 'salesforce-products'),
            'manage_options',
            'salesforce-log',
            [$this, 'render_log_page']
        );

        $this->menu_added = true;
    }

    public function render_categories_page()
    {
        require_once SF_PRODUCTS_PLUGIN_DIR . 'admin/views/categories-page.php';
    }

    public function enqueue_assets($hook)
    {
        if (strpos($hook, 'salesforce') === false) {
            return;
        }

        wp_enqueue_style('salesforce-admin', SF_PRODUCTS_PLUGIN_URL . 'admin/css/admin.css', [], SF_PRODUCTS_VERSION);
        wp_enqueue_script('salesforce-admin', SF_PRODUCTS_PLUGIN_URL . 'admin/js/admin.js', ['jquery'], SF_PRODUCTS_VERSION, true);

        wp_localize_script('salesforce-admin', 'salesforce_admin', [
            'nonce' => wp_create_nonce('salesforce_admin_nonce'),
            'ajaxurl' => admin_url('admin-ajax.php')
        ]);
    }

    public function render_settings_page()
    {
        require_once SF_PRODUCTS_PLUGIN_DIR . 'admin/views/settings-page.php';
    }

    public function render_log_page()
    {
        require_once SF_PRODUCTS_PLUGIN_DIR . 'admin/views/log-page.php';
    }

    public function save_credentials()
    {
        check_admin_referer('salesforce_save_credentials');

        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'salesforce-products'));
        }

        $environment = sanitize_text_field($_POST['environment']);

        $credentials = [
            'client_id' => sanitize_text_field($_POST['client_id']),
            'client_secret' => sanitize_text_field($_POST['client_secret']),
            'username' => sanitize_text_field($_POST['username']),
            'password' => sanitize_text_field($_POST['password']),
            'security_token' => sanitize_text_field($_POST['security_token'])
        ];

        update_option("salesforce_credentials_{$environment}", $credentials);

        // Limpar cache de autenticação para forçar novo token
        $this->auth->clear_token_cache($environment);

        wp_redirect(admin_url('admin.php?page=salesforce-products&updated=true'));
        exit;
    }

    public function save_category_map()
    {
        check_admin_referer('salesforce_save_category_map');

        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'salesforce-products'));
        }

        // Captura as chaves e valores enviados pelo formulário
        $keys = isset($_POST['salesforce_category_map_keys']) ? $_POST['salesforce_category_map_keys'] : [];
        $values = isset($_POST['salesforce_category_map_values']) ? $_POST['salesforce_category_map_values'] : [];
        
        $map = array();
        
        // Itera sobre as chaves para montar o mapa
        foreach ($keys as $index => $sf_key) {
            // Verifica se existe chave e se existe valor correspondente naquele índice
            if ( ! empty( $sf_key ) && isset($values[$index]) && !empty($values[$index]) ) {
                $clean_key = sanitize_text_field($sf_key);
                
                // O valor agora é um array de slugs (checkboxes), precisamos sanitizar cada um
                $raw_values = (array) $values[$index];
                $clean_values = array_map('sanitize_title', $raw_values);
                
                $map[$clean_key] = $clean_values;
            }
        }

        update_option('salesforce_category_map', $map);

        // CORREÇÃO: Redireciona para a página correta (salesforce-categories)
        wp_redirect(admin_url('admin.php?page=salesforce-categories&updated=true'));
        exit;
    }


    public function switch_environment()
    {
        check_admin_referer('salesforce_switch_environment');

        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'salesforce-products'));
        }

        $new_environment = sanitize_text_field($_POST['new_environment']);
        $old_environment = get_option('salesforce_environment');

        if ($new_environment !== $old_environment) {
            update_option('salesforce_environment', $new_environment);

            // Limpar todo o cache ao trocar de ambiente
            $this->cache_manager->clear();

            // Resetar data de sync
            update_option('salesforce_last_sync', '');
        }

        wp_redirect(admin_url("admin.php?page=salesforce-products&switched=true&from={$old_environment}&to={$new_environment}"));
        exit;
    }

    public function ajax_test_connection()
    {
        check_ajax_referer('salesforce_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Unauthorized', 'salesforce-products'));
        }

        $environment = isset($_POST['environment']) ? sanitize_text_field($_POST['environment']) : null;

        // Teste de Auth
        $auth_result = $this->auth->test_connection($environment);

        if (!$auth_result['success']) {
            wp_send_json_error($auth_result['error']);
        }

        // Teste de API
        $api_result = $this->api->test_connection();

        if (!$api_result['success']) {
            wp_send_json_error($api_result['error']);
        }

        wp_send_json_success([
            'message' => __('Connection successful!', 'salesforce-products'),
            'details' => $api_result
        ]);
    }

    public function ajax_run_cron_job()
    {
        check_ajax_referer('salesforce_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Unauthorized', 'salesforce-products'));
        }

        $job = sanitize_text_field($_POST['job']);
        $plugin = sf_products_integration();
        $cron = $plugin->get_cron_manager();

        try {
            if ($job === 'daily_sync') {
                $cron->daily_sync();
            } elseif ($job === 'hourly_check') {
                $cron->hourly_cache_check();
            } else {
                wp_send_json_error(__('Unknown job', 'salesforce-products'));
            }

            wp_send_json_success(__('Job executed successfully', 'salesforce-products'));
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    public function ajax_clear_cache()
    {
        check_ajax_referer('salesforce_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Unauthorized', 'salesforce-products'));
        }

        try {
            $this->cache_manager->clear();
            wp_send_json_success(__('Cache cleared successfully', 'salesforce-products'));
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Helper para a view settings-page.php
     */
    public function get_cache_count()
    {
        $stats = $this->cache_manager->get_stats();
        return $stats['total_items'] ?? 0;
    }
}
