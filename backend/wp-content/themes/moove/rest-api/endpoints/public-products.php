<?php
/**
 * Endpoint Público: Produtos por Categoria
 * 
 * Retorna uma lista de categorias ativas, cada uma contendo seus respectivos produtos.
 * 
 * URL: GET /wp-json/moove/v1/product/categorized
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'rest_api_init', function () {
    register_rest_route( 'moove/v1', '/product/categorized', array(
        'methods'             => 'GET',
        'callback'            => 'moove_get_products_by_category',
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'moove/v1', '/product/(?P<id>[^/]+)', array(
        'methods'             => 'GET',
        'callback'            => 'moove_get_product_unified',
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'moove/v1', '/applications', array(
        'methods'             => 'GET',
        'callback'            => 'moove_get_applications',
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'moove/v1', '/products/by-application/(?P<slug>[^/]+)', array(
        'methods'             => 'GET',
        'callback'            => 'moove_get_products_by_application',
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'moove/v1', '/products/by-industries-segment-term', array(
        'methods'             => 'GET',
        'callback'            => 'moove_get_products_by_industries_segment_term',
        'permission_callback' => '__return_true',
    ) );

    register_rest_route( 'moove/v1', '/products/by-segment/(?P<slug>[a-zA-Z0-9_-]+)', array(
        'methods'             => 'GET',
        'callback'            => 'moove_get_products_by_segment_slug',
        'permission_callback' => '__return_true',
        'args'                => array(
            'slug'      => array( 'required' => true, 'sanitize_callback' => 'sanitize_text_field' ),
            'per_page'  => array( 'required' => false, 'sanitize_callback' => 'absint', 'default' => 8 ),
        ),
    ) );
} );

function moove_normalize_industries_segment_term_ids( $raw_value ) {
    if ( empty( $raw_value ) ) {
        return array();
    }

    if ( is_string( $raw_value ) ) {
        $decoded = maybe_unserialize( $raw_value );
        if ( $decoded !== $raw_value ) {
            $raw_value = $decoded;
        }
    }

    if ( ! is_array( $raw_value ) ) {
        $raw_value = array( $raw_value );
    }

    $term_ids = array();

    foreach ( $raw_value as $item ) {
        if ( is_array( $item ) ) {
            if ( isset( $item['term_id'] ) ) {
                $term_ids[] = absint( $item['term_id'] );
                continue;
            }

            if ( isset( $item['id'] ) ) {
                $term_ids[] = absint( $item['id'] );
                continue;
            }
        }

        $term_ids[] = absint( $item );
    }

    return array_values( array_filter( array_unique( $term_ids ) ) );
}

function moove_get_products_by_industries_segment_term( $request ) {
    $term_ids_param = $request->get_param( 'term_ids' );
    $limit = absint( $request->get_param( 'limit' ) );

    if ( empty( $term_ids_param ) ) {
        $term_ids_param = $request->get_param( 'term_id' );
    }

    if ( is_string( $term_ids_param ) ) {
        $term_ids_param = preg_split( '/[;,]/', $term_ids_param, -1, PREG_SPLIT_NO_EMPTY );
    }

    if ( ! is_array( $term_ids_param ) ) {
        $term_ids_param = array( $term_ids_param );
    }

    $target_term_ids = array_values(
        array_filter(
            array_unique(
                array_map( 'absint', $term_ids_param )
            )
        )
    );

    if ( empty( $target_term_ids ) ) {
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => array(
                'products' => array(),
            ),
        ), 200 );
    }

    // Cache por 10 minutos para evitar scan O(N) em cada request
    sort( $target_term_ids );
    $cache_key  = 'moove_prod_by_seg_' . md5( implode( ',', $target_term_ids ) . '_' . $limit );
    $cache_time = 10 * MINUTE_IN_SECONDS;
    $cached     = get_transient( $cache_key );

    if ( false !== $cached ) {
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => array(
                'products' => $cached,
            ),
            'meta'    => array(
                'cache'     => 'HIT',
                'timestamp' => current_time( 'mysql' ),
            ),
        ), 200 );
    }

    $post_ids = get_posts( array(
        'post_type'              => 'produtos',
        'post_status'            => 'publish',
        'numberposts'            => -1,
        'ignore_sticky_posts'    => true,
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => false,
        'fields'                 => 'ids',
    ) );

    $products = array();

    foreach ( $post_ids as $post_id ) {
        $raw_terms = function_exists( 'get_field' )
            ? get_field( 'industries_segment_term', $post_id, false )
            : get_post_meta( $post_id, 'industries_segment_term', true );

        $product_term_ids = moove_normalize_industries_segment_term_ids( $raw_terms );

        if ( empty( $product_term_ids ) || ! array_intersect( $target_term_ids, $product_term_ids ) ) {
            continue;
        }

        $product_data = moove_get_product_sf_data( $post_id );
        $product_data['title'] = get_the_title( $post_id );
        $product_data['sku'] = get_post_meta( $post_id, '_salesforce_sku', true );
        $product_data['acf'] = function_exists( 'get_fields' ) ? ( get_fields( $post_id ) ?: array() ) : array();

        $products[] = $product_data;

        if ( $limit > 0 && count( $products ) >= $limit ) {
            break;
        }
    }

    set_transient( $cache_key, $products, $cache_time );

    return new WP_REST_Response( array(
        'success' => true,
        'data'    => array(
            'products' => $products,
        ),
        'meta'    => array(
            'cache'     => 'MISS',
            'timestamp' => current_time( 'mysql' ),
        ),
    ), 200 );
}

function moove_get_products_by_category( $request ) {
    // 1. Definições de Cache (Performance)
    $cache_key = 'moove_products_categorized_list';
    $cache_time = 10 * 60; // 10 minutos
    
    // Tenta recuperar do cache
    $cached = get_transient( $cache_key );
    if ( $cached ) {
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => $cached,
            'meta'    => array(
                'cache' => 'HIT',
                'timestamp' => current_time( 'mysql' )
            )
        ), 200 );
    }

    $post_type = 'produtos'; 
    $taxonomy  = 'segmento';

    // Fallback para posts padrão se não houver CPT de produtos configurado ainda
    if ( ! post_type_exists( $post_type ) ) {
        $post_type = 'post';
        $taxonomy  = 'category';
    }

    // 3. Buscar Categorias (Termos)
    $terms = get_terms( array(
        'taxonomy'   => $taxonomy,
        'hide_empty' => true,
        'orderby'    => 'name',
        'order'      => 'ASC',
    ) );

    if ( is_wp_error( $terms ) ) {
        return new WP_Error( 'term_error', 'Erro ao buscar categorias', array( 'status' => 500 ) );
    }

    $response_data = array();

    // 4. Loop por Categoria para buscar Produtos
    foreach ( $terms as $term ) {
        
        $products_query = new WP_Query( array(
            'post_type'      => $post_type,
            'posts_per_page' => 6, // Limite de produtos por categoria (vitrine)
            'post_status'    => 'publish',
            'tax_query'      => array(
                array(
                    'taxonomy' => $taxonomy,
                    'field'    => 'term_id',
                    'terms'    => $term->term_id,
                ),
            ),
            'fields' => 'ids'
        ) );

        if ( $products_query->have_posts() ) {
            $products_list = array();

            foreach ( $products_query->posts as $post_id ) {
                $image_url = get_the_post_thumbnail_url( $post_id, 'medium_large' );
                
                $price = function_exists('get_field') ? get_field( 'price', $post_id ) : null;

                $products_list[] = array(
                    'id'        => $post_id,
                    'title'     => get_the_title( $post_id ),
                    'slug'      => get_post_field( 'post_name', $post_id ),
                    'image'     => $image_url ? $image_url : null,
                    'price'     => $price,
                    'permalink' => get_permalink( $post_id ),
                );
            }

            $response_data[] = array(
                'category_id'   => $term->term_id,
                'category_name' => $term->name,
                'category_slug' => $term->slug,
                'products'      => $products_list
            );
        }
    }

    // 5. Salva no Cache
    set_transient( $cache_key, $response_data, $cache_time );

    // 6. Retorno Final
    return new WP_REST_Response( array(
        'success' => true,
        'data'    => $response_data,
        'meta'    => array(
            'cache' => 'MISS',
            'timestamp' => current_time( 'mysql' )
        )
    ), 200 );
}

/**
 * Busca produto unificada (Slug ou SKU)
 */
function moove_get_product_unified( $request ) {
    $param = $request->get_param( 'id' );

    $args = array(
        'name'        => $param,
        'post_type'   => 'produtos',
        'post_status' => 'publish',
        'numberposts' => 1
    );
    $posts = get_posts( $args );

    if ( empty( $posts ) ) {
        $args_sku = array(
            'meta_key'    => '_salesforce_sku',
            'meta_value'  => $param,
            'post_type'   => 'produtos',
            'post_status' => 'publish',
            'numberposts' => 1
        );
        $posts = get_posts( $args_sku );
    }

    if ( empty( $posts ) ) {
        return new WP_Error( 'no_product', 'Produto não encontrado', array( 'status' => 404 ) );
    }

    return moove_format_single_product_response( $posts[0] );
}

function moove_format_single_product_response( $post ) {
    $post_id = $post->ID;
    
    // Recupera dados do Salesforce
    $sf_data = moove_get_product_sf_data( $post_id );

    $acf_fields = function_exists('get_fields') ? get_fields($post_id) : [];

    $fc_field = null;
    if (isset($acf_fields['blocks']) && is_array($acf_fields['blocks'])) {
        $fc_field = 'blocks';
    } elseif (isset($acf_fields['product_content_blocks']) && is_array($acf_fields['product_content_blocks'])) {
        $fc_field = 'product_content_blocks';
    }

    if ($fc_field) {
        $processed_blocks = [];
        foreach ($acf_fields[$fc_field] as $layout) {
            // Hidratação do bloco related_products (Manual)
            if ( $layout['acf_fc_layout'] === 'related_products' ) {
                if ( ! empty( $layout['list'] ) && is_array( $layout['list'] ) ) {
                    $hydrated_list = [];
                    foreach ( $layout['list'] as $item_id ) {
                        // Frontend espera: item.extended_data.sf
                        $hydrated_list[] = array(
                            'extended_data' => array(
                                'sf' => moove_get_product_sf_data( $item_id )
                            )
                        );
                    }
                    $layout['list'] = $hydrated_list;
                }
            }

            $processed_blocks[] = [
                'type' => $layout['acf_fc_layout'], 
                'data' => $layout,                  
            ];
        }

        $acf_fields['blocks'] = $processed_blocks;
        if ($fc_field !== 'blocks') {
            unset($acf_fields[$fc_field]);
        }
    }

    // Busca produtos relacionados automáticos (via Salesforce RelatedProducts__c)
    $related_products = [];
    // Tenta pegar de RelatedProducts__c (string) ou related_products (array já processado pelo proxy)
    $related_skus_source = !empty($sf_data['RelatedProducts__c']) ? $sf_data['RelatedProducts__c'] : (!empty($sf_data['related_products']) ? $sf_data['related_products'] : []);

    if ( ! empty( $related_skus_source ) && ( is_string($related_skus_source) || is_array($related_skus_source) ) ) {

        // Normalização robusta: Garante array e trata strings com separadores mistos
        $related_skus_temp = is_array($related_skus_source) ? $related_skus_source : preg_split( '/[;,]/', $related_skus_source, -1, PREG_SPLIT_NO_EMPTY );
        
        $related_skus = [];
        foreach ($related_skus_temp as $sku) {
            // Converte para string para garantir processamento (caso venha como int do JSON)
            $sku_str = (string) $sku;
            // Caso o array venha com strings contendo separadores (ex: falha anterior no proxy)
            $parts = preg_split( '/[;,]/', $sku_str, -1, PREG_SPLIT_NO_EMPTY );
            foreach ($parts as $part) {
                $related_skus[] = trim($part);
            }
        }
        $related_skus = array_unique(array_filter($related_skus));

        if ( is_array( $related_skus ) && ! empty( $related_skus ) ) {
            $post_type = post_type_exists('produtos') ? 'produtos' : 'post';
            $related_posts = get_posts( array(
                'post_type'   => $post_type,
                'post_status' => 'publish',
                'numberposts' => 4,
                'ignore_sticky_posts' => true,
                'suppress_filters' => false,
                'meta_query'  => array(
                    array(
                        'key'     => '_salesforce_sku',
                        'value'   => $related_skus,
                        'compare' => 'IN'
                    )
                ),
                'fields' => 'ids'
            ) );

            foreach ( $related_posts as $r_id ) {
                $p_data = moove_get_product_sf_data( $r_id );

                if (empty($p_data['id'])) $p_data['id'] = $r_id;

                if (isset($p_data['related_products'])) unset($p_data['related_products']);
                if (isset($p_data['RelatedProducts__c'])) unset($p_data['RelatedProducts__c']);
                
                $related_products[] = $p_data;
            }
        }
    }
   
    if (is_array($sf_data)) {
        unset($sf_data['related_products']);
        unset($sf_data['RelatedProducts__c']);
    }

    $final_response_data = is_array($sf_data) ? $sf_data : [];
        
    $final_response_data['id'] = $post_id;
    $final_response_data['title'] = get_the_title( $post_id );
    $final_response_data['slug'] = $post->post_name;
    $final_response_data['sku'] = get_post_meta($post_id, '_salesforce_sku', true);
    $final_response_data['acf'] = $acf_fields;
    
    $final_response_data['related_products'] = $related_products;
    $final_response_data['_debug_ts'] = time();

    return new WP_REST_Response( array(
        'success' => true,
        'data'    => $final_response_data
    ), 200 );
}

/**
 * Helper para recuperar e formatar dados do Salesforce de um produto
 */
function moove_get_product_sf_data( $post_id ) {
    // Tenta pegar o JSON completo do Salesforce salvo no meta (ajuste a chave conforme sua integração)
    $sf_data = get_post_meta( $post_id, '_salesforce_raw_data', true );
    
    if ( ! is_array( $sf_data ) ) {
        $sf_data = json_decode( $sf_data, true );
    }
    if ( ! is_array( $sf_data ) ) {
        $sf_data = array();
    }

    $sf_data['id'] = $post_id;
    $sf_data['slug'] = get_post_field( 'post_name', $post_id );
    if ( has_post_thumbnail( $post_id ) ) {
        $sf_data['image'] = get_the_post_thumbnail_url( $post_id, 'medium_large' );
    }

    if ( empty( $sf_data['B2BProductName__c'] ) ) {
        $sf_data['B2BProductName__c'] = get_the_title( $post_id );
    }

    if ( empty( $sf_data['Viscosity__c'] ) ) {
        $sf_data['Viscosity__c'] = get_post_meta( $post_id, '_salesforce_viscosity', true );
    }
    if ( empty( $sf_data['Description'] ) ) {
        $sf_data['Description'] = get_post_meta( $post_id, '_salesforce_description', true );
    }

    // Normaliza campos que podem chegar com variação de chave/capitalização.
    if ( empty( $sf_data['API__c'] ) ) {
        if ( ! empty( $sf_data['API__C'] ) ) {
            $sf_data['API__c'] = $sf_data['API__C'];
        } else {
            $sf_data['API__c'] = get_post_meta( $post_id, '_salesforce_api', true );
        }
    }

    if ( empty( $sf_data['Approvals__c'] ) ) {
        $sf_data['Approvals__c'] = get_post_meta( $post_id, '_salesforce_approvals', true );
    }

    $terms = get_the_terms( $post_id, 'segmento' );
    if ( $terms && ! is_wp_error( $terms ) ) {
        $sf_data['category_slug'] = $terms[0]->slug;
    } else {
        $sf_data['category_slug'] = '';
    }
    $sf_data['segments'] = $terms && ! is_wp_error( $terms )
        ? array_map(
            function( $term ) {
                return $term->slug;
            },
            $terms
        )
        : array();

    // Aplicações (do WP, não do SF - cliente pediu para ignorar ProductApplication__c)
    $application_terms = get_the_terms( $post_id, 'aplicacoes' );
    $applications = array();
    if ( $application_terms && ! is_wp_error( $application_terms ) ) {
        foreach ( $application_terms as $term ) {
            $applications[] = $term->slug;
        }
    }
    $sf_data['applications'] = $applications;

    $sku = get_post_meta( $post_id, '_salesforce_sku', true );
    $sf_data['variations'] = array(
        array(
            'sku'       => $sku,
            'viscosity' => isset( $sf_data['Viscosity__c'] ) ? $sf_data['Viscosity__c'] : '',
            'packing'   => isset( $sf_data['Packing__c'] ) ? $sf_data['Packing__c'] : '',
        )
    );

    return $sf_data;
}

/**
 * Endpoint: Listar todas as aplicações disponíveis
 * URL: GET /wp-json/moove/v1/applications
 */
function moove_get_applications( $request ) {
    // Cache
    $cache_key = 'moove_applications_list';
    $cache_time = 24 * 60 * 60; // 24 horas
    
    $cached = get_transient( $cache_key );
    if ( $cached ) {
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => $cached,
            'meta'    => array(
                'cache' => 'HIT',
                'timestamp' => current_time( 'mysql' )
            )
        ), 200 );
    }

    $applications = array();

    // 1. Tenta buscar da taxonomia "aplicacoes" se existir
    $taxonomy = 'aplicacoes';
    if ( taxonomy_exists( $taxonomy ) ) {
        $terms = get_terms( array(
            'taxonomy'   => $taxonomy,
            'hide_empty' => true,
            'orderby'    => 'name',
            'order'      => 'ASC',
        ) );

        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            foreach ( $terms as $term ) {
                $applications[] = array(
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'count' => $term->count,
                );
            }
        }
    }

    // 2. Se não houver taxonomia, tenta extrair do CPT de produtos (fallback)
    if ( empty( $applications ) && post_type_exists( 'produtos' ) ) {
        $products = get_posts( array(
            'post_type'      => 'produtos',
            'post_status'    => 'publish',
            'posts_per_page' => 200,
            'fields'         => 'ids',
        ) );

        $app_list = array();
        foreach ( $products as $product_id ) {
            $sf_data = moove_get_product_sf_data( $product_id );
            if ( ! empty( $sf_data['ProductApplication__c'] ) ) {
                $app = trim( $sf_data['ProductApplication__c'] );
                if ( $app ) {
                    $app_list[ $app ] = isset( $app_list[ $app ] ) ? $app_list[ $app ] + 1 : 1;
                }
            }
        }

        foreach ( $app_list as $app_name => $count ) {
            $applications[] = array(
                'name'  => $app_name,
                'slug'  => sanitize_title( $app_name ),
                'count' => $count,
            );
        }

        // Ordena alfabeticamente
        usort( $applications, function( $a, $b ) {
            return strcmp( $a['name'], $b['name'] );
        } );
    }

    // Cache
    set_transient( $cache_key, $applications, $cache_time );

    return new WP_REST_Response( array(
        'success' => true,
        'data'    => $applications,
        'meta'    => array(
            'cache'     => 'MISS',
            'timestamp' => current_time( 'mysql' ),
            'total'     => count( $applications ),
        )
    ), 200 );
}

/**
 * Endpoint: Buscar todos os produtos de uma aplicação específica
 * URL: GET /wp-json/moove/v1/products/by-application/{slug}
 * 
 * Retorna a lista de SKUs dos produtos relacionados a uma aplicação,
 * buscando pela taxonomia 'aplicacoes' do WP.
 */
function moove_get_products_by_application( $request ) {
    $app_slug = $request->get_param( 'slug' );
    
    if ( empty( $app_slug ) ) {
        return new WP_Error( 'missing_slug', 'Application slug é obrigatório', array( 'status' => 400 ) );
    }

    // Cache
    $cache_key = 'moove_products_app_' . sanitize_text_field( $app_slug );
    $cache_time = 24 * 60 * 60; // 24 horas
    
    $cached = get_transient( $cache_key );
    if ( $cached ) {
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => $cached,
            'meta'    => array(
                'cache' => 'HIT',
                'timestamp' => current_time( 'mysql' )
            )
        ), 200 );
    }

    // 1. Busca posts do WP vinculados à aplicação
    $post_type = post_type_exists( 'produtos' ) ? 'produtos' : 'post';
    $posts = get_posts( array(
        'post_type'      => $post_type,
        'post_status'    => 'publish',
        'posts_per_page' => -1, // Todos os posts
        'tax_query'      => array(
            array(
                'taxonomy' => 'aplicacoes',
                'field'    => 'slug',
                'terms'    => $app_slug,
            ),
        ),
        'fields' => 'ids'
    ) );

    if ( empty( $posts ) ) {
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => array(),
            'meta'    => array(
                'cache'     => 'MISS',
                'timestamp' => current_time( 'mysql' ),
                'total'     => 0,
            )
        ), 200 );
    }

    // 2. Extrai SKUs e dados completos do Salesforce
    $products = array();
    foreach ( $posts as $post_id ) {
        $sf_data = moove_get_product_sf_data( $post_id );

        if ( ! empty( $sf_data ) && is_array( $sf_data ) ) {
            $products[] = $sf_data;
        }
    }

    // Cache
    set_transient( $cache_key, $products, $cache_time );

    return new WP_REST_Response( array(
        'success' => true,
        'data'    => $products,
        'meta'    => array(
            'cache'     => 'MISS',
            'timestamp' => current_time( 'mysql' ),
            'total'     => count( $products ),
        )
    ), 200 );
}

/**
 * Endpoint: Produtos por segmento (slug da taxonomy 'segmento')
 * URL: GET /wp-json/moove/v1/products/by-segment/{slug}?per_page=8
 */
function moove_get_products_by_segment_slug( $request ) {
    $segment_slug = sanitize_text_field( $request->get_param( 'slug' ) );
    $per_page     = absint( $request->get_param( 'per_page' ) );
    if ( $per_page <= 0 ) {
        $per_page = 8;
    }

    if ( empty( $segment_slug ) ) {
        return new WP_REST_Response( array(
            'success' => false,
            'message' => 'Parâmetro slug é obrigatório',
        ), 400 );
    }

    $post_type = post_type_exists( 'produtos' ) ? 'produtos' : 'post';
    $taxonomy  = 'segmento';

    $posts = get_posts( array(
        'post_type'           => $post_type,
        'post_status'         => 'publish',
        'numberposts'         => $per_page,
        'ignore_sticky_posts' => true,
        'no_found_rows'       => true,
        'fields'              => 'ids',
        'tax_query'           => array(
            array(
                'taxonomy' => $taxonomy,
                'field'    => 'slug',
                'terms'    => $segment_slug,
                'operator' => 'IN',
            ),
        ),
    ) );

    if ( empty( $posts ) ) {
        return new WP_REST_Response( array(
            'success' => true,
            'data'    => array(
                'products' => array(),
            ),
            'meta'    => array(
                'segment'   => $segment_slug,
                'per_page'  => $per_page,
                'total'     => 0,
                'timestamp' => current_time( 'mysql' ),
            ),
        ), 200 );
    }

    $products = array();
    foreach ( $posts as $post_id ) {
        $sf_data = moove_get_product_sf_data( $post_id );

        if ( is_array( $sf_data ) ) {
            unset( $sf_data['related_products'], $sf_data['RelatedProducts__c'] );
        } else {
            $sf_data = array();
        }

        $sf_data['id']    = $post_id;
        $sf_data['title'] = get_the_title( $post_id );
        $sf_data['slug']  = get_post_field( 'post_name', $post_id );
        $sf_data['sku']   = get_post_meta( $post_id, '_salesforce_sku', true );

        $products[] = $sf_data;
    }

    return new WP_REST_Response( array(
        'success' => true,
        'data'    => array(
            'products' => $products,
        ),
        'meta'    => array(
            'segment'   => $segment_slug,
            'per_page'  => $per_page,
            'total'     => count( $products ),
            'timestamp' => current_time( 'mysql' ),
        ),
    ), 200 );
}
