<?php
/**
 * REST API Endpoints for Next.js frontend
 */

class Salesforce_REST_Endpoints {
    
    private $product_manager;
    
    public function __construct() {
        $plugin = sf_products_integration();
        $this->product_manager = $plugin->get_product_manager();
        
        add_action('rest_api_init', [$this, 'register_endpoints']);
    }
    
    /**
     * Registra todos os endpoints REST
     */
    public function register_endpoints() {
        // Endpoint de saúde da API
        register_rest_route('salesforce/v1', '/health', [
            'methods' => 'GET',
            'callback' => [$this, 'get_health'],
            'permission_callback' => '__return_true'
        ]);
        
        // Listar todas as categorias
        register_rest_route('salesforce/v1', '/categories', [
            'methods' => 'GET',
            'callback' => [$this, 'get_categories'],
            'permission_callback' => '__return_true'
        ]);
        
        // Obter produtos por categoria
        register_rest_route('salesforce/v1', '/products/category/(?P<slug>[a-zA-Z0-9-_]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_products_by_category'],
            'permission_callback' => '__return_true',
            'args' => [
                'slug' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param) && !empty($param);
                    }
                ],
                'page' => [
                    'default' => 1,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ],
                'per_page' => [
                    'default' => 12,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0 && $param <= 100;
                    }
                ],
                'type' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return in_array($param, ['Óleo', 'Graxa', '']);
                    }
                ],
                'composition' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return in_array($param, ['Mineral', 'Semi-sintético', 'Sintético', '']);
                    }
                ]
            ]
        ]);
        
        // Obter produto individual por SKU
        register_rest_route('salesforce/v1', '/product/(?P<sku>[a-zA-Z0-9-_]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_product'],
            'permission_callback' => '__return_true',
            'args' => [
                'sku' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param) && !empty($param);
                    }
                ]
            ]
        ]);
        
        // Buscar produtos
        register_rest_route('salesforce/v1', '/search', [
            'methods' => 'GET',
            'callback' => [$this, 'search_products'],
            'permission_callback' => '__return_true',
            'args' => [
                's' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param) && strlen($param) >= 2;
                    }
                ],
                'category' => [
                    'required' => false
                ],
                'page' => [
                    'default' => 1
                ],
                'per_page' => [
                    'default' => 10
                ]
            ]
        ]);
        
        // Sitemap de produtos
        register_rest_route('salesforce/v1', '/sitemap', [
            'methods' => 'GET',
            'callback' => [$this, 'get_sitemap'],
            'permission_callback' => '__return_true'
        ]);
        
        // Estatísticas do sistema
        register_rest_route('salesforce/v1', '/stats', [
            'methods' => 'GET',
            'callback' => [$this, 'get_stats'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);
    }
    
    /**
     * Endpoint de saúde
     */
    public function get_health($request) {
        $environment = get_option('salesforce_environment', 'development');
        $last_sync = get_option('salesforce_last_sync', '');
        
        return $this->format_response([
            'status' => 'healthy',
            'timestamp' => current_time('mysql'),
            'environment' => $environment,
            'last_sync' => $last_sync,
            'wordpress_version' => get_bloginfo('version'),
            'plugin_version' => SF_PRODUCTS_VERSION
        ]);
    }
    
    /**
     * Lista categorias
     */
    public function get_categories($request) {
        try {
            $categories = $this->product_manager->get_all_categories();
            
            return $this->format_response($categories);
            
        } catch (Exception $e) {
            return $this->format_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Produtos por categoria
     */
    public function get_products_by_category($request) {
        $slug = $request['slug'];
        $page = (int) $request['page'];
        $per_page = (int) $request['per_page'];
        
        // Preparar filtros
        $filters = [];
        if (!empty($request['type'])) {
            $filters['type'] = $request['type'];
        }
        if (!empty($request['composition'])) {
            $filters['composition'] = $request['composition'];
        }
        
        try {
            $result = $this->product_manager->get_products_by_category($slug, $filters, $page, $per_page);
            
            // Paginação
            $total = $result['totalSize'] ?? 0;
            $total_pages = ceil($total / $per_page);
            
            $response = [
                'category' => [
                    'slug' => $slug,
                    'name' => $this->get_category_name_from_slug($slug),
                    'total_products' => $total
                ],

                'products' => $result['records'] ?? [],
                'pagination' => [
                    'page' => $page,
                    'per_page' => $per_page,
                    'total' => $total,
                    'total_pages' => $total_pages,
                    'has_next' => $page < $total_pages,
                    'has_prev' => $page > 1
                ],
                'filters' => [
                    'active' => $filters,
                    'available' => $this->get_available_filters($slug)
                ],
                'metadata' => [
                    'cached' => !empty($result['cached_at']),
                    'cached_at' => $result['cached_at'] ?? null,
                    'timestamp' => current_time('mysql')
                ]
            ];
            
            return $this->format_response($response);
            
        } catch (Exception $e) {
            return $this->format_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Produto individual
     */
    public function get_product($request) {
        $sku = $request['sku'];
        
        try {
            $product = $this->product_manager->get_product_by_sku($sku);
            
            if (!$product) {
                return $this->format_error('Product not found', 404);
            }
            
            // Verificar se o produto está ativo
            if ($product['EnabledProductB2BCommerce__c'] !== true || 
                $product['IsActive'] !== true) {
                
                $response = [
                    'product' => $product,
                    'status' => 'discontinued',
                    'message' => 'This product is no longer available',
                    'alternatives' => $this->get_alternative_products($sku)
                ];
                
                return $this->format_response($response, 200);
            }
            
            $response = [
                'product' => $product,
                'status' => 'available',
                'metadata' => [
                    'cached' => !empty($product['cached_at']),
                    'cached_at' => $product['cached_at'] ?? null,
                    'timestamp' => current_time('mysql')
                ]
            ];
            
            return $this->format_response($response);
            
        } catch (Exception $e) {
            return $this->format_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Busca de produtos
     */
    public function search_products($request) {
        $search_term = $request['s'];
        $category = $request['category'] ?? '';
        $page = $request['page'];
        $per_page = $request['per_page'];
        
        // Esta é uma implementação básica
        // Em produção, você pode querer usar o Salesforce Search API
        
        try {
            // Buscar todas as categorias
            $categories = $this->product_manager->get_all_categories();
            $results = [];
            
            foreach ($categories['categories'] as $category_data) {
                if (!empty($category) && $category !== $category_data['slug']) {
                    continue;
                }
                
                $products = $this->product_manager->get_products_by_category($category_data['slug']);
                
                foreach ($products['records'] as $product) {
                    $search_in = strtolower(
                        $product['display_name'] . ' ' . 
                        $product['Description'] . ' ' . 
                        $product['Benefits__c']
                    );
                    
                    if (stripos($search_in, strtolower($search_term)) !== false) {
                        $results[] = [
                            'product' => $product,
                            'category' => [
                                'name' => $category_data['name'],
                                'slug' => $category_data['slug']
                            ],
                            'relevance' => $this->calculate_relevance($product, $search_term)
                        ];
                    }
                }
            }
            
            // Ordenar por relevância
            usort($results, function($a, $b) {
                return $b['relevance'] <=> $a['relevance'];
            });
            
            // Paginação
            $total = count($results);
            $total_pages = ceil($total / $per_page);
            $offset = ($page - 1) * $per_page;
            $paginated_results = array_slice($results, $offset, $per_page);
            
            $response = [
                'search' => [
                    'term' => $search_term,
                    'category' => $category,
                    'total_results' => $total
                ],
                'results' => $paginated_results,
                'pagination' => [
                    'page' => $page,
                    'per_page' => $per_page,
                    'total' => $total,
                    'total_pages' => $total_pages
                ],
                'metadata' => [
                    'timestamp' => current_time('mysql')
                ]
            ];
            
            return $this->format_response($response);
            
        } catch (Exception $e) {
            return $this->format_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Sitemap para SEO
     */
    public function get_sitemap($request) {
        try {
            $categories = $this->product_manager->get_all_categories();
            $sitemap = [
                'lastmod' => current_time('c'),
                'urls' => []
            ];
            
            // URLs de categorias
            foreach ($categories['categories'] as $category) {
                $sitemap['urls'][] = [
                    'loc' => home_url('/produtos/' . $category['slug']),
                    'lastmod' => get_option('salesforce_last_sync', current_time('c')),
                    'changefreq' => 'daily',
                    'priority' => 0.8
                ];
            }
            
            // URLs de produtos (limitado para não sobrecarregar)
            // Em produção, você pode querer gerar isso incrementalmente
            $sample_category = $categories['categories'][0]['slug'] ?? '';
            if ($sample_category) {
                $products = $this->product_manager->get_products_by_category($sample_category);
                foreach (array_slice($products['records'] ?? [], 0, 50) as $product) {
                    $sitemap['urls'][] = [
                        'loc' => home_url('/produto/' . $product['StockKeepingUnit']),
                        'lastmod' => $product['LastModifiedDate'] ?? current_time('c'),
                        'changefreq' => 'weekly',
                        'priority' => 0.5
                    ];
                }
            }
            
            return $this->format_response($sitemap);
            
        } catch (Exception $e) {
            return $this->format_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Estatísticas do sistema
     */
    public function get_stats($request) {
        try {
            $stats = $this->product_manager->get_stats();
            
            return $this->format_response($stats);
            
        } catch (Exception $e) {
            return $this->format_error($e->getMessage(), 500);
        }
    }
    
    /**
     * Funções auxiliares
     */
    private function get_category_name_from_slug($slug) {
        $categories = $this->product_manager->get_all_categories();
        
        foreach ($categories['categories'] as $category) {
            if ($category['slug'] === $slug) {
                return $category['name'];
            }
        }
        
        return '';
    }
    
    private function get_available_filters($slug) {
        // Implementar lógica para determinar filtros disponíveis
        // baseado nos produtos da categoria
        return [
            'type' => ['Óleo', 'Graxa'],
            'composition' => ['Mineral', 'Semi-sintético', 'Sintético']
        ];
    }
    
    private function get_alternative_products($sku) {
        // Buscar produtos da mesma categoria
        $product = $this->product_manager->get_product_by_sku($sku);
        if (!$product || empty($product['ProductApplication__c'])) {
            return [];
        }
        
        $category_slug = sanitize_title($product['ProductApplication__c']);
        $products = $this->product_manager->get_products_by_category($category_slug);
        
        // Filtrar produtos ativos e diferentes do atual
        $alternatives = [];
        foreach ($products['records'] as $alt_product) {
            if ($alt_product['StockKeepingUnit'] !== $sku &&
                $alt_product['EnabledProductB2BCommerce__c'] === true &&
                $alt_product['IsActive'] === true) {
                
                $alternatives[] = [
                    'sku' => $alt_product['StockKeepingUnit'],
                    'name' => $alt_product['display_name'],
                    'url' => $alt_product['url'],
                    'description' => wp_trim_words($alt_product['Description'], 15)
                ];
                
                if (count($alternatives) >= 3) {
                    break;
                }
            }
        }
        
        return $alternatives;
    }
    
    private function calculate_relevance($product, $search_term) {
        $relevance = 0;
        $search_term = strtolower($search_term);
        
        // Nome do produto (maior peso)
        if (stripos(strtolower($product['display_name']), $search_term) !== false) {
            $relevance += 10;
        }
        
        // Descrição
        if (stripos(strtolower($product['Description']), $search_term) !== false) {
            $relevance += 5;
        }
        
        // Benefícios
        if (!empty($product['Benefits__c']) && 
            stripos(strtolower($product['Benefits__c']), $search_term) !== false) {
            $relevance += 3;
        }
        
        // SKU exato (maior peso)
        if (strtolower($product['StockKeepingUnit']) === $search_term) {
            $relevance += 15;
        }
        
        return $relevance;
    }
    
    /**
     * Formata resposta padrão
     */
    private function format_response($data, $status = 200) {
        return new WP_REST_Response([
            'success' => true,
            'data' => $data,
            'meta' => [
                'timestamp' => current_time('mysql'),
                'api_version' => 'v1',
                'environment' => get_option('salesforce_environment', 'development')
            ]
        ], $status);
    }
    
    /**
     * Formata erro
     */
    private function format_error($message, $status = 500) {
        return new WP_REST_Response([
            'success' => false,
            'error' => [
                'code' => $status,
                'message' => $message
            ],
            'meta' => [
                'timestamp' => current_time('mysql')
            ]
        ], $status);
    }
}

// Inicializar endpoints
new Salesforce_REST_Endpoints();