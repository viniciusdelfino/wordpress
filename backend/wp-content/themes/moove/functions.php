<?php

/*******************************
    Theme presets
********************************/
require_once('theme/theme.php');


/*******************************
    Custom Posts
********************************/

require_once('theme/custom-post.php');
require_once('theme/menu.php');
require_once('theme/taxonomies.php');
require_once('theme/category-images.php');

/*******************************
    ACF Blocks
********************************/

require_once('theme/acf-contact-blocks.php');
require_once('theme/acf-engineersolutions-blocks.php');
require_once('theme/acf-calculator-blocks.php');
require_once('theme/acf-trocainteligente-blocks.php');


/*******************************
 * Moove Theme - Functions
********************************/

define('MOOVE_API_NAMESPACE', 'moove/v1');
define('MOOVE_API_DEBUG', true);

function moove_theme_setup() {
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');
    add_theme_support('editor-styles');
}
add_action('after_setup_theme', 'moove_theme_setup');

function moove_load_api_files() {
     $api_path = get_stylesheet_directory() . '/rest-api/';
    
    $folders = [
        'core/',     
        'endpoints/',
        'auth/',     
    ];
    
    foreach ($folders as $folder) {
        $folder_path = $api_path . $folder;
        if (is_dir($folder_path)) {
            $files = glob($folder_path . '*.php');
            foreach ($files as $file) {
                require_once $file;
                if (MOOVE_API_DEBUG) {
                    error_log("Moove API: Carregado $folder" . basename($file));
                }
            }
        }
    }
}
add_action('after_setup_theme', 'moove_load_api_files');

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        return $value;
    });
}, 15);


/*******************************
 * Uploading SVGs
********************************/

add_filter( 'wp_check_filetype_and_ext', function($data, $file, $filename, $mimes) {
  $filetype = wp_check_filetype( $filename, $mimes );
  return [
      'ext'             => $filetype['ext'],
      'type'            => $filetype['type'],
      'proper_filename' => $data['proper_filename']
  ];
}, 10, 4 );


add_filter( 'upload_mimes', function($mimes) {
  $mimes['svg'] = 'image/svg+xml';
  return $mimes;
} );

/*******************************
 * Showing ACFs on WordPress API REST 
********************************/

add_filter( 'acf/rest_api/item_permissions/edit', '__return_true' );
add_filter( 'acf/rest_api/item_permissions/get', '__return_true' );

// Garante que o campo ACF seja incluído na resposta da página
add_filter( 'rest_prepare_page', function( $response, $post, $request ) {
    if ( ! empty( $response->data ) && function_exists('get_fields') ) {
        $response->data['acf'] = get_fields( $post->ID );
    }
    return $response;
}, 10, 3 );

// Alimentar o select com as categorias do WP
add_filter('acf/load_field/name=selecao_categoria', function($field) {
    // 1. Resetamos as escolhas e adicionamos as opções padrão
    $field['choices'] = [
        'todas' => 'Todas as Categorias',
        'automatica' => 'Automática'
    ];

    // 2. Pegamos as categorias do banco de dados
    $categories = get_categories(array('hide_empty' => false));

    // 3. Montamos a lista para o Select
    if (!empty($categories)) {
        foreach ($categories as $category) {
            $field['choices'][$category->slug] = $category->name;
        }
    }

    return $field;
});


/* 

TODO: Verify the patch in:
/backend/wp-content/plugins/acf-extended/includes/fields/field-image.php

* Cause: Added isset($field['acfe_thumbnail']) fix.
* Warning: This patch must to be reapplied in future plugins updates.

*/