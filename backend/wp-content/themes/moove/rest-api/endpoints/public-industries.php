<?php
/**
 * Endpoints de Indústrias (Custom Post Type)
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
    // Listar todas as indústrias
    register_rest_route(MOOVE_API_NAMESPACE, '/industries', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_industries',
        'permission_callback' => '__return_true',
    ]);

    // Indústria por slug
    register_rest_route(MOOVE_API_NAMESPACE, '/industry/(?P<slug>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_industry_by_slug',
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Listar Indústrias
 */
function moove_api_get_industries($request) {
    $args = [
        'post_type'      => 'industria',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'title',
        'order'          => 'ASC',
    ];

    $posts = get_posts($args);
    $data = array_map('moove_format_industry', $posts);

    return rest_ensure_response(['success' => true, 'data' => $data]);
}

/**
 * Busca Indústria por Slug
 */
function moove_api_get_industry_by_slug($request) {
    $slug = $request['slug'];
    
    $args = [
        'name'        => $slug,
        'post_type'   => 'industria',
        'post_status' => 'publish',
        'numberposts' => 1
    ];
    
    $posts = get_posts($args);
    
    if (empty($posts)) {
        return new WP_Error('industry_not_found', 'Indústria não encontrada', ['status' => 404]);
    }
    
    $post = $posts[0];
    $data = moove_format_industry($post);
    
    return rest_ensure_response(['success' => true, 'data' => $data]);
}

/**
 * Formatação dos dados da Indústria
 */
function moove_format_industry($post) {
    $featured_image_id = get_post_thumbnail_id($post->ID);
    $featured_image_url = $featured_image_id ? wp_get_attachment_image_url($featured_image_id, 'full') : null;
    
    $acf = function_exists('get_fields') ? get_fields($post->ID) : [];

    $blocks = function_exists('get_field') ? get_field('blocks', $post->ID) : [];
    if (empty($blocks) && is_array($acf)) {
        foreach ($acf as $field_value) {
            if (is_array($field_value) && !empty($field_value) && isset($field_value[0]['acf_fc_layout'])) {
                $blocks = $field_value;
                break;
            }
        }
    }

    return [
        'id' => $post->ID,
        'title' => get_the_title($post),
        'slug' => $post->post_name,
        'content' => apply_filters('the_content', $post->post_content),
        'excerpt' => get_the_excerpt($post),
        'featured_image' => $featured_image_url,
        'seo' => [
            'title' => get_post_meta($post->ID, '_yoast_wpseo_title', true),
            'description' => get_post_meta($post->ID, '_yoast_wpseo_metadesc', true),
        ],
        'blocks' => $blocks ?: [],
        'acf' => $acf ?: [],
    ];
}
