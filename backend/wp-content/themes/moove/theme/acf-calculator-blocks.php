<?php
/**
 * ACF Flexible Content - Blocos das Calculadoras Mobil SHC
 *
 * Define os layouts do Flexible Content para as 6 calculadoras
 * para serem usados no BlockRenderer do frontend.
 *
 * Tipos de bloco registrados:
 *   - calculator_gears          (Calculadora de Engrenagens)
 *   - calculator_compressors    (Calculadora de Compressores de Ar)
 *   - calculator_bearings       (Calculadora de Rolamentos)
 *   - calculator_electric_motor (Calculadora de Motores Elétricos)
 *   - calculator_hydraulics     (Calculadora Hidráulica)
 *   - calculator_gas_engine     (Calculadora de Motores a Gás)
 */

if (!defined('ABSPATH')) exit;

add_action('acf/init', 'moove_register_calculator_blocks');

/**
 * Retorna os sub_fields comuns de imagem (desktop e mobile) para cada calculadora
 */
function moove_calculator_image_fields($prefix) {
    return [
        [
            'key' => "field_calc_{$prefix}_image",
            'label' => 'Imagem do Hero (Desktop)',
            'name' => 'image',
            'type' => 'image',
            'return_format' => 'array',
            'preview_size' => 'medium',
            'instructions' => 'Imagem de fundo do hero para desktop (recomendado: 1920x400px).',
        ],
        [
            'key' => "field_calc_{$prefix}_image_mobile",
            'label' => 'Imagem do Hero (Mobile)',
            'name' => 'image_mobile',
            'type' => 'image',
            'return_format' => 'array',
            'preview_size' => 'medium',
            'instructions' => 'Imagem de fundo do hero para mobile (recomendado: 768x400px). Se não preenchido, usa a imagem desktop.',
        ],
    ];
}

/**
 * Retorna os sub_fields comuns de link (contato e produto) para cada calculadora
 */
function moove_calculator_link_fields($prefix) {
    return [
        [
            'key' => "field_calc_{$prefix}_contact_link",
            'label' => 'Link "Fale conosco"',
            'name' => 'contact_link',
            'type' => 'text',
            'default_value' => '/contato',
            'instructions' => 'URL do botão "Fale conosco" na sidebar de resultados.',
        ],
        [
            'key' => "field_calc_{$prefix}_product_link",
            'label' => 'Link "Conhecer linha Mobil SHC"',
            'name' => 'product_link',
            'type' => 'text',
            'default_value' => '/mobil-shc',
            'instructions' => 'URL do botão "Conhecer a linha Mobil SHC™" na sidebar de resultados.',
        ],
    ];
}

function moove_register_calculator_blocks() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_calculator_page_blocks',
        'title' => 'Blocos das Calculadoras',
        'fields' => [
            [
                'key' => 'field_calculator_blocks',
                'label' => 'Blocos',
                'name' => 'blocks',
                'type' => 'flexible_content',
                'layouts' => [

                    // ──────────────────────────────────────────────
                    // 1. Calculadora de Engrenagens
                    // ──────────────────────────────────────────────
                    'calculator_gears' => [
                        'key' => 'layout_calculator_gears',
                        'name' => 'calculator_gears',
                        'label' => 'Calculadora de Engrenagens',
                        'display' => 'block',
                        'sub_fields' => array_merge([
                            [
                                'key' => 'field_calc_gears_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                                'default_value' => 'Calculadora de Engrenagens',
                            ],
                            [
                                'key' => 'field_calc_gears_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                        ], moove_calculator_image_fields('gears'), moove_calculator_link_fields('gears')),
                    ],

                    // ──────────────────────────────────────────────
                    // 2. Calculadora de Compressores de Ar
                    // ──────────────────────────────────────────────
                    'calculator_compressors' => [
                        'key' => 'layout_calculator_compressors',
                        'name' => 'calculator_compressors',
                        'label' => 'Calculadora de Compressores',
                        'display' => 'block',
                        'sub_fields' => array_merge([
                            [
                                'key' => 'field_calc_compressors_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                                'default_value' => 'Calculadora de Compressores de Ar',
                            ],
                            [
                                'key' => 'field_calc_compressors_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                        ], moove_calculator_image_fields('compressors'), moove_calculator_link_fields('compressors')),
                    ],

                    // ──────────────────────────────────────────────
                    // 3. Calculadora de Rolamentos
                    // ──────────────────────────────────────────────
                    'calculator_bearings' => [
                        'key' => 'layout_calculator_bearings',
                        'name' => 'calculator_bearings',
                        'label' => 'Calculadora de Rolamentos',
                        'display' => 'block',
                        'sub_fields' => array_merge([
                            [
                                'key' => 'field_calc_bearings_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                                'default_value' => 'Calculadora de Rolamentos',
                            ],
                            [
                                'key' => 'field_calc_bearings_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                        ], moove_calculator_image_fields('bearings'), moove_calculator_link_fields('bearings')),
                    ],

                    // ──────────────────────────────────────────────
                    // 4. Calculadora de Motores Elétricos
                    // ──────────────────────────────────────────────
                    'calculator_electric_motor' => [
                        'key' => 'layout_calculator_electric_motor',
                        'name' => 'calculator_electric_motor',
                        'label' => 'Calculadora de Motores Elétricos',
                        'display' => 'block',
                        'sub_fields' => array_merge([
                            [
                                'key' => 'field_calc_electric_motor_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                                'default_value' => 'Calculadora de Motores Elétricos',
                            ],
                            [
                                'key' => 'field_calc_electric_motor_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                        ], moove_calculator_image_fields('electric_motor'), moove_calculator_link_fields('electric_motor')),
                    ],

                    // ──────────────────────────────────────────────
                    // 5. Calculadora Hidráulica
                    // ──────────────────────────────────────────────
                    'calculator_hydraulics' => [
                        'key' => 'layout_calculator_hydraulics',
                        'name' => 'calculator_hydraulics',
                        'label' => 'Calculadora Hidráulica',
                        'display' => 'block',
                        'sub_fields' => array_merge([
                            [
                                'key' => 'field_calc_hydraulics_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                                'default_value' => 'Calculadora Hidráulica',
                            ],
                            [
                                'key' => 'field_calc_hydraulics_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                        ], moove_calculator_image_fields('hydraulics'), moove_calculator_link_fields('hydraulics')),
                    ],

                    // ──────────────────────────────────────────────
                    // 6. Calculadora de Motores a Gás
                    // ──────────────────────────────────────────────
                    'calculator_gas_engine' => [
                        'key' => 'layout_calculator_gas_engine',
                        'name' => 'calculator_gas_engine',
                        'label' => 'Calculadora de Motores a Gás',
                        'display' => 'block',
                        'sub_fields' => array_merge([
                            [
                                'key' => 'field_calc_gas_engine_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                                'default_value' => 'Calculadora de Motores a Gás',
                            ],
                            [
                                'key' => 'field_calc_gas_engine_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                        ], moove_calculator_image_fields('gas_engine'), moove_calculator_link_fields('gas_engine')),
                    ],

                ],
                'button_label' => 'Adicionar Calculadora',
            ],
        ],
        'location' => [
            // Opção 1: Vinculado a uma página específica pelo slug
            [
                [
                    'param' => 'page',
                    'operator' => '==',
                    'value' => moove_get_calculator_page_id('calculadora-engrenagens'),
                ],
            ],
            [
                [
                    'param' => 'page',
                    'operator' => '==',
                    'value' => moove_get_calculator_page_id('calculadora-compressores'),
                ],
            ],
            [
                [
                    'param' => 'page',
                    'operator' => '==',
                    'value' => moove_get_calculator_page_id('calculadora-rolamentos'),
                ],
            ],
            [
                [
                    'param' => 'page',
                    'operator' => '==',
                    'value' => moove_get_calculator_page_id('calculadora-motores-eletricos'),
                ],
            ],
            [
                [
                    'param' => 'page',
                    'operator' => '==',
                    'value' => moove_get_calculator_page_id('calculadora-hidraulica'),
                ],
            ],
            [
                [
                    'param' => 'page',
                    'operator' => '==',
                    'value' => moove_get_calculator_page_id('calculadora-motores-gas'),
                ],
            ],
            // Opção 2: Alternativa - usar template de página
            // [
            //     [
            //         'param' => 'page_template',
            //         'operator' => '==',
            //         'value' => 'template-calculadora.php',
            //     ],
            // ],
        ],
        'menu_order' => 0,
        'position' => 'normal',
        'style' => 'default',
        'label_placement' => 'top',
        'instruction_placement' => 'label',
        'hide_on_screen' => ['the_content'],
        'active' => true,
    ]);
}

/**
 * Obtém o ID de uma página de calculadora pelo slug
 */
function moove_get_calculator_page_id($slug) {
    $page = get_page_by_path($slug, OBJECT, 'page');
    return $page ? $page->ID : 0;
}
