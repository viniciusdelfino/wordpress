<?php
/**
 * ACF Flexible Content - Blocos da Página Troca Inteligente
 *
 * Define os layouts do Flexible Content para a LP "Troca Inteligente"
 * para serem usados no BlockRenderer do frontend.
 *
 * Blocos registrados (novos):
 * - troca_hero: Hero com tabs de navegação
 * - troca_process_steps: Passos do processo (3 cards com imagem)
 * - troca_impact_numbers: Números de impacto (card dark-blue com métricas)
 * - troca_pillars: Três pilares com stats
 * - troca_tech_features: Grid de features tecnológicas (3x2)
 *
 * Blocos reutilizados:
 * - video_section: Seção de vídeo
 * - cta_banner: Banner de CTA
 * - distribution_cards: Cards de distribuição
 * - mobil_midia: Mobil na mídia
 */

if (!defined('ABSPATH')) exit;

add_action('acf/init', 'moove_register_trocainteligente_blocks');

function moove_register_trocainteligente_blocks() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_troca_inteligente_blocks',
        'title' => 'Blocos da Página Troca Inteligente',
        'fields' => [
            [
                'key' => 'field_troca_blocks',
                'label' => 'Blocos',
                'name' => 'blocks',
                'type' => 'flexible_content',
                'layouts' => [

                    // =========================================================
                    // Layout: Troca Hero (com tabs)
                    // =========================================================
                    'troca_hero' => [
                        'key' => 'layout_troca_hero',
                        'name' => 'troca_hero',
                        'label' => 'Hero Troca Inteligente',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_hero_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'wysiwyg',
                                'tabs' => 'all',
                                'toolbar' => 'basic',
                                'media_upload' => 0,
                                'instructions' => 'Título principal do hero. Use negrito para destacar palavras (ex: <strong>Óleo a granel</strong> com rastreabilidade <strong>total</strong>)',
                            ],
                            [
                                'key' => 'field_troca_hero_subtitle',
                                'label' => 'Subtítulo',
                                'name' => 'subtitle',
                                'type' => 'textarea',
                                'rows' => 3,
                                'instructions' => 'Texto descritivo abaixo do título.',
                            ],
                            [
                                'key' => 'field_troca_hero_bg_image',
                                'label' => 'Imagem de Fundo (Desktop)',
                                'name' => 'background_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                            ],
                            [
                                'key' => 'field_troca_hero_bg_image_mobile',
                                'label' => 'Imagem de Fundo (Mobile)',
                                'name' => 'background_image_mobile',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'instructions' => 'Opcional. Se vazio, usa a imagem desktop.',
                            ],
                            [
                                'key' => 'field_troca_hero_tabs',
                                'label' => 'Tabs',
                                'name' => 'tabs',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Tab',
                                'max' => 5,
                                'sub_fields' => [
                                    [
                                        'key' => 'field_troca_hero_tab_icon',
                                        'label' => 'Ícone',
                                        'name' => 'icon',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'thumbnail',
                                        'instructions' => 'Ícone SVG da tab (48x44px recomendado)',
                                    ],
                                    [
                                        'key' => 'field_troca_hero_tab_label',
                                        'label' => 'Label',
                                        'name' => 'label',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Alta tecnologia e inovação"',
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Troca Process Steps
                    // =========================================================
                    'troca_process_steps' => [
                        'key' => 'layout_troca_process_steps',
                        'name' => 'troca_process_steps',
                        'label' => 'Passos do Processo',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_steps_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_steps_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_troca_steps_items',
                                'label' => 'Passos',
                                'name' => 'steps',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Passo',
                                'max' => 5,
                                'sub_fields' => [
                                    [
                                        'key' => 'field_troca_step_image',
                                        'label' => 'Imagem',
                                        'name' => 'image',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'medium',
                                    ],
                                    [
                                        'key' => 'field_troca_step_label',
                                        'label' => 'Label',
                                        'name' => 'label',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Tanque de 400L"',
                                    ],
                                    [
                                        'key' => 'field_troca_step_description',
                                        'label' => 'Descrição',
                                        'name' => 'description',
                                        'type' => 'textarea',
                                        'rows' => 2,
                                        'instructions' => 'Texto descritivo do passo. Ex: "O lubrificante Mobil™ chega à oficina em tanques de 400 litros..."',
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Troca Impact Numbers
                    // =========================================================
                    'troca_impact_numbers' => [
                        'key' => 'layout_troca_impact_numbers',
                        'name' => 'troca_impact_numbers',
                        'label' => 'Números de Impacto',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_impact_badge',
                                'label' => 'Badge',
                                'name' => 'badge',
                                'type' => 'text',
                                'instructions' => 'Ex: "Impacto real"',
                            ],
                            [
                                'key' => 'field_troca_impact_badge_icon',
                                'label' => 'Ícone do Badge',
                                'name' => 'badge_icon',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'thumbnail',
                            ],
                            [
                                'key' => 'field_troca_impact_image',
                                'label' => 'Imagem (lado esquerdo)',
                                'name' => 'image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'instructions' => 'Imagem grande exibida ao lado esquerdo do card (512x558px recomendado)',
                            ],
                            [
                                'key' => 'field_troca_impact_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_impact_subtitle',
                                'label' => 'Subtítulo',
                                'name' => 'subtitle',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_troca_impact_metrics',
                                'label' => 'Métricas',
                                'name' => 'metrics',
                                'type' => 'repeater',
                                'layout' => 'table',
                                'button_label' => 'Adicionar Métrica',
                                'max' => 4,
                                'sub_fields' => [
                                    [
                                        'key' => 'field_troca_metric_number',
                                        'label' => 'Número',
                                        'name' => 'number',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "2M+", "15mil+"',
                                    ],
                                    [
                                        'key' => 'field_troca_metric_label',
                                        'label' => 'Label',
                                        'name' => 'label',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "embalagens plásticas economizadas por ano"',
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Troca Pillars
                    // =========================================================
                    'troca_pillars' => [
                        'key' => 'layout_troca_pillars',
                        'name' => 'troca_pillars',
                        'label' => 'Três Pilares',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_pillars_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_pillars_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_troca_pillars_items',
                                'label' => 'Pilares',
                                'name' => 'pillars',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Pilar',
                                'max' => 3,
                                'sub_fields' => [
                                    [
                                        'key' => 'field_troca_pillar_icon',
                                        'label' => 'Ícone',
                                        'name' => 'icon',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'thumbnail',
                                    ],
                                    [
                                        'key' => 'field_troca_pillar_name',
                                        'label' => 'Nome',
                                        'name' => 'name',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Sustentabilidade"',
                                    ],
                                    [
                                        'key' => 'field_troca_pillar_description',
                                        'label' => 'Descrição',
                                        'name' => 'description',
                                        'type' => 'textarea',
                                        'rows' => 3,
                                    ],
                                    [
                                        'key' => 'field_troca_pillar_stats',
                                        'label' => 'Estatísticas',
                                        'name' => 'stats',
                                        'type' => 'repeater',
                                        'layout' => 'table',
                                        'button_label' => 'Adicionar Stat',
                                        'max' => 4,
                                        'sub_fields' => [
                                            [
                                                'key' => 'field_troca_pillar_stat_number',
                                                'label' => 'Número',
                                                'name' => 'number',
                                                'type' => 'text',
                                                'instructions' => 'Ex: "90%"',
                                            ],
                                            [
                                                'key' => 'field_troca_pillar_stat_label',
                                                'label' => 'Label',
                                                'name' => 'label',
                                                'type' => 'text',
                                                'instructions' => 'Ex: "menos plástico"',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Troca Tech Features
                    // =========================================================
                    'troca_tech_features' => [
                        'key' => 'layout_troca_tech_features',
                        'name' => 'troca_tech_features',
                        'label' => 'Features Tecnológicas',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_tech_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_tech_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_troca_tech_cards',
                                'label' => 'Cards',
                                'name' => 'cards',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Card',
                                'max' => 6,
                                'sub_fields' => [
                                    [
                                        'key' => 'field_troca_tech_card_icon',
                                        'label' => 'Ícone',
                                        'name' => 'icon',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'thumbnail',
                                    ],
                                    [
                                        'key' => 'field_troca_tech_card_title',
                                        'label' => 'Título',
                                        'name' => 'title',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_troca_tech_card_description',
                                        'label' => 'Descrição',
                                        'name' => 'description',
                                        'type' => 'textarea',
                                        'rows' => 3,
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Video Section (reutilizado)
                    // =========================================================
                    'video_section' => [
                        'key' => 'layout_troca_video_section',
                        'name' => 'video_section',
                        'label' => 'Seção de Vídeo',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_video_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_video_text',
                                'label' => 'Texto',
                                'name' => 'text',
                                'type' => 'textarea',
                                'rows' => 4,
                            ],
                            [
                                'key' => 'field_troca_video_url',
                                'label' => 'URL do Vídeo',
                                'name' => 'video_url',
                                'type' => 'url',
                                'instructions' => 'YouTube ou Vimeo.',
                            ],
                            [
                                'key' => 'field_troca_video_thumbnail',
                                'label' => 'Thumbnail',
                                'name' => 'thumbnail',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: CTA Banner (reutilizado)
                    // =========================================================
                    'cta_banner' => [
                        'key' => 'layout_troca_cta_banner',
                        'name' => 'cta_banner',
                        'label' => 'Banner de CTA',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_cta_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_cta_text',
                                'label' => 'Texto',
                                'name' => 'text',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_troca_cta_button_text',
                                'label' => 'Texto do Botão',
                                'name' => 'button_text',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_cta_button_url',
                                'label' => 'URL do Botão',
                                'name' => 'button_url',
                                'type' => 'url',
                            ],
                            [
                                'key' => 'field_troca_cta_bg_image',
                                'label' => 'Imagem de Fundo',
                                'name' => 'background_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Distribution Cards (reutilizado)
                    // =========================================================
                    'distribution_cards' => [
                        'key' => 'layout_troca_distribution_cards',
                        'name' => 'distribution_cards',
                        'label' => 'Cards de Distribuição',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_dist_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_troca_dist_subtitle',
                                'label' => 'Subtítulo',
                                'name' => 'subtitle',
                                'type' => 'textarea',
                                'rows' => 2,
                            ],
                            [
                                'key' => 'field_troca_dist_cards',
                                'label' => 'Cards',
                                'name' => 'cards',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Card',
                                'sub_fields' => [
                                    [
                                        'key' => 'field_troca_dist_card_icon',
                                        'label' => 'Ícone',
                                        'name' => 'icon',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'thumbnail',
                                    ],
                                    [
                                        'key' => 'field_troca_dist_card_title',
                                        'label' => 'Título',
                                        'name' => 'title',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_troca_dist_card_description',
                                        'label' => 'Descrição',
                                        'name' => 'description',
                                        'type' => 'textarea',
                                        'rows' => 2,
                                    ],
                                    [
                                        'key' => 'field_troca_dist_card_image',
                                        'label' => 'Imagem',
                                        'name' => 'image',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'medium',
                                    ],
                                    [
                                        'key' => 'field_troca_dist_card_button_text',
                                        'label' => 'Texto do Botão',
                                        'name' => 'button_text',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_troca_dist_card_button_url',
                                        'label' => 'URL do Botão',
                                        'name' => 'button_url',
                                        'type' => 'url',
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Mobil na Mídia (reutilizado)
                    // =========================================================
                    'mobil_midia' => [
                        'key' => 'layout_troca_mobil_midia',
                        'name' => 'mobil_midia',
                        'label' => 'Mobil na Mídia',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_troca_midia_desc',
                                'label' => 'Descrição',
                                'name' => 'desc',
                                'type' => 'wysiwyg',
                                'tabs' => 'all',
                                'toolbar' => 'basic',
                                'media_upload' => 0,
                                'instructions' => 'Título e subtítulo da seção (ex: <h2>Mobil na mídia</h2><p>Texto descritivo</p>)',
                            ],
                        ],
                    ],

                ],
                'button_label' => 'Adicionar Bloco',
            ],
        ],
        'location' => [
            [
                [
                    'param' => 'page',
                    'operator' => '==',
                    'value' => moove_get_troca_inteligente_page_id(),
                ],
            ],
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
 * Obtém o ID da página Troca Inteligente
 */
function moove_get_troca_inteligente_page_id() {
    $page = get_page_by_path('troca-inteligente');
    return $page ? $page->ID : 0;
}
