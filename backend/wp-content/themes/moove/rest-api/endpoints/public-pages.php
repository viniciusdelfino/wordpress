<?php
/**
 * Endpoints de Páginas
 */

if (!defined('ABSPATH')) exit;

// ============================================
// PÁGINAS
// ============================================

add_action('rest_api_init', function() {
    // Listar páginas
    register_rest_route(MOOVE_API_NAMESPACE, '/pages', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_pages',
        'permission_callback' => '__return_true',
    ]);
    
    // Página por ID
    register_rest_route(MOOVE_API_NAMESPACE, '/page/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_page',
        'permission_callback' => '__return_true',
    ]);
    
    // Página por slug
    register_rest_route(MOOVE_API_NAMESPACE, '/page/slug/(?P<slug>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_page_by_slug',
        'permission_callback' => '__return_true',
    ]);
    
    // Home page (página inicial)
    register_rest_route(MOOVE_API_NAMESPACE, '/home', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_home_page',
        'permission_callback' => '__return_true',
    ]);

});

/**
 * Listar páginas
 */
function moove_api_get_pages($request) {
    $params = $request->get_params();
    
    $args = [
        'post_type' => 'page',
        'post_status' => 'publish',
        'posts_per_page' => $params['per_page'] ?? 20,
        'paged' => $params['page'] ?? 1,
        'orderby' => 'menu_order',
        'order' => 'ASC',
    ];
    
    // Filtros opcionais
    if (!empty($params['search'])) {
        $args['s'] = sanitize_text_field($params['search']);
    }
    
    if (!empty($params['parent'])) {
        $args['post_parent'] = (int) $params['parent'];
    }
    
    $query = new WP_Query($args);
    
    $pages = [];
    foreach ($query->posts as $post) {
        $pages[] = moove_format_page_preview($post);
    }
    
    return moove_api_success([
        'pages' => $pages,
        'pagination' => [
            'current_page' => (int) ($params['page'] ?? 1),
            'per_page' => (int) ($params['per_page'] ?? 20),
            'total_pages' => $query->max_num_pages,
            'total_items' => $query->found_posts,
        ]
    ], 'Lista de páginas');
}

/**
 * Página por ID
 */
function moove_api_get_page($request) {
    $page_id = $request['id'];
    $post = get_post($page_id);
    
    if (!$post || $post->post_type !== 'page' || $post->post_status !== 'publish') {
        return moove_api_error('Página não encontrada', 'page_not_found', 404);
    }
    
    $page_data = moove_format_page_detail($post);
    
    // Adicionar blocos ACF se existirem
    if (function_exists('get_fields')) {
        $acf_fields = get_fields($page_id);
        if ($acf_fields) {
            // Extrair blocos do flexible content
            $blocks = moove_extract_acf_blocks($acf_fields);
            if (!empty($blocks)) {
                $page_data['blocks'] = $blocks;
            }
            
            // Outros campos ACF
            $other_fields = array_diff_key($acf_fields, array_flip(['blocks']));
            if (!empty($other_fields)) {
                $page_data['acf_fields'] = $other_fields;
            }
        }
    }
    
    return moove_api_success($page_data, 'Detalhes da página');
}

/**
 * Página por slug
 */
function moove_api_get_page_by_slug($request) {
    $slug = $request['slug'];
    $post = get_page_by_path($slug, OBJECT, 'page');
    
    if (!$post || $post->post_status !== 'publish') {
        return moove_api_error('Página não encontrada', 'page_not_found', 404);
    }
    
    $request['id'] = $post->ID;
    return moove_api_get_page($request);
}

/**
 * Home page
 */
function moove_api_get_home_page() {
    $home_id = get_option('page_on_front');
    
    if (!$home_id) {
        return moove_api_error('Página inicial não configurada', 'home_not_set', 404);
    }
    
    $request = new WP_REST_Request('GET');
    $request->set_param('id', $home_id);
    
    return moove_api_get_page($request);
}

/**
 * Formatar preview da página
 */
function moove_format_page_preview($post) {
    return [
        'id' => $post->ID,
        'title' => get_the_title($post),
        'slug' => $post->post_name,
        'excerpt' => get_the_excerpt($post),
        'featured_image' => get_the_post_thumbnail_url($post, 'medium'),
        'url' => get_permalink($post),
        'menu_order' => $post->menu_order,
        'parent' => $post->post_parent,
        'modified' => $post->post_modified,
    ];
}

/**
 * Formatar detalhes da página
 */
function moove_format_page_detail($post) {
    $featured_image_id = get_post_thumbnail_id($post->ID);
    
    return [
        'id' => $post->ID,
        'title' => get_the_title($post),
        'content' => apply_filters('the_content', $post->post_content),
        'excerpt' => get_the_excerpt($post),
        'slug' => $post->post_name,
        'featured_image' => $featured_image_id ? moove_format_image($featured_image_id) : null,
        'author' => [
            'id' => $post->post_author,
            'name' => get_the_author_meta('display_name', $post->post_author),
        ],
        'dates' => [
            'published' => get_the_date('c', $post),
            'modified' => get_the_modified_date('c', $post),
        ],
        'seo' => [
            'title' => get_post_meta($post->ID, '_yoast_wpseo_title', true),
            'description' => get_post_meta($post->ID, '_yoast_wpseo_metadesc', true),
        ],
        'template' => get_page_template_slug($post->ID),
        'menu_order' => $post->menu_order,
        'parent' => $post->post_parent,
    ];
}

/**
 * Extrair blocos ACF
 */
function moove_extract_acf_blocks($acf_fields) {
    $blocks = [];

    // Procurar por flexible content
    foreach ($acf_fields as $field_key => $field_value) {
        if (is_array($field_value) && isset($field_value[0]['acf_fc_layout'])) {
            // É um flexible content
            foreach ($field_value as $block) {
                if (isset($block['acf_fc_layout'])) {
                    if (
                        isset($block['form']) &&
                        is_string($block['form']) &&
                        $block['acf_fc_layout'] !== 'newsletter'
                    ) {
                        $block['form'] = do_shortcode($block['form']);
                    }

                    // Enriquece o bloco product_segment_carousel com os produtos reais
                    if ($block['acf_fc_layout'] === 'product_segment_carousel') {
                        $block['products'] = moove_resolve_segment_carousel_products($block);
                    }

                    $blocks[] = [
                        'type' => $block['acf_fc_layout'],
                        'data' => $block,
                    ];
                }
            }
        }
    }

    return $blocks;
}

/**
 * Resolve os produtos para o bloco product_segment_carousel.
 * Faz WP_Query em sf_product filtrando pela taxonomia 'segmento'.
 */
function moove_resolve_segment_carousel_products($block) {
    $segment    = isset($block['segment']) ? $block['segment'] : null;
    $itens_num  = isset($block['itens_number']) ? (int) $block['itens_number'] : 8;
    $itens_num  = ($itens_num > 0) ? $itens_num : 8;

    // O campo 'segment' pode ser um objeto ACF (array com slug/taxonomy) ou uma string
    if (is_array($segment)) {
        $segment_slug = isset($segment['slug']) ? sanitize_text_field($segment['slug']) : '';
        $taxonomy     = isset($segment['taxonomy']) ? sanitize_text_field($segment['taxonomy']) : 'segmento';
    } else {
        $segment_slug = is_string($segment) ? sanitize_text_field($segment) : '';
        $taxonomy     = 'segmento';
    }

    if (empty($segment_slug)) {
        return [];
    }

    // Detecta o post type correto (sf_product → produtos → fallback post)
    $post_type = 'post';
    foreach (['sf_product', 'produtos'] as $candidate) {
        if (post_type_exists($candidate)) {
            $post_type = $candidate;
            break;
        }
    }

    $query = new WP_Query([
        'post_type'      => $post_type,
        'post_status'    => 'publish',
        'posts_per_page' => $itens_num,
        'no_found_rows'  => true,
        'tax_query'      => [[
            'taxonomy' => $taxonomy,
            'field'    => 'slug',
            'terms'    => $segment_slug,
        ]],
    ]);

    if (empty($query->posts)) {
        return [];
    }

    $products = [];
    foreach ($query->posts as $p) {
        $sf_data  = function_exists('moove_get_product_sf_data') ? moove_get_product_sf_data($p->ID) : [];
        $acf_data = function_exists('get_fields') ? get_fields($p->ID) : [];

        // Remove dados pesados/recursivos que não são necessários no carrossel
        if (is_array($sf_data)) {
            unset($sf_data['related_products'], $sf_data['RelatedProducts__c']);
        }
        if (is_array($acf_data)) {
            unset($acf_data['blocks'], $acf_data['product_content_blocks']);
        }

        $products[] = [
            'id'            => $p->ID,
            'title'         => get_the_title($p->ID),
            'slug'          => $p->post_name,
            'sku'           => get_post_meta($p->ID, '_salesforce_sku', true),
            'extended_data' => [
                'sf'  => is_array($sf_data)  ? $sf_data  : [],
                'acf' => is_array($acf_data) ? $acf_data : [],
            ],
        ];
    }

    return $products;
}