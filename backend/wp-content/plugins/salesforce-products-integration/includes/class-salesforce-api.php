<?php
/**
 * Salesforce API Client
 * Gerencia todas as chamadas à API do Salesforce
 */

class Salesforce_API {
    
    private $auth;
    private $version = 'v64.0';
    private $last_response;
    private $rate_limit_remaining;
    private $rate_limit_reset;
    private $rate_limit_total;
    
    public function __construct($auth) {
        $this->auth = $auth;
    }
    
    /**
     * Executa query SOQL
     */
    public function query($soql, $all_records = false) {
        $url = $this->build_query_url($soql);
        $results = [];
        
        do {
            $response = $this->make_request('GET', $url);
            
            if (!isset($response['records'])) {
                throw new Exception(__('Invalid response format from Salesforce.', 'salesforce-products'));
            }
            
            $results = array_merge($results, $response['records']);
            
            $url = isset($response['nextRecordsUrl']) 
                 ? $response['nextRecordsUrl'] 
                 : null;
                 
        } while ($all_records && $url);
        
        return [
            'totalSize' => $response['totalSize'] ?? count($results),
            'done' => true,
            'records' => $results
        ];
    }
    
    /**
     * Busca todos os produtos ativos para sincronização
     */
    public function get_all_products() {
        $query = urlencode(
            "SELECT " . $this->get_product_fields() . " 
             FROM Product2 
             WHERE EnabledProductB2BCommerce__c = true"
        );
        
        return $this->query("q=$query", true);
    }
    
    /**
     * Busca produto por SKU
     */
    public function get_product_by_sku($sku) {
        $query = urlencode(
            "SELECT " . $this->get_product_fields() . " 
             FROM Product2 
             WHERE EnabledProductB2BCommerce__c = true 
             AND StockKeepingUnit = '$sku' 
             LIMIT 1"
        );
        
        $result = $this->query("q=$query");
        
        if (empty($result['records'])) {
            return null;
        }
        
        return $this->format_product_data($result['records'][0]);
    }
    
    /**
     * Busca produtos por aplicação
     */
        public function get_products_by_application($application, $filters = [], $page = 1, $per_page = 12) {
        $where_clauses = [
            "EnabledProductB2BCommerce__c = true",
            "ProductApplication__c = '$application'"
        ];
        $offset = ($page - 1) * $per_page;

        if (!empty($filters['type'])) {
            $where_clauses[] = "Grease__c = '{$filters['type']}'";
        }
        
        if (!empty($filters['composition'])) {
            $where_clauses[] = "IndustryClassifications__c = '{$filters['composition']}'";
        }
        
        $where = implode(' AND ', $where_clauses);
        $query = urlencode(
            "SELECT " . $this->get_product_fields() . " 
             FROM Product2 
             WHERE $where 
             ORDER BY B2BProductName__c
             LIMIT $per_page
             OFFSET $offset"
        );
        
        $result = $this->query("q=$query", false);
        
        $result = $this->query("q=$query", true);
        
        $result['records'] = array_map([$this, 'format_product_data'], $result['records']);
        
        return $result;
    }
    
    /**
     * Busca todas as aplicações (categorias) únicas
     */
    public function get_all_applications() {
        $query = urlencode(
            "SELECT DISTINCT ProductApplication__c 
             FROM Product2 
             WHERE EnabledProductB2BCommerce__c = true 
             AND ProductApplication__c != null 
             ORDER BY ProductApplication__c"
        );
        
        $result = $this->query("q=$query", true);
        
        $applications = [];
        foreach ($result['records'] as $record) {
            if (!empty($record['ProductApplication__c'])) {
                $applications[] = [
                    'api_name' => $record['ProductApplication__c'],
                    'name' => $this->format_application_name($record['ProductApplication__c']),
                    'slug' => sanitize_title($record['ProductApplication__c']),
                    'count' => $this->count_products_by_application($record['ProductApplication__c'])
                ];
            }
        }
        
        return $applications;
    }
    
    /**
     * Conta produtos por aplicação
     */
     public function count_products_by_application($application, $filters = []) {
        $where_clauses = [
            "EnabledProductB2BCommerce__c = true",
            "ProductApplication__c = '$application'"
        ];

        // Aplicar filtros
        if (!empty($filters['type'])) {
            $where_clauses[] = "Grease__c = '{$filters['type']}'";
        }
        
        if (!empty($filters['composition'])) {
            $where_clauses[] = "IndustryClassifications__c = '{$filters['composition']}'";
        }

        $where = implode(' AND ', $where_clauses);

        $query = urlencode(
            "SELECT COUNT(Id) 
             FROM Product2 
              WHERE $where"
        );
        
        $result = $this->query("q=$query");
        
        return $result['records'][0]['expr0'] ?? 0;
    }
    
    /**
     * Busca produtos modificados desde uma data
     */
    public function get_modified_products_since($datetime) {
        $formatted_date = $this->format_date_for_soql($datetime);
        
        $query = urlencode(
            "SELECT Id, StockKeepingUnit, LastModifiedDate 
             FROM Product2 
             WHERE EnabledProductB2BCommerce__c = true 
             AND LastModifiedDate > $formatted_date"
        );
        
        return $this->query("q=$query", true);
    }
    
    /**
     * Testa a conexão com uma query simples
     */
    public function test_connection() {
        try {
            $query = urlencode("SELECT Id FROM Product2 LIMIT 1");
            $result = $this->query("q=$query");
            
            return [
                'success' => true,
                'records_found' => $result['totalSize'] ?? 0,
                'api_version' => $this->version,
                'rate_limit' => $this->get_rate_limit_info()
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Formata nome da aplicação para exibição
     */
    private function format_application_name($api_name) {
        // Converter "MOTOR_DE_MOTOS" para "Motor de Motos"
        $name = str_replace('_', ' ', $api_name);
        $name = ucwords(strtolower($name));
        
        // Correções específicas
        $corrections = [
            'Api' => 'API',
            'Www' => 'WWW',
            'Url' => 'URL',
            'Hp' => 'HP',
            'Rpm' => 'RPM'
        ];
        
        foreach ($corrections as $wrong => $correct) {
            $name = str_replace($wrong, $correct, $name);
        }
        
        return $name;
    }
    
    /**
     * Formata dados do produto
     */
    private function format_product_data($product_data) {
        if (empty($product_data['API__c']) && !empty($product_data['API__C'])) {
            $product_data['API__c'] = $product_data['API__C'];
        }

        // Processar campos HTML
        if (!empty($product_data['StatusFormula__c'])) {
            $product_data['StatusFormula__c'] = $this->sanitize_html($product_data['StatusFormula__c']);
        }
        
        if (!empty($product_data['Description'])) {
            $product_data['Description'] = html_entity_decode($product_data['Description'], ENT_QUOTES | ENT_HTML5);
        }
        
        // Processar lista de produtos relacionados
        if (!empty($product_data['RelatedProducts__c'])) {
            $related = explode(';', $product_data['RelatedProducts__c']);
            $product_data['RelatedProducts'] = array_map('trim', $related);
        } else {
            $product_data['RelatedProducts'] = [];
        }
        
        // Adicionar URLs amigáveis
        $product_data['url'] = '/produto/' . $product_data['StockKeepingUnit'];
        $product_data['category_url'] = '/produtos/' . sanitize_title($product_data['ProductApplication__c']);
        
        $raw_name = !empty($product_data['B2BProductName__c']) 
            ? $product_data['B2BProductName__c'] 
            : $product_data['Name'];
        $display_name = html_entity_decode($raw_name, ENT_QUOTES | ENT_HTML5);
        $product_data['display_name'] = trim($display_name, " \t\n\r\0\x0B\"'");

        return $product_data;
    }
    
    /**
     * Sanitiza HTML do Salesforce
     */
    private function sanitize_html($html) {
        $allowed_html = [
            'img' => [
                'src' => true,
                'alt' => true,
                'style' => true,
                'border' => true,
                'height' => true,
                'width' => true
            ],
            'span' => ['style' => true],
            'div' => ['style' => true],
            'p' => ['style' => true],
            'br' => [],
            'strong' => [],
            'em' => [],
            'u' => [],
            'ul' => [],
            'ol' => [],
            'li' => []
        ];
        
        return wp_kses($html, $allowed_html);
    }
    
    /**
     * Lista de campos do produto para queries
     */
    private function get_product_fields() {
        return implode(', ', [
            'Id',
            'Name',
            'B2BProductName__c',
            'Description',
            'StockKeepingUnit',
            'ProductApplication__c',
            'IndustryClassifications__c',
            'Grease__c',
            'Viscosity__c',
            'Benefits__c',
            'B2BPackage__c',
            'MeetsOrExceeds__c',
            'Recommendation__c',
            'API__c',
            'Approvals__c',
            'RelatedProducts__c',
            'B2BSEOTitle__c',
            'B2BSEODescription__c',
            'B2BSEOKeywords__c',
            'StatusFormula__c',
            'IsActive',
            'EnabledProductB2BCommerce__c',
            'LastModifiedDate',
            'SystemModstamp',
            'CreatedDate'
        ]);
    }
    
    /**
     * Formata data para SOQL
     */
    private function format_date_for_soql($datetime) {
        $date = new DateTime($datetime, new DateTimeZone('UTC'));
        return $date->format('Y-m-d\TH:i:s\Z');
    }
    
    /**
     * Constrói URL para query
     */
    private function build_query_url($soql) {
        $instance_url = $this->auth->get_instance_url();
        return $instance_url . "/services/data/{$this->version}/query/?{$soql}";
    }
    
    /**
     * Faz requisição à API
     */
    private function make_request($method, $url, $body = null) {
        $headers = $this->auth->get_auth_headers();
        
        $args = [
            'method' => $method,
            'headers' => $headers,
            'timeout' => 30,
            'redirection' => 5,
            'httpversion' => '1.1',
            'blocking' => true
        ];
        
        if ($body) {
            $args['body'] = json_encode($body);
        }
        
        $response = wp_remote_request($url, $args);
        $this->last_response = $response;
        
        // Extrair informações de rate limiting
        $this->extract_rate_limit_info($response);
        
        if (is_wp_error($response)) {
            throw new Exception(
                sprintf(__('API request failed: %s', 'salesforce-products'), 
                        $response->get_error_message())
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $data = json_decode($response_body, true);
        
        // Tratar erros comuns
        if ($response_code === 401) {
            // Token expirado - limpar cache e tentar novamente
            $this->auth->clear_token_cache();
            throw new Exception(__('Authentication expired. Please try again.', 'salesforce-products'));
        }
        
        if ($response_code === 429) {
            // Rate limit excedido
            $reset_time = $this->rate_limit_reset ?? time() + 60;
            $wait_time = $reset_time - time();
            
            throw new Exception(
                sprintf(__('Rate limit exceeded. Please wait %d seconds.', 'salesforce-products'), 
                        $wait_time)
            );
        }
        
        if ($response_code !== 200 && $response_code !== 201) {
            $error_message = $this->parse_error_response($data, $response_code);
            throw new Exception($error_message);
        }
        
        return $data;
    }
    
    /**
     * Extrai informações de rate limiting dos headers
     */
    private function extract_rate_limit_info($response) {
        $headers = wp_remote_retrieve_headers($response);
        
        if (isset($headers['Sforce-Limit-Info'])) {
            $limit_info = $headers['Sforce-Limit-Info'];
            if (preg_match('/api-usage=(\d+)\/(\d+)/', $limit_info, $matches)) {
                $this->rate_limit_remaining = (int)$matches[1];
                $this->rate_limit_total = (int)$matches[2];
            }
        }
        
        if (isset($headers['Sforce-Limit-Reset'])) {
            $this->rate_limit_reset = time() + (int)$headers['Sforce-Limit-Reset'];
        }
    }
    
    /**
     * Obtém informações de rate limiting
     */
    public function get_rate_limit_info() {
        return [
            'remaining' => $this->rate_limit_remaining,
            'reset' => $this->rate_limit_reset ? date('Y-m-d H:i:s', $this->rate_limit_reset) : null
        ];
    }
    
    /**
     * Parse de mensagens de erro da API
     */
    private function parse_error_response($data, $response_code) {
        if (isset($data[0]['message'])) {
            return sprintf(__('Salesforce API Error (%d): %s', 'salesforce-products'), 
                          $response_code, $data[0]['message']);
        }
        
        if (isset($data['message'])) {
            return sprintf(__('Salesforce API Error (%d): %s', 'salesforce-products'), 
                          $response_code, $data['message']);
        }
        
        return sprintf(__('Salesforce API Error (%d): Unknown error', 'salesforce-products'), 
                      $response_code);
    }
    
    /**
     * Obtém a última resposta da API
     */
    public function get_last_response() {
        return $this->last_response;
    }
}