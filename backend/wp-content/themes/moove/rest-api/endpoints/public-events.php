<?php
/**
 * Endpoints de Eventos
 * 
 * O código detecta automaticamente qualquer campo ACF criado:
 * - Data: qualquer campo com padrão YYYY-MM-DD
 * - Local: qualquer texto simples (não-URL)
 * - Tipo de link: select/radio com 'inscricoes' ou 'replay'
 * - Link: qualquer URL válida
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

    // Listar eventos
    register_rest_route(MOOVE_API_NAMESPACE, '/events', [
        'methods'             => 'GET',
        'callback'            => 'moove_api_get_events',
        'permission_callback' => '__return_true',
    ]);

    // Evento por ID
    register_rest_route(MOOVE_API_NAMESPACE, '/event/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'moove_api_get_event',
        'permission_callback' => '__return_true',
    ]);

    // Evento por slug
    register_rest_route(MOOVE_API_NAMESPACE, '/event/slug/(?P<slug>[a-zA-Z0-9_-]+)', [
        'methods'             => 'GET',
        'callback'            => 'moove_api_get_event_by_slug',
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Listar eventos
 */
function moove_api_get_events($request) {
    $params = $request->get_params();

    $args = [
        'post_type'      => 'eventos',
        'post_status'    => 'publish',
        'posts_per_page' => isset($params['per_page']) ? (int) $params['per_page'] : -1,
        'paged'          => isset($params['page']) ? (int) $params['page'] : 1,
        'orderby'        => 'date',
        'order'          => 'ASC',
    ];

    $query = new WP_Query($args);

    $events = [];
    foreach ($query->posts as $post) {
        $events[] = moove_format_event($post);
    }

    return moove_api_success([
        'events'     => $events,
        'pagination' => [
            'current_page' => (int) ($params['page'] ?? 1),
            'per_page'     => (int) ($params['per_page'] ?? -1),
            'total_pages'  => $query->max_num_pages,
            'total_items'  => $query->found_posts,
        ],
    ], 'Lista de eventos');
}

/**
 * Evento por ID
 */
function moove_api_get_event($request) {
    $post_id = (int) $request['id'];
    $post    = get_post($post_id);

    if (!$post || $post->post_type !== 'eventos' || $post->post_status !== 'publish') {
        return moove_api_error('Evento não encontrado', 'event_not_found', 404);
    }

    return moove_api_success(moove_format_event($post), 'Detalhes do evento');
}

/**
 * Evento por slug
 */
function moove_api_get_event_by_slug($request) {
    $posts = get_posts([
        'name'        => $request['slug'],
        'post_type'   => 'eventos',
        'post_status' => 'publish',
        'numberposts' => 1,
    ]);

    if (empty($posts)) {
        return moove_api_error('Evento não encontrado', 'event_not_found', 404);
    }

    $request['id'] = $posts[0]->ID;
    return moove_api_get_event($request);
}

/**
 * Encontra recursivamente o primeiro campo de data (valor com padrão YYYY-MM-DD ou timestamp)
 */
function moove_find_first_date_field($value) {
    if (!is_array($value)) {
        if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }
        return null;
    }

    foreach ($value as $nested) {
        $found = moove_find_first_date_field($nested);
        if ($found) {
            return $found;
        }
    }

    return null;
}

/**
 * Encontra recursivamente o primeiro campo de tipo link (select/radio com 'inscricoes' ou 'replay')
 */
function moove_find_first_link_type($value) {
    if (!is_array($value)) {
        if (is_string($value) && in_array($value, ['inscricoes', 'replay'], true)) {
            return $value;
        }
        return null;
    }

    foreach ($value as $nested) {
        $found = moove_find_first_link_type($nested);
        if ($found) {
            return $found;
        }
    }

    return null;
}

/**
 * Encontra recursivamente o primeiro campo URL (link)
 */
function moove_find_first_url_field($value) {
    if (!is_array($value)) {
        if (is_string($value) && filter_var($value, FILTER_VALIDATE_URL)) {
            return esc_url_raw($value);
        }
        return null;
    }

    foreach ($value as $nested) {
        $found = moove_find_first_url_field($nested);
        if ($found) {
            return $found;
        }
    }

    return null;
}

/**
 * Encontra recursivamente o primeiro campo de texto (string simples, não URL)
 */
function moove_find_first_text_field($value) {
    if (!is_array($value)) {
        if (is_string($value) && strlen($value) > 0 && !filter_var($value, FILTER_VALIDATE_URL) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return sanitize_text_field($value);
        }
        return null;
    }

    foreach ($value as $nested) {
        $found = moove_find_first_text_field($nested);
        if ($found) {
            return $found;
        }
    }

    return null;
}

/**
 * Formatar evento para a API
 */
function moove_format_event($post) {
    $acf         = function_exists('get_fields') ? get_fields($post->ID) : [];
    $data_evento = moove_find_first_date_field($acf);
    $is_past     = $data_evento ? (strtotime($data_evento) < strtotime('today')) : false;

    $excerpt = trim((string) get_the_excerpt($post));
    if ($excerpt === '') {
        $desc_raw = '';
        if (is_array($acf) && isset($acf['desc']) && is_string($acf['desc'])) {
            $desc_raw = $acf['desc'];
        } elseif (is_string($post->post_content)) {
            $desc_raw = $post->post_content;
        }

        $excerpt = wp_trim_words(
            trim(wp_strip_all_tags((string) $desc_raw)),
            24,
            '...'
        );
    }

    return [
        'id'             => $post->ID,
        'title'          => get_the_title($post),
        'slug'           => $post->post_name,
        'excerpt'        => $excerpt,
        'featured_image' => get_the_post_thumbnail_url($post, 'large') ?: null,
        'data_evento'    => $data_evento,
        'is_past_event'  => $is_past,
        'local_evento'   => moove_find_first_text_field($acf),
        'tipo_link'      => moove_find_first_link_type($acf),
        'link_evento'    => moove_find_first_url_field($acf),
        'acf_fields'     => $acf,
    ];
}
