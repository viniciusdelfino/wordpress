<?php

function moove_register_menus() {
    register_nav_menus(
        array(
            'primary' => __( 'Menu Principal', 'moove' ),
            'footer'  => __( 'Menu Rodapé', 'moove' ),
        )
    );
}
add_action( 'after_setup_theme', 'moove_register_menus' );