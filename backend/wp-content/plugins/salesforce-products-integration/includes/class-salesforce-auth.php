<?php
/**
 * Salesforce Authentication Handler
 * Gerencia autenticação OAuth 2.0 para ambientes development e production
 */

class Salesforce_Auth {
    
    private $environment;
    private $token_cache_key;
    private $instance_url_cache_key;
    
    public function __construct() {
        $this->environment = get_option('salesforce_environment', 'development');
        $this->token_cache_key = "salesforce_token_{$this->environment}";
        $this->instance_url_cache_key = "salesforce_instance_url_{$this->environment}";
    }
    
    /**
     * Obtém access token para o ambiente atual
     */
    public function get_access_token($environment = null) {
        if ($environment) {
            $this->environment = $environment;
            $this->token_cache_key = "salesforce_token_{$environment}";
        }
        
        // Verificar cache primeiro
        $cached_token = get_transient($this->token_cache_key);
        if ($cached_token !== false && is_array($cached_token)) {
            // Verificar se o token ainda é válido (com margem de 5 minutos)
            if (isset($cached_token['expires_at']) && 
                time() < ($cached_token['expires_at'] - 300)) {
                return $cached_token;
            }
        }
        
        // Obter novo token
        return $this->request_new_token();
    }
    
    /**
     * Solicita novo token OAuth 2.0
     */
    private function request_new_token() {
        $credentials = $this->get_credentials();
        
        if (empty($credentials['client_id']) || empty($credentials['client_secret'])) {
            throw new Exception(__('Salesforce credentials not configured.', 'salesforce-products'));
        }
        
        $body = [
            'grant_type' => 'password',
            'client_id' => $credentials['client_id'],
            'client_secret' => $credentials['client_secret'],
            'username' => $credentials['username'],
            'password' => $credentials['password'] . $credentials['security_token']
        ];
        
        $login_url = $this->get_login_url();
        
        $response = wp_remote_post($login_url, [
            'body' => $body,
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/x-www-form-urlencoded'
            ]
        ]);
        
        if (is_wp_error($response)) {
            throw new Exception(
                sprintf(__('Connection error: %s', 'salesforce-products'), 
                        $response->get_error_message())
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        
        if ($response_code !== 200) {
            $error_message = isset($data['error_description']) 
                ? $data['error_description'] 
                : __('Unknown authentication error', 'salesforce-products');
            
            throw new Exception(
                sprintf(__('Authentication failed (%d): %s', 'salesforce-products'), 
                        $response_code, $error_message)
            );
        }
        
        if (!isset($data['access_token']) || !isset($data['instance_url'])) {
            throw new Exception(__('Invalid response from Salesforce.', 'salesforce-products'));
        }
        
        // Define default expiration if missing (1 hour)
        $expires_in = isset($data['expires_in']) ? $data['expires_in'] : 3600;

        // Preparar token para cache
        $token_data = [
            'access_token' => $data['access_token'],
            'instance_url' => $data['instance_url'],
            'issued_at' => time(),
            'expires_at' => time() + $expires_in,
            'token_type' => $data['token_type'],
            'scope' => $data['scope'] ?? '',
            'refresh_token' => $data['refresh_token'] ?? null,
            'environment' => $this->environment
        ];
        
        // Salvar no cache (com duração menor que a do token)
        $cache_duration = min($expires_in - 300, 3600); // 1 hora ou menos
        set_transient($this->token_cache_key, $token_data, $cache_duration);
        
        // Salvar instance_url separadamente
        set_transient($this->instance_url_cache_key, $data['instance_url'], DAY_IN_SECONDS);
        
        // Log de sucesso
        $this->log_auth('success', 'Token obtained successfully');
        
        return $token_data;
    }
    
    /**
     * Obtém URL de login baseada no ambiente
     */
    private function get_login_url() {
        $urls = [
            'development' => 'https://test.salesforce.com/services/oauth2/token',
            'production' => 'https://login.salesforce.com/services/oauth2/token'
        ];
        
        return $urls[$this->environment] ?? $urls['development'];
    }
    
    /**
     * Obtém credentials do ambiente atual
     */
    public function get_credentials($environment = null) {
        $env = $environment ?: $this->environment;
        $credentials = get_option("salesforce_credentials_{$env}", []);
        
        return wp_parse_args($credentials, [
            'client_id' => '',
            'client_secret' => '',
            'username' => '',
            'password' => '',
            'security_token' => ''
        ]);
    }
    
    /**
     * Obtém instance URL (com cache)
     */
    public function get_instance_url() {
        $cached_url = get_transient($this->instance_url_cache_key);
        if ($cached_url !== false) {
            return $cached_url;
        }
        
        // Se não tem cache, precisa de token
        $token = $this->get_access_token();
        return $token['instance_url'];
    }
    
    /**
     * Valida se as credentials estão configuradas
     */
    public function has_credentials($environment = null) {
        $credentials = $this->get_credentials($environment);
        
        return !empty($credentials['client_id']) && 
               !empty($credentials['client_secret']) &&
               !empty($credentials['username']) &&
               !empty($credentials['password']);
    }
    
    /**
     * Limpa tokens do cache
     */
    public function clear_token_cache($environment = null) {
        if ($environment) {
            delete_transient("salesforce_token_{$environment}");
            delete_transient("salesforce_instance_url_{$environment}");
        } else {
            delete_transient("salesforce_token_development");
            delete_transient("salesforce_instance_url_development");
            delete_transient("salesforce_token_production");
            delete_transient("salesforce_instance_url_production");
        }
        
        $this->log_auth('info', 'Token cache cleared');
    }
    
    /**
     * Testa a conexão com as credentials atuais
     */
    public function test_connection($environment = null) {
        try {
            $token = $this->get_access_token($environment);
            
            return [
                'success' => true,
                'environment' => $environment ?: $this->environment,
                'token_data' => [
                    'issued_at' => date('Y-m-d H:i:s', $token['issued_at']),
                    'expires_at' => date('Y-m-d H:i:s', $token['expires_at']),
                    'instance_url' => $token['instance_url']
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'environment' => $environment ?: $this->environment,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Obtém headers de autorização para requisições
     */
    public function get_auth_headers($environment = null) {
        $token = $this->get_access_token($environment);
        
        return [
            'Authorization' => 'Bearer ' . $token['access_token'],
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];
    }
    
    /**
     * Log de atividades de autenticação
     */
    private function log_auth($level, $message) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $wpdb->insert($table_name, [
            'sync_type' => 'auth_' . $level,
            'status' => $level,
            'error_message' => $message,
            'finished_at' => current_time('mysql')
        ]);
    }
    
    /**
     * Obtém status atual da autenticação
     */
    public function get_auth_status() {
        $token_data = get_transient($this->token_cache_key);
        
        if ($token_data === false) {
            return [
                'status' => 'no_token',
                'message' => __('No active token', 'salesforce-products'),
                'environment' => $this->environment
            ];
        }
        
        $time_remaining = $token_data['expires_at'] - time();
        
        if ($time_remaining <= 0) {
            return [
                'status' => 'expired',
                'message' => __('Token expired', 'salesforce-products'),
                'environment' => $this->environment,
                'expired_at' => date('Y-m-d H:i:s', $token_data['expires_at'])
            ];
        }
        
        $hours = floor($time_remaining / 3600);
        $minutes = floor(($time_remaining % 3600) / 60);
        
        return [
            'status' => 'active',
            'message' => sprintf(__('Token valid for %dh %dm', 'salesforce-products'), $hours, $minutes),
            'environment' => $this->environment,
            'issued_at' => date('Y-m-d H:i:s', $token_data['issued_at']),
            'expires_at' => date('Y-m-d H:i:s', $token_data['expires_at'])
        ];
    }
}