<?php
/**
 * Endpoints de Posts
 */

if (!defined('ABSPATH')) exit;

// ============================================
// POSTS
// ============================================

add_action('rest_api_init', function() {
    // Listar posts
    register_rest_route(MOOVE_API_NAMESPACE, '/posts', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_posts',
        'permission_callback' => '__return_true',
    ]);
    
    // Post por ID
    register_rest_route(MOOVE_API_NAMESPACE, '/post/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_post',
        'permission_callback' => '__return_true',
    ]);
    
    // Post por slug
    register_rest_route(MOOVE_API_NAMESPACE, '/post/slug/(?P<slug>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_post_by_slug',
        'permission_callback' => '__return_true',
    ]);

    // Categorias
    register_rest_route(MOOVE_API_NAMESPACE, '/categories', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_categories',
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Listar posts
 */
function moove_api_get_posts($request) {
    $params = $request->get_params();
    
    $args = [
        'post_type' => 'post',
        'post_status' => 'publish',
        'posts_per_page' => $params['per_page'] ?? 10,
        'paged' => $params['page'] ?? 1,
        'orderby' => 'date',
        'order' => 'DESC',
    ];
    
    // Busca
    if (!empty($params['search'])) {
        $args['s'] = sanitize_text_field($params['search']);
    }
    
    // Filtro por categoria
    if (!empty($params['category'])) {
        $args['cat'] = (int) $params['category'];
    }
    
    // Filtro por tag
    if (!empty($params['tag'])) {
        $args['tag_id'] = (int) $params['tag'];
    }
    
    // Filtro por autor
    if (!empty($params['author'])) {
        $args['author'] = (int) $params['author'];
    }
    
    $query = new WP_Query($args);
    
    $posts = [];
    foreach ($query->posts as $post) {
        $posts[] = moove_format_post_preview($post);
    }
    
    return moove_api_success([
        'posts' => $posts,
        'pagination' => [
            'current_page' => (int) ($params['page'] ?? 1),
            'per_page' => (int) ($params['per_page'] ?? 10),
            'total_pages' => $query->max_num_pages,
            'total_items' => $query->found_posts,
        ]
    ], 'Lista de posts');
}

/**
 * Post por ID
 */
function moove_api_get_post($request) {
    $post_id = $request['id'];
    $post = get_post($post_id);
    
    if (!$post || $post->post_type !== 'post' || $post->post_status !== 'publish') {
        return moove_api_error('Post não encontrado', 'post_not_found', 404);
    }
    
    $post_data = moove_format_post_detail($post);
    
    // Adicionar blocos ACF se existirem
    if (function_exists('get_fields')) {
        $acf_fields = get_fields($post_id);
        if ($acf_fields) {
            // Reutiliza função de extração de blocos se disponível (definida em public-pages.php)
            if (function_exists('moove_extract_acf_blocks')) {
                $blocks = moove_extract_acf_blocks($acf_fields);
                if (!empty($blocks)) {
                    $post_data['blocks'] = $blocks;
                }
                $other_fields = array_diff_key($acf_fields, array_flip(['content_blocks']));
            } else {
                $other_fields = $acf_fields;
            }
            
            if (!empty($other_fields)) {
                $post_data['acf_fields'] = $other_fields;
            }
        }
    }
    
    return moove_api_success($post_data, 'Detalhes do post');
}

/**
 * Post por slug
 */
function moove_api_get_post_by_slug($request) {
    $slug = $request['slug'];
    
    $args = [
        'name'        => $slug,
        'post_type'   => 'post',
        'post_status' => 'publish',
        'numberposts' => 1
    ];
    
    $posts = get_posts($args);
    
    if (empty($posts)) {
        return moove_api_error('Post não encontrado', 'post_not_found', 404);
    }
    
    $request['id'] = $posts[0]->ID;
    return moove_api_get_post($request);
}

/**
 * Busca recursivamente o primeiro campo ACF do tipo link
 */
function moove_find_first_acf_link($value) {
    if (!is_array($value)) {
        return null;
    }

    if (!empty($value['url']) && is_string($value['url'])) {
        return [
            'url' => esc_url_raw($value['url']),
            'title' => isset($value['title']) ? sanitize_text_field($value['title']) : '',
            'target' => isset($value['target']) ? sanitize_text_field($value['target']) : '_blank',
        ];
    }

    foreach ($value as $nested) {
        $found = moove_find_first_acf_link($nested);
        if ($found) {
            return $found;
        }
    }

    return null;
}

/**
 * Retorna termos formatados de uma taxonomia para um post
 */
function moove_get_post_terms_by_taxonomy($post_id, $taxonomy) {
    $terms = get_the_terms($post_id, $taxonomy);

    if (!$terms || is_wp_error($terms)) {
        return [];
    }

    return array_map(function($term) {
        return [
            'id' => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'taxonomy' => $term->taxonomy,
        ];
    }, $terms);
}

/**
 * Monta a URL canônica do frontend para posts vinculados a editorial/segmento industrial.
 */
function moove_get_post_frontend_url($post) {
    $editorial_terms = moove_get_post_terms_by_taxonomy($post->ID, 'editorial');
    if (!empty($editorial_terms)) {
        return '/blog/' . $editorial_terms[0]['slug'] . '/' . $post->post_name;
    }

    $segment_terms = moove_get_post_terms_by_taxonomy($post->ID, 'segmento_industrial');
    if (!empty($segment_terms)) {
        return '/blog/' . $segment_terms[0]['slug'] . '/' . $post->post_name;
    }

    return '/conteudos/' . $post->post_name;
}

/**
 * Listar categorias
 */
function moove_api_get_categories($request) {
    $terms = get_terms([
        'taxonomy' => 'category',
        'hide_empty' => false,
    ]);
    
    if (is_wp_error($terms)) {
        return moove_api_error($terms->get_error_message(), 'terms_error');
    }
    
    $data = [];
    foreach ($terms as $term) {
        $acf_fields = function_exists('get_fields') ? get_fields($term) : [];

        $image_id = get_term_meta($term->term_id, 'category_image_id', true);
        if ($image_id) {
            if (!is_array($acf_fields)) $acf_fields = [];
            $acf_fields['image'] = ['url' => wp_get_attachment_url($image_id)];
        }
        $item = [
            'id' => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'count' => $term->count,
            'acf' => $acf_fields ?: null
        ];
        
        $data[] = $item;
    }
    
    return moove_api_success($data, 'Lista de categorias');
}

/**
 * Formatar preview do post
 */
function moove_format_post_preview($post) {
    $categories = get_the_category($post->ID);
    $formatted_categories = [];
    foreach($categories as $cat) {
        $formatted_categories[] = [
            'id' => $cat->term_id,
            'name' => $cat->name,
            'slug' => $cat->slug
        ];
    }

    $reading_time = null;
    if (function_exists('get_field')) {
        $content_infos = get_field('content-infos', $post->ID);
        if ($content_infos && isset($content_infos['reading-time'])) {
            $reading_time = $content_infos['reading-time'];
        }
    }

    $acf_fields = null;
    $external_link = null;
    $editorial_terms = moove_get_post_terms_by_taxonomy($post->ID, 'editorial');
    $segmento_industrial_terms = moove_get_post_terms_by_taxonomy($post->ID, 'segmento_industrial');
    if (function_exists('get_fields')) {
        $acf_fields = get_fields($post->ID);
        if (is_array($acf_fields)) {
            $external_link = moove_find_first_acf_link($acf_fields);
        }
    }

    return [
        'id' => $post->ID,
        'title' => get_the_title($post),
        'slug' => $post->post_name,
        'excerpt' => get_the_excerpt($post),
        'featured_image' => get_the_post_thumbnail_url($post, 'medium'),
        'url' => get_permalink($post),
        'date' => get_the_date('c', $post),
        'author' => [
            'id' => $post->post_author,
            'name' => get_the_author_meta('display_name', $post->post_author),
        ],
        'categories' => $formatted_categories,
        'editorial_terms' => $editorial_terms,
        'segmento_industrial_terms' => $segmento_industrial_terms,
        'reading_time' => $reading_time,
        'external_link' => $external_link,
        'frontend_url' => moove_get_post_frontend_url($post),
        'acf_fields' => $acf_fields,
    ];
}

/**
 * Formatar detalhes do post
 */
function moove_format_post_detail($post) {
    $featured_image_id = get_post_thumbnail_id($post->ID);
    $editorial_terms = moove_get_post_terms_by_taxonomy($post->ID, 'editorial');
    $segmento_industrial_terms = moove_get_post_terms_by_taxonomy($post->ID, 'segmento_industrial');
    
    $categories = get_the_category($post->ID);
    $formatted_categories = [];
    foreach($categories as $cat) {
        $formatted_categories[] = [
            'id' => $cat->term_id,
            'name' => $cat->name,
            'slug' => $cat->slug
        ];
    }

    $tags = get_the_tags($post->ID);
    $formatted_tags = [];
    if ($tags) {
        foreach($tags as $tag) {
            $formatted_tags[] = [
                'id' => $tag->term_id,
                'name' => $tag->name,
                'slug' => $tag->slug
            ];
        }
    }
    
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
            'avatar' => get_avatar_url($post->post_author),
        ],
        'dates' => [
            'published' => get_the_date('c', $post),
            'modified' => get_the_modified_date('c', $post),
        ],
        'categories' => $formatted_categories,
        'editorial_terms' => $editorial_terms,
        'segmento_industrial_terms' => $segmento_industrial_terms,
        'tags' => $formatted_tags,
        'frontend_url' => moove_get_post_frontend_url($post),
        'seo' => [
            'title' => get_post_meta($post->ID, '_yoast_wpseo_title', true),
            'description' => get_post_meta($post->ID, '_yoast_wpseo_metadesc', true),
        ],
        'prev_next' => [
            'next' => moove_get_adjacent_post_info($post, true),
            'prev' => moove_get_adjacent_post_info($post, false),
        ]
    ];
}

/**
 * Helper para post anterior/próximo
 */
function moove_get_adjacent_post_info($post, $next = true) {
    $adjacent = get_adjacent_post(false, '', $next);
    if ($adjacent) {
        return [
            'id' => $adjacent->ID,
            'title' => $adjacent->post_title,
            'slug' => $adjacent->post_name,
        ];
    }
    return null;
}
