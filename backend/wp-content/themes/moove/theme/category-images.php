<?php
/**
 * Term Images Field
 * Adiciona campo de imagem em taxonomias de termos usadas pelo projeto.
 */

if (!defined('ABSPATH')) exit;

function moove_term_image_taxonomies() {
    return array('category', 'editorial', 'segmento_industrial');
}

function moove_register_term_image_hooks() {
    foreach (moove_term_image_taxonomies() as $taxonomy) {
        add_action("{$taxonomy}_add_form_fields", 'moove_term_add_image_field');
        add_action("{$taxonomy}_edit_form_fields", 'moove_term_edit_image_field', 10, 2);
        add_action("edited_{$taxonomy}", 'moove_save_term_image');
        add_action("create_{$taxonomy}", 'moove_save_term_image');
        add_filter("rest_prepare_{$taxonomy}", 'moove_rest_prepare_term_acf_fields', 10, 3);
    }
}
add_action('init', 'moove_register_term_image_hooks');

add_action('admin_enqueue_scripts', 'moove_term_media_scripts');
add_action('rest_api_init', 'moove_register_term_image_rest_fields');

function moove_term_add_image_field($taxonomy) {
    ?>
    <div class="form-field term-image-wrap">
        <label for="category-image">Imagem de Destaque</label>
        <input type="hidden" id="category_image_id" name="category_image_id" value="">
        <div id="category-image-preview" style="margin-top: 10px;"></div>
        <button type="button" class="button" id="upload-category-image">Selecionar Imagem</button>
        <button type="button" class="button" id="remove-category-image" style="display:none;">Remover Imagem</button>
    </div>
    <?php
}

function moove_term_edit_image_field($term, $taxonomy) {
    $image_id = get_term_meta($term->term_id, 'category_image_id', true);
    $image_url = $image_id ? wp_get_attachment_url($image_id) : '';
    ?>
    <tr class="form-field term-image-wrap">
        <th scope="row"><label for="category-image">Imagem de Destaque</label></th>
        <td>
            <input type="hidden" id="category_image_id" name="category_image_id" value="<?php echo esc_attr($image_id); ?>">
            <div id="category-image-preview" style="margin-bottom: 10px;">
                <?php if ($image_url): ?>
                    <img src="<?php echo esc_url($image_url); ?>" style="max-width: 200px; height: auto;">
                <?php endif; ?>
            </div>
            <button type="button" class="button" id="upload-category-image">Selecionar Imagem</button>
            <button type="button" class="button" id="remove-category-image" style="<?php echo $image_url ? '' : 'display:none;'; ?>">Remover Imagem</button>
        </td>
    </tr>
    <?php
}

function moove_save_term_image($term_id) {
    if (!isset($_POST['category_image_id'])) {
        return;
    }

    $image_id = sanitize_text_field($_POST['category_image_id']);

    if ($image_id) {
        update_term_meta($term_id, 'category_image_id', intval($image_id));
    } else {
        delete_term_meta($term_id, 'category_image_id');
    }
}

function moove_term_media_scripts() {
    $screen = get_current_screen();

    if (!$screen || strpos($screen->id, 'edit-') !== 0) {
        return;
    }

    $taxonomy = str_replace('edit-', '', $screen->id);
    if (!in_array($taxonomy, moove_term_image_taxonomies(), true)) {
        return;
    }

    wp_enqueue_media();
    wp_enqueue_script(
        'category-image-script',
        get_template_directory_uri() . '/theme/js/category-image-upload.js',
        array('jquery'),
        '1.0',
        true
    );
}

function moove_get_term_image_data($term_object) {
    $image_id = get_term_meta($term_object['id'], 'category_image_id', true);
    if (!$image_id) {
        return null;
    }

    $image_src = wp_get_attachment_image_src($image_id, 'full');
    if (!$image_src) {
        return null;
    }

    return array(
        'id' => (int) $image_id,
        'url' => $image_src[0],
        'width' => isset($image_src[1]) ? (int) $image_src[1] : null,
        'height' => isset($image_src[2]) ? (int) $image_src[2] : null,
        'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
    );
}

function moove_get_term_ordem_data($term_object) {
    $term_id = isset($term_object['id']) ? (int) $term_object['id'] : 0;
    if (!$term_id) {
        return null;
    }

    $taxonomy = isset($term_object['taxonomy']) ? $term_object['taxonomy'] : '';
    $ordem = null;

    if (function_exists('get_field') && !empty($taxonomy)) {
        $ordem = get_field('ordem', $taxonomy . '_' . $term_id);
    }

    if ($ordem === null || $ordem === '' || $ordem === false) {
        $ordem = get_term_meta($term_id, 'ordem', true);
    }

    if ($ordem === null || $ordem === '') {
        return null;
    }

    return is_numeric($ordem) ? (int) $ordem : null;
}

function moove_rest_prepare_term_acf_fields($response, $term, $request) {
    if (!function_exists('get_fields') || !is_object($response)) {
        return $response;
    }

    $taxonomy = isset($term->taxonomy) ? $term->taxonomy : '';
    $term_id = isset($term->term_id) ? (int) $term->term_id : 0;

    if (empty($taxonomy) || !$term_id) {
        return $response;
    }

    $acf_fields = get_fields($taxonomy . '_' . $term_id);
    $response->data['acf'] = is_array($acf_fields) ? $acf_fields : array();

    return $response;
}

function moove_register_term_image_rest_fields() {
    foreach (moove_term_image_taxonomies() as $taxonomy) {
        register_rest_field(
            $taxonomy,
            'image',
            array(
                'get_callback' => 'moove_get_term_image_data',
                'schema' => array(
                    'description' => 'Imagem de destaque do termo',
                    'type' => array('object', 'null'),
                    'context' => array('view', 'edit'),
                ),
            )
        );

        register_rest_field(
            $taxonomy,
            'ordem',
            array(
                'get_callback' => 'moove_get_term_ordem_data',
                'schema' => array(
                    'description' => 'Ordem de exibição do termo',
                    'type' => array('integer', 'null'),
                    'context' => array('view', 'edit'),
                ),
            )
        );
    }
}
