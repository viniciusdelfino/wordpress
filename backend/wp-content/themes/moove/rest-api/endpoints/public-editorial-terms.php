<?php

if (!defined('ABSPATH')) {
    exit;
}

function moove_get_allowed_public_term_taxonomies() {
    return array('editorial', 'segmento_industrial');
}

/**
 * Endpoint customizado para retornar termos de Editorial e Segmento Industrial com dados ACF
 */

function moove_register_editorial_terms_endpoint() {
    // Editorial terms com ACF
    register_rest_route('moove/v1', '/editorial-terms', array(
        'methods' => 'GET',
        'callback' => 'moove_get_editorial_terms',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('moove/v1', '/editorial-term/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'moove_get_editorial_term_single',
        'permission_callback' => '__return_true',
    ));

    // Segmento Industrial terms com ACF
    register_rest_route('moove/v1', '/segmento-industrial-terms', array(
        'methods' => 'GET',
        'callback' => 'moove_get_segmento_industrial_terms',
        'permission_callback' => '__return_true',
    ));

    register_rest_route('moove/v1', '/segmento-industrial-term/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'moove_get_segmento_industrial_term_single',
        'permission_callback' => '__return_true',
    ));

    // Generic term by slug and taxonomy
    register_rest_route('moove/v1', '/term/(?P<taxonomy>[a-zA-Z0-9_-]+)/(?P<slug>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'moove_get_term_by_slug_and_taxonomy',
        'permission_callback' => '__return_true',
    ));
}

add_action('rest_api_init', 'moove_register_editorial_terms_endpoint');

/**
 * Formata dados do termo com ACF
 */
function moove_format_term_with_acf($term, $taxonomy = null) {
    if (!$term || is_wp_error($term)) {
        return null;
    }

    $term_data = array(
        'id' => $term->term_id,
        'name' => $term->name,
        'slug' => $term->slug,
        'description' => $term->description,
        'taxonomy' => $term->taxonomy ?? $taxonomy,
        'link' => get_term_link($term),
        'count' => $term->count,
    );

    // Obter campos ACF do termo
    $acf_fields = get_fields($term);

    if ($acf_fields && is_array($acf_fields)) {
        // Normaliza flexible content → { type, data } e enriquece blocos server-side
        // (ex: product_segment_carousel injeta products via WP_Query)
        if (function_exists('moove_extract_acf_blocks')) {
            $normalized = moove_extract_acf_blocks($acf_fields);
            if (!empty($normalized)) {
                $acf_fields['blocks'] = $normalized;
            }
        } elseif (!empty($acf_fields['blocks']) && is_array($acf_fields['blocks'])) {
            // Fallback: moove_extract_acf_blocks não disponível (ordem de carregamento)
            if (function_exists('moove_format_category_blocks')) {
                $acf_fields['blocks'] = moove_format_category_blocks($acf_fields['blocks']);
            }
        }

        $term_data['acf'] = $acf_fields;
    } else {
        $term_data['acf'] = null;
    }

    return $term_data;
}

/**
 * Retorna todos os termos de Editorial com ACF
 */
function moove_get_editorial_terms($request) {
    $terms = get_terms(array(
        'taxonomy' => 'editorial',
        'hide_empty' => false,
        'number' => 100,
    ));

    if (is_wp_error($terms)) {
        return moove_api_error('Nenhum termo de editorial encontrado', 'no_terms', 404);
    }

    $data = array_map(function($term) {
        return moove_format_term_with_acf($term, 'editorial');
    }, $terms);

    return moove_api_success($data, 'Editorial terms retrieved successfully');
}

/**
 * Retorna um termo de Editorial com ACF por ID
 */
function moove_get_editorial_term_single($request) {
    $term_id = $request['id'];
    $term = get_term($term_id, 'editorial');

    if (!$term || is_wp_error($term)) {
        return moove_api_error('Termo não encontrado', 'term_not_found', 404);
    }

    $data = moove_format_term_with_acf($term, 'editorial');

    return moove_api_success($data, 'Editorial term retrieved successfully');
}

/**
 * Retorna todos os termos de Segmento Industrial com ACF
 */
function moove_get_segmento_industrial_terms($request) {
    $terms = get_terms(array(
        'taxonomy' => 'segmento_industrial',
        'hide_empty' => false,
        'number' => 100,
    ));

    if (is_wp_error($terms)) {
        return moove_api_error('Nenhum termo de segmento industrial encontrado', 'no_terms', 404);
    }

    $data = array_map(function($term) {
        return moove_format_term_with_acf($term, 'segmento_industrial');
    }, $terms);

    return moove_api_success($data, 'Segmento industrial terms retrieved successfully');
}

/**
 * Retorna um termo de Segmento Industrial com ACF por ID
 */
function moove_get_segmento_industrial_term_single($request) {
    $term_id = $request['id'];
    $term = get_term($term_id, 'segmento_industrial');

    if (!$term || is_wp_error($term)) {
        return moove_api_error('Termo não encontrado', 'term_not_found', 404);
    }

    $data = moove_format_term_with_acf($term, 'segmento_industrial');

    return moove_api_success($data, 'Segmento industrial term retrieved successfully');
}

/**
 * Retorna um termo por slug e taxonomy com ACF
 */
function moove_get_term_by_slug_and_taxonomy($request) {
    $taxonomy = $request['taxonomy'];
    $slug = $request['slug'];

    if (!in_array($taxonomy, moove_get_allowed_public_term_taxonomies(), true)) {
        return moove_api_error('Taxonomia não permitida', 'invalid_taxonomy', 400);
    }

    $term = get_term_by('slug', $slug, $taxonomy);

    if (!$term || is_wp_error($term)) {
        return moove_api_error('Termo não encontrado', 'term_not_found', 404);
    }

    $data = moove_format_term_with_acf($term, $taxonomy);

    return moove_api_success($data, 'Term retrieved successfully');
}
