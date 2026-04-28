<?php
    
function moove_register_custom_posts() {
    
    // ======================
    // 1. CUSTOM POST TYPE: PRODUTOS
    // ======================
    $labels_produtos = array(
        'name'               => 'Produtos',
        'singular_name'      => 'Produto',
        'menu_name'          => 'Produtos',
        'add_new'            => 'Adicionar Novo',
        'add_new_item'       => 'Adicionar Novo Produto',
        'edit_item'          => 'Editar Produto',
        'all_items'          => 'Todos os Produtos',
        'search_items'       => 'Pesquisar Produtos',
        'not_found'          => 'Nenhum produto encontrado.',
        'not_found_in_trash' => 'Nenhum produto na lixeira.',
    );

    $args_produtos = array(
        'labels'             => $labels_produtos,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'produtos' ),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 5,
        'taxonomies'         => array( 'segmento', 'aplicacoes', 'pontos_lubrificacao', 'espessante', 'post_tag' ),
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'revisions' ),
        'menu_icon'          => 'dashicons-cart',
        'show_in_rest'       => true,
    );
    
    register_post_type( 'produtos', $args_produtos );

    // ======================
    // 2. CUSTOM POST TYPE: INDÚSTRIA
    // ======================
    $labels_industria = array(
        'name'               => 'Indústria',
        'singular_name'      => 'Indústria',
        'menu_name'          => 'Indústria',
        'add_new'            => 'Adicionar Novo',
        'add_new_item'       => 'Adicionar Novo Indústria',
        'edit_item'          => 'Editar Indústria',
        'all_items'          => 'Todos os Produtos Industriais',
        'search_items'       => 'Pesquisar Produtos Industriais',
        'not_found'          => 'Nenhum Indústria encontrado.',
        'not_found_in_trash' => 'Nenhum Indústria na lixeira.',
    );

    $args_industria = array(
        'labels'             => $labels_industria,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'industria' ),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 6, 
        'taxonomies'         => array(), 
        'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'revisions' ),
        'menu_icon'          => 'dashicons-hammer',
        'show_in_rest'       => true,
    );
    
    register_post_type( 'industria', $args_industria );

    // ======================
    // 3. TAXONOMIAS PRODUTOS
    // ======================

    $labels_segmento = array(
        'name'              => 'Segmentos',
        'singular_name'     => 'Segmento',
        'search_items'      => 'Pesquisar Segmentos',
        'all_items'         => 'Todos os Segmentos',
        'parent_item'       => 'Segmento Pai',
        'parent_item_colon' => 'Segmento Pai:',
        'edit_item'         => 'Editar Segmento',
        'update_item'       => 'Atualizar Segmento',
        'add_new_item'      => 'Adicionar Novo Segmento',
        'new_item_name'     => 'Novo Nome de Segmento',
        'menu_name'         => 'Segmentos',
        'back_to_items'     => '← Voltar para Segmentos',
    );

    $args_segmento = array(
        'hierarchical'      => true,
        'labels'            => $labels_segmento,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'segmento' ),
        'show_in_rest'      => true,
        'post_types'        => array( 'produtos' ),
    );

    register_taxonomy( 'segmento', array( 'produtos' ), $args_segmento );

    $labels_aplicacoes = array(
        'name'              => 'Aplicações',
        'singular_name'     => 'Aplicação',
        'search_items'      => 'Pesquisar Aplicações',
        'all_items'         => 'Todas as Aplicações',
        'parent_item'       => 'Aplicação Pai',
        'parent_item_colon' => 'Aplicação Pai:',
        'edit_item'         => 'Editar Aplicação',
        'update_item'       => 'Atualizar Aplicação',
        'add_new_item'      => 'Adicionar Nova Aplicação',
        'new_item_name'     => 'Novo Nome de Aplicação',
        'menu_name'         => 'Aplicações',
        'back_to_items'     => '← Voltar para Aplicações',
    );

    $args_aplicacoes = array(
        'hierarchical'      => true,
        'labels'            => $labels_aplicacoes,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'aplicacoes' ),
        'show_in_rest'      => true,
        'post_types'        => array( 'produtos' ),
    );

    register_taxonomy( 'aplicacoes', array( 'produtos' ), $args_aplicacoes );

    $labels_pontos_lubrificacao = array(
        'name'              => 'Pontos de lubrificação',
        'singular_name'     => 'Ponto de lubrificação',
        'search_items'      => 'Pesquisar Pontos de lubrificação',
        'all_items'         => 'Todos os Pontos de lubrificação',
        'parent_item'       => 'Ponto de lubrificação Pai',
        'parent_item_colon' => 'Ponto de lubrificação Pai:',
        'edit_item'         => 'Editar Ponto de lubrificação',
        'update_item'       => 'Atualizar Ponto de lubrificação',
        'add_new_item'      => 'Adicionar Novo Ponto de lubrificação',
        'new_item_name'     => 'Novo Nome de Ponto de lubrificação',
        'menu_name'         => 'Pontos de lubrificação',
        'back_to_items'     => '← Voltar para Pontos de lubrificação',
    );

    $args_pontos_lubrificacao = array(
        'hierarchical'      => true,
        'labels'            => $labels_pontos_lubrificacao,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'pontos-lubrificacao' ),
        'show_in_rest'      => true,
        'post_types'        => array( 'produtos' ),
    );

    register_taxonomy( 'pontos_lubrificacao', array( 'produtos' ), $args_pontos_lubrificacao );

    $labels_espessante = array(
        'name'              => 'Espessante',
        'singular_name'     => 'Espessante',
        'search_items'      => 'Pesquisar Espessante',
        'all_items'         => 'Todos os Espessantes',
        'parent_item'       => 'Espessante Pai',
        'parent_item_colon' => 'Espessante Pai:',
        'edit_item'         => 'Editar Espessante',
        'update_item'       => 'Atualizar Espessante',
        'add_new_item'      => 'Adicionar Novo Espessante',
        'new_item_name'     => 'Novo Nome de Espessante',
        'menu_name'         => 'Espessante',
        'back_to_items'     => '← Voltar para Espessante',
    );

    $args_espessante = array(
        'hierarchical'      => true,
        'labels'            => $labels_espessante,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'espessante' ),
        'show_in_rest'      => true,
        'post_types'        => array( 'produtos' ),
    );
    register_taxonomy( 'espessante', array( 'produtos' ), $args_espessante );

    // ======================
    // 4. TAXONOMIAS DE CONTEUDO (BLOG)
    // ======================

    $labels_editorial = array(
        'name'              => 'Editorial e Assuntos',
        'singular_name'     => 'Editorial/Assunto',
        'search_items'      => 'Pesquisar Editorial e Assuntos',
        'all_items'         => 'Todos os Editoriais e Assuntos',
        'parent_item'       => 'Editorial Pai',
        'parent_item_colon' => 'Editorial Pai:',
        'edit_item'         => 'Editar Editorial/Assunto',
        'update_item'       => 'Atualizar Editorial/Assunto',
        'add_new_item'      => 'Adicionar Novo Editorial ou Assunto',
        'new_item_name'     => 'Novo Nome de Editorial/Assunto',
        'menu_name'         => 'Editorial e Assuntos',
        'back_to_items'     => '← Voltar para Editorial e Assuntos',
    );

    $args_editorial = array(
        'hierarchical'      => true,
        'labels'            => $labels_editorial,
        'description'       => 'Use termos pai para editoriais (ex: Guia do oleo) e termos filhos para assuntos (ex: Carros, Motos).',
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'editorial' ),
        'show_in_rest'      => true,
        'post_types'        => array( 'post' ),
    );

    register_taxonomy( 'editorial', array( 'post' ), $args_editorial );

    $labels_segmento_industrial = array(
        'name'              => 'Segmentos Industriais',
        'singular_name'     => 'Segmento Industrial',
        'search_items'      => 'Pesquisar Segmentos Industriais',
        'all_items'         => 'Todos os Segmentos Industriais',
        'parent_item'       => 'Segmento Industrial Pai',
        'parent_item_colon' => 'Segmento Industrial Pai:',
        'edit_item'         => 'Editar Segmento Industrial',
        'update_item'       => 'Atualizar Segmento Industrial',
        'add_new_item'      => 'Adicionar Novo Segmento Industrial',
        'new_item_name'     => 'Novo Nome de Segmento Industrial',
        'menu_name'         => 'Segmentos Industriais',
        'back_to_items'     => '← Voltar para Segmentos Industriais',
    );

    $args_segmento_industrial = array(
        'hierarchical'      => true,
        'labels'            => $labels_segmento_industrial,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'segmento-industrial' ),
        'show_in_rest'      => true,
        'post_types'        => array( 'post' ),
    );

    register_taxonomy( 'segmento_industrial', array( 'post' ), $args_segmento_industrial );

    // ======================
    // 4. CUSTOM POST TYPE: EVENTOS
    // ======================
    $labels_eventos = array(
        'name'               => 'Eventos',
        'singular_name'      => 'Evento',
        'menu_name'          => 'Eventos',
        'add_new'            => 'Adicionar Novo',
        'add_new_item'       => 'Adicionar Novo Evento',
        'edit_item'          => 'Editar Evento',
        'all_items'          => 'Todos os Eventos',
        'search_items'       => 'Pesquisar Eventos',
        'not_found'          => 'Nenhum evento encontrado.',
        'not_found_in_trash' => 'Nenhum evento na lixeira.',
    );

    $args_eventos = array(
        'labels'             => $labels_eventos,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'eventos' ),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 7,
        'supports'           => array( 'title', 'thumbnail', 'excerpt', 'custom-fields', 'revisions' ),
        'menu_icon'          => 'dashicons-calendar',
        'show_in_rest'       => true,
    );

    register_post_type( 'eventos', $args_eventos );
}
add_action( 'init', 'moove_register_custom_posts' );

// ======================
// FUNÇÃO PARA SEPARAR OS MENUS NO ADMIN
// ======================

function moove_separar_menus_admin() {
    remove_submenu_page('edit.php?post_type=industria', 'edit-tags.php?taxonomy=category&amp;post_type=industria');
    remove_submenu_page('edit.php?post_type=industria', 'edit-tags.php?taxonomy=post_tag&amp;post_type=industria');
}
add_action('admin_menu', 'moove_separar_menus_admin');

// ======================
// LIMPAR PERMALINKS AO ATIVAR
// ======================

function moove_rewrite_flush() {
    moove_register_custom_posts();
    flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'moove_rewrite_flush' );