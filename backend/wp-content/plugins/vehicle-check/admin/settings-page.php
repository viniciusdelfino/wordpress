<?php
if (!defined('ABSPATH')) exit;

add_action('admin_menu', function() {
    add_menu_page(
        'Moove Vehicle Check',
        'Placa de Veículos',
        'manage_options',
        'moove-vehicle-settings',
        'moove_vehicle_render_settings_page',
        'dashicons-car'
    );
});

function moove_vehicle_render_settings_page() {
    // Verificação de permissão
    if (!current_user_can('manage_options')) {
        return;
    }

    // Lógica de Salvamento
    if (isset($_POST['moove_save']) && check_admin_referer('moove_save_settings')) {
        if (isset($_POST['moove_vehicle_api_url'])) {
            update_option('moove_vehicle_api_url', sanitize_text_field($_POST['moove_vehicle_api_url']));
        }
        if (isset($_POST['moove_vehicle_api_token'])) {
            update_option('moove_vehicle_api_token', sanitize_text_field($_POST['moove_vehicle_api_token']));
        }
        echo '<div class="notice notice-success is-dismissible"><p>Configurações salvas com sucesso!</p></div>';
    }

    // Recupera valores (compatível com class-api-handler.php)
    $api_url = get_option('moove_vehicle_api_url', 'https://api.checktudo.com.br/v1/');
    $token   = get_option('moove_vehicle_api_token');
    ?>
    <div class="wrap">
        <h1>Configurações Placa de Veículos</h1>
        <form method="post">
            <?php wp_nonce_field('moove_save_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label>URL da API</label></th>
                    <td><input type="text" name="moove_vehicle_api_url" value="<?= esc_attr($api_url) ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label>Token API (Bearer)</label></th>
                    <td><input type="password" name="moove_vehicle_api_token" value="<?= esc_attr($token) ?>" class="regular-text"></td>
                </tr>
            </table>
            <p class="submit">
                <input type="submit" name="moove_save" class="button button-primary" value="Salvar">
            </p>
        </form>
        <hr>
        <h3>Endpoint da API</h3>
        <p><code><?= rest_url('moove-vehicle/v1/verify-plate') ?></code></p>
        <p><strong>Status:</strong> <?= !empty($token) ? '<span style="color:green">● Token Configurado</span>' : '<span style="color:red">● Token Pendente</span>' ?></p>
    </div>
    <?php
}