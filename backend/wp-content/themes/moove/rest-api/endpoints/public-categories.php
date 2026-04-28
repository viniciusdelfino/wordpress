<?php

function moove_register_public_categories_endpoint() {
    register_rest_route('moove/v1', '/product-segments', array(
        'methods' => 'GET',
        'callback' => 'moove_get_public_categories',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('moove/v1', '/product-segments/(?P<slug>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'moove_get_public_category_single',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('moove/v1', '/application-page/(?P<segment>[a-zA-Z0-9-]+)/(?P<slug>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'moove_get_application_page',
        'permission_callback' => '__return_true',
    ));
}

add_action('rest_api_init', 'moove_register_public_categories_endpoint');

function moove_get_public_categories($request) {
    $terms = get_terms(array(
        'taxonomy' => 'segmento',
        'hide_empty' => false,
        'post_type' => 'produtos',
    ));

    if (is_wp_error($terms)) {
        return new WP_Error('no_terms', 'Nenhuma categoria encontrada', array('status' => 404));
    }

    $data = array();

    foreach ($terms as $term) {
        $term_data = array(
            'id' => $term->term_id,
            'name' => $term->name,
            'description' => $term->description,
            'slug' => $term->slug,
            'link' => get_term_link($term),
        );

        $acf_fields = get_fields($term);

        if ($acf_fields) {
            foreach ($acf_fields as $key => $value) {
                if ($key === 'blocks') {
                    $term_data[$key] = moove_format_category_blocks($value);
                } else if (is_array($value) && isset($value['url'])) {
                    $term_data[$key] = $value['url'];
                } else {
                    $term_data[$key] = $value;
                }
            }
        }
        $data[] = $term_data;
    }

    return rest_ensure_response($data);
}

function moove_get_public_category_single($request) {
    $slug = $request['slug'];
    
    $term = get_term_by('slug', $slug, 'segmento');

    if (!$term) {
        return new WP_Error('no_term', 'Categoria não encontrada', array('status' => 404));
    }

    $data = array(
        'id' => $term->term_id,
        'name' => $term->name,
        'description' => $term->description,
        'slug' => $term->slug,
        'link' => get_term_link($term),
    );

    $acf_fields = get_fields($term);

    if ($acf_fields) {
        foreach ($acf_fields as $key => $value) {
            if ($key === 'blocks') {
                $data[$key] = moove_format_category_blocks($value);
            } else if (is_array($value) && isset($value['url'])) {
                $data[$key] = $value['url'];
            } else {
                $data[$key] = $value;
            }
        }
    }

    return rest_ensure_response($data);
}

function moove_get_application_page($request) {
    $segment_slug = sanitize_title($request['segment']);
    $application_slug = sanitize_title($request['slug']);

    $application_term = get_term_by('slug', $application_slug, 'aplicacoes');

    if (!$application_term || is_wp_error($application_term)) {
        return new WP_Error('no_application_term', 'Aplicação não encontrada', array('status' => 404));
    }

    $products_in_context = get_posts(array(
        'post_type' => 'produtos',
        'post_status' => 'publish',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'tax_query' => array(
            'relation' => 'AND',
            array(
                'taxonomy' => 'segmento',
                'field' => 'slug',
                'terms' => $segment_slug,
            ),
            array(
                'taxonomy' => 'aplicacoes',
                'field' => 'term_id',
                'terms' => (int) $application_term->term_id,
            ),
        ),
    ));

    $acf_fields = function_exists('get_fields') ? get_fields($application_term) : array();

    $blocks = array();
    if (!empty($acf_fields)) {
        if (function_exists('moove_extract_acf_blocks')) {
            $blocks = moove_extract_acf_blocks($acf_fields);
        }

        if (empty($blocks) && !empty($acf_fields['blocks']) && is_array($acf_fields['blocks'])) {
            $blocks = moove_format_category_blocks($acf_fields['blocks']);
        }
    }

    $response = array(
        'id' => $application_term->term_id,
        'name' => $application_term->name,
        'slug' => $application_term->slug,
        'description' => term_description($application_term->term_id, 'aplicacoes'),
        'segment_slug' => $segment_slug,
        'has_products' => !empty($products_in_context),
        'blocks' => $blocks,
        'acf_fields' => $acf_fields ?: array(),
    );

    return rest_ensure_response($response);
}

/**
 * Formata os blocos para o padrão { type, data }.
 * Blocos que precisam de dados server-side são enriquecidos aqui.
 */
function moove_format_category_blocks($blocks) {
    if (empty($blocks) || !is_array($blocks)) {
        return array();
    }

    return array_map(function($block) {
        $layout = isset($block['acf_fc_layout']) ? $block['acf_fc_layout'] : 'unknown';

        // Enriquece product_segment_carousel com os produtos da query
        if ($layout === 'product_segment_carousel') {
            $block['products'] = function_exists('moove_resolve_segment_carousel_products')
                ? moove_resolve_segment_carousel_products($block)
                : [];
        }

        return array(
            'type' => $layout,
            'data' => $block,
        );
    }, $blocks);
}