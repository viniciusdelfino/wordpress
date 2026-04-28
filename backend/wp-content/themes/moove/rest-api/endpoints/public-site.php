<?php
/**
 * Endpoints Públicas do Site
 */

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
    register_rest_route(MOOVE_API_NAMESPACE, '/site/info', [
        'methods' => 'GET',
        'callback' => 'moove_api_site_info_secure',
        'permission_callback' => '__return_true',
    ]);
    
    register_rest_route(MOOVE_API_NAMESPACE, '/site/settings', [
        'methods' => 'GET',
        'callback' => 'moove_api_public_settings',
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Informações do site
 */
function moove_api_site_info_secure() {
    $data = [
        'site' => [
            'name' => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
            'url' => get_bloginfo('url'),
            'language' => get_bloginfo('language'),
        ]
    ];
    
    $logo_id = get_theme_mod('custom_logo');
    if ($logo_id) {
        $logo_src = wp_get_attachment_image_src($logo_id, 'full');
        if ($logo_src) {
            $data['site']['logo'] = [
                'url'    => $logo_src[0],
                'width'  => $logo_src[1],
                'height' => $logo_src[2],
                'alt'    => get_bloginfo('name'),
            ];
        }
    }
    // Adiciona campos da Página de Opções do ACF
    if (function_exists('get_fields')) {
        $options = get_fields('option');
        $data['site']['options'] = $options ? $options : [];
    }
    return moove_api_success($data, 'Informações do site');
}

/**
 * Configurações públicas seguras
 */
function moove_api_public_settings() {
    $data = [
        'timezone' => wp_timezone_string(),
        'date_format' => get_option('date_format'),
        'time_format' => get_option('time_format'),
    ];
    
    $logo_id = get_theme_mod('custom_logo');
    if ($logo_id) {
        $logo_src = wp_get_attachment_image_src($logo_id, 'medium');
        if ($logo_src) {
            $data['logo'] = [
                'url' => $logo_src[0],
                'width' => $logo_src[1],
                'height' => $logo_src[2],
                'alt' => get_bloginfo('name'),
            ];
        }
    }
    
    return moove_api_success($data, 'Configurações públicas');
}