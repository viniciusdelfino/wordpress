<?php
// ==============================================
// 1. DESATIVAR GUTENBERG PARA PRODUTOS
// ==============================================
add_filter('use_block_editor_for_post_type', 'moove_disable_gutenberg_produtos', 10, 2);

function moove_disable_gutenberg_produtos($use_block_editor, $post_type) {
    if ($post_type === 'produtos') {
        return false;
    }
    return $use_block_editor;
}