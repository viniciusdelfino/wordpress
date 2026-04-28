<?php
/**
 * Plugin Name: Moove - Hub de Integração de Veículos
 * Description: Gerencia credenciais de integração (XLab, Google Recaptcha, Inforlube) para busca de lubrificantes.
 * Version: 1.1.0
 */

defined('ABSPATH') || exit;

// ==========================================
// ADMIN MENU & SETTINGS (PAINEL ADMINISTRATIVO)
// ==========================================

add_action('admin_menu', function() {
    add_options_page('Configurações Moove', 'Integração Moove', 'manage_options', 'moove-settings', 'moove_settings_page');
});

add_action('admin_init', function() {
    register_setting('moove_settings_group', 'moove_xlab_email');
    register_setting('moove_settings_group', 'moove_xlab_password');
    register_setting('moove_settings_group', 'moove_recaptcha_key');
    register_setting('moove_settings_group', 'moove_inforlube_token');

    // Seção XLab
    add_settings_section('xlab_section', 'Credenciais XLab (Produtos)', null, 'moove-settings');
    add_settings_field('moove_xlab_email', 'E-mail', 'render_input_field', 'moove-settings', 'xlab_section', ['id' => 'moove_xlab_email', 'type' => 'email']);
    add_settings_field('moove_xlab_password', 'Senha', 'render_input_field', 'moove-settings', 'xlab_section', ['id' => 'moove_xlab_password', 'type' => 'password']);

    // Seção Google
    add_settings_section('google_section', 'Google reCAPTCHA', null, 'moove-settings');
    add_settings_field('moove_recaptcha_key', 'Site Key', 'render_input_field', 'moove-settings', 'google_section', ['id' => 'moove_recaptcha_key', 'type' => 'text']);

    // Seção Inforlube
    add_settings_section('inforlube_section', 'Inforlube', null, 'moove-settings');
    add_settings_field('moove_inforlube_token', 'Token de API', 'render_input_field', 'moove-settings', 'inforlube_section', ['id' => 'moove_inforlube_token', 'type' => 'text']);
});

function render_input_field($args) {
    $value = get_option($args['id']);
    printf('<input type="%s" name="%s" value="%s" class="regular-text">', $args['type'], $args['id'], esc_attr($value));
}

function moove_settings_page() {
    ?>
    <div class="wrap">
        <h1>Configurações de Integração Moove</h1>
        <form action="options.php" method="post">
            <?php 
            settings_fields('moove_settings_group');
            do_settings_sections('moove-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

add_action('rest_api_init', function () {
    register_rest_route('vehicle-plate/v1', '/settings', array(
        'methods' => 'GET',
        'callback' => 'get_vehicle_plate_settings',
        'permission_callback' => '__return_true' // Permitimos o acesso à rota, a filtragem é feita no callback
    ));
});

function get_vehicle_plate_settings($request) {
    // Campos públicos: Google e Inforlube
    $settings = [
        'google_recaptcha_key' => get_option('moove_recaptcha_key', ''),
        'inforlube_token'      => get_option('moove_inforlube_token', ''),
    ];

    // Campos PRIVADOS: Só aparecem se o solicitante for Administrador (via Cookie ou Application Password)
    if (current_user_can('manage_options')) {
        $settings['xlab_email']    = get_option('moove_xlab_email', '');
        $settings['xlab_password'] = get_option('moove_xlab_password', '');
    }

    return new WP_REST_Response($settings, 200);
}