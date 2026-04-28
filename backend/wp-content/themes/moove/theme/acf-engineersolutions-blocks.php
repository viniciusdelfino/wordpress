<?php
/**
 * ACF Flexible Content - Layouts da Página Soluções de Engenharia
 *
 * 1. Injeta os layouts no Flexible Content "blocks" via acf/load_field (UI).
 * 2. Registra field keys via acf/init para get_fields() resolver corretamente.
 * 3. `_name` em cada sub_field para format_value() usar o nome correto.
 */

if (!defined('ABSPATH')) exit;

function moove_get_eng_solutions_layouts() {
    return [

        // ── Layout 1: Mídia Hero ─────────────────────────────────────────────
        'eng_media_hero' => [
            'key'        => 'layout_eng_media_hero',
            'name'       => 'eng_media_hero',
            'label'      => 'Mídia Hero',
            'display'    => 'block',
            'sub_fields' => [
                [
                    'key'           => 'field_eng_media_type',
                    'label'         => 'Tipo de Mídia',
                    'name'          => 'media_type',
                    '_name'         => 'media_type',
                    'type'          => 'radio',
                    'choices'       => ['image' => 'Imagem', 'video' => 'Vídeo'],
                    'default_value' => 'video',
                    'layout'        => 'horizontal',
                ],
                [
                    'key'               => 'field_eng_media_image',
                    'label'             => 'Imagem',
                    'name'              => 'image',
                    '_name'             => 'image',
                    'type'              => 'image',
                    'return_format'     => 'array',
                    'preview_size'      => 'medium',
                    'conditional_logic' => [[['field' => 'field_eng_media_type', 'operator' => '==', 'value' => 'image']]],
                ],
                [
                    'key'               => 'field_eng_media_video_url',
                    'label'             => 'URL do Vídeo',
                    'name'              => 'video_url',
                    '_name'             => 'video_url',
                    'type'              => 'url',
                    'instructions'      => 'URL direta para o arquivo de vídeo (.mp4, .webm, etc.)',
                    'conditional_logic' => [[['field' => 'field_eng_media_type', 'operator' => '==', 'value' => 'video']]],
                ],
            ],
        ],

        // ── Layout 2: Cards de Soluções ──────────────────────────────────────
        'eng_trust_cards' => [
            'key'        => 'layout_eng_trust_cards',
            'name'       => 'eng_trust_cards',
            'label'      => 'Cards de Soluções',
            'display'    => 'block',
            'sub_fields' => [
                [
                    'key'   => 'field_eng_trust_title',
                    'label' => 'Título',
                    'name'  => 'title',
                    '_name' => 'title',
                    'type'  => 'text',
                ],
                [
                    'key'   => 'field_eng_trust_description',
                    'label' => 'Descrição',
                    'name'  => 'description',
                    '_name' => 'description',
                    'type'  => 'textarea',
                    'rows'  => 3,
                ],
                [
                    'key'          => 'field_eng_trust_cards',
                    'label'        => 'Cards',
                    'name'         => 'cards',
                    '_name'        => 'cards',
                    'type'         => 'repeater',
                    'layout'       => 'block',
                    'button_label' => 'Adicionar Card',
                    'sub_fields'   => [
                        [
                            'key'           => 'field_eng_trust_card_icon',
                            'label'         => 'Ícone',
                            'name'          => 'icon',
                            '_name'         => 'icon',
                            'type'          => 'image',
                            'return_format' => 'array',
                            'preview_size'  => 'thumbnail',
                            'instructions'  => 'Ícone SVG ou PNG (recomendado 32x32px)',
                        ],
                        [
                            'key'   => 'field_eng_trust_card_title',
                            'label' => 'Título',
                            'name'  => 'title',
                            '_name' => 'title',
                            'type'  => 'text',
                        ],
                        [
                            'key'   => 'field_eng_trust_card_description',
                            'label' => 'Descrição',
                            'name'  => 'description',
                            '_name' => 'description',
                            'type'  => 'textarea',
                            'rows'  => 3,
                        ],
                    ],
                ],
            ],
        ],

        // ── Layout 3: Portfólio de Serviços (Tabs) ───────────────────────────
        'eng_portfolio_tabs' => [
            'key'        => 'layout_eng_portfolio_tabs',
            'name'       => 'eng_portfolio_tabs',
            'label'      => 'Portfólio de Serviços (Tabs)',
            'display'    => 'block',
            'sub_fields' => [
                [
                    'key'   => 'field_eng_portfolio_title',
                    'label' => 'Título da Seção',
                    'name'  => 'title',
                    '_name' => 'title',
                    'type'  => 'text',
                ],
                [
                    'key'          => 'field_eng_portfolio_tabs',
                    'label'        => 'Tabs',
                    'name'         => 'tabs',
                    '_name'        => 'tabs',
                    'type'         => 'repeater',
                    'layout'       => 'block',
                    'button_label' => 'Adicionar Tab',
                    'sub_fields'   => [
                        [
                            'key'   => 'field_eng_tab_label',
                            'label' => 'Nome da Tab',
                            'name'  => 'label',
                            '_name' => 'label',
                            'type'  => 'text',
                        ],
                        [
                            'key'          => 'field_eng_tab_content_sections',
                            'label'        => 'Seções de Conteúdo',
                            'name'         => 'content_sections',
                            '_name'        => 'content_sections',
                            'type'         => 'repeater',
                            'layout'       => 'block',
                            'button_label' => 'Adicionar Seção',
                            'instructions' => 'Cada seção alterna imagem/texto no desktop (esq→dir, dir→esq, ...)',
                            'sub_fields'   => [
                                [
                                    'key'           => 'field_eng_section_image',
                                    'label'         => 'Imagem',
                                    'name'          => 'image',
                                    '_name'         => 'image',
                                    'type'          => 'image',
                                    'return_format' => 'array',
                                    'preview_size'  => 'medium',
                                ],
                                [
                                    'key'   => 'field_eng_section_title',
                                    'label' => 'Título',
                                    'name'  => 'title',
                                    '_name' => 'title',
                                    'type'  => 'text',
                                ],
                                [
                                    'key'   => 'field_eng_section_description',
                                    'label' => 'Descrição',
                                    'name'  => 'description',
                                    '_name' => 'description',
                                    'type'  => 'textarea',
                                    'rows'  => 4,
                                ],
                                [
                                    'key'          => 'field_eng_section_bullets',
                                    'label'        => 'Bullets',
                                    'name'         => 'bullets',
                                    '_name'        => 'bullets',
                                    'type'         => 'repeater',
                                    'layout'       => 'table',
                                    'button_label' => 'Adicionar Bullet',
                                    'sub_fields'   => [
                                        [
                                            'key'   => 'field_eng_bullet_text',
                                            'label' => 'Texto',
                                            'name'  => 'text',
                                            '_name' => 'text',
                                            'type'  => 'text',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],

    ];
}

// TODO: será removido após a discussão sobre a utilização desse método para popular o WP
// ── Injeção de UI ─────────────────────────────────────────────────────────────
// add_filter('acf/load_field/name=blocks', 'moove_inject_engineersolutions_layouts');

// function moove_inject_engineersolutions_layouts($field) {
//     if (!isset($field['type']) || $field['type'] !== 'flexible_content') {
//         return $field;
//     }
//     if (!isset($field['layouts'])) {
//         $field['layouts'] = [];
//     }
//     foreach (moove_get_eng_solutions_layouts() as $key => $layout) {
//         $field['layouts'][$key] = $layout;
//     }
//     return $field;
// }

// // ── Registro de field keys (para get_fields() resolver nomes) ─────────────────
// add_action('acf/init', 'moove_register_eng_solutions_field_keys');

// function moove_register_eng_solutions_field_keys() {
//     if (!function_exists('acf_add_local_field')) {
//         return;
//     }
//     foreach (moove_eng_solutions_flatten_subfields_deep(moove_get_eng_solutions_layouts()) as $field) {
//         acf_add_local_field($field);
//     }
// }

function moove_eng_solutions_flatten_subfields_deep($layouts_or_fields) {
    $result = [];
    foreach ($layouts_or_fields as $item) {
        if (!empty($item['sub_fields'])) {
            foreach ($item['sub_fields'] as $field) {
                $result[] = $field;
                if (!empty($field['sub_fields'])) {
                    $result = array_merge($result, moove_eng_solutions_flatten_subfields_deep($field['sub_fields']));
                }
            }
        }
    }
    return $result;
}
