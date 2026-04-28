<?php
/**
 * ACF Flexible Content - Blocos da Página de Parceiros
 *
 * Define os layouts do Flexible Content para a página de parceiros
 * para serem usados no BlockRenderer do frontend.
 *
 * Blocos registrados:
 * - partners_hero: Hero principal com imagem de fundo e badges
 * - influencers_section: Seção de influenciadores/embaixador
 * - partnership_cards: Cards de parceria com flip (frente/verso)
 * - logo_grid: Grid de logos de parceiros
 * - cta_banner: Banner de CTA com imagem de fundo
 */

if (!defined('ABSPATH')) exit;

add_action('acf/init', 'moove_register_partners_blocks');

function moove_register_partners_blocks() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_partners_page_blocks',
        'title' => 'Blocos da Página de Parceiros',
        'fields' => [
            [
                'key' => 'field_partners_blocks',
                'label' => 'Blocos',
                'name' => 'blocks',
                'type' => 'flexible_content',
                'layouts' => [

                    // =========================================================
                    // Layout: Partners Hero
                    // =========================================================
                    'partners_hero' => [
                        'key' => 'layout_partners_hero',
                        'name' => 'partners_hero',
                        'label' => 'Hero de Parceiros',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_partners_hero_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'wysiwyg',
                                'instructions' => 'Use <b> ou negrito para destacar palavras. Ex: Juntos <b>dentro</b> e <b>fora</b> das pistas',
                                'tabs' => 'all',
                                'toolbar' => 'basic',
                                'media_upload' => 0,
                            ],
                            [
                                'key' => 'field_partners_hero_subtitle',
                                'label' => 'Subtítulo',
                                'name' => 'subtitle',
                                'type' => 'textarea',
                                'rows' => 2,
                            ],
                            [
                                'key' => 'field_partners_hero_bg_image',
                                'label' => 'Imagem de Fundo',
                                'name' => 'background_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'instructions' => 'Imagem de fundo principal do hero.',
                            ],
                            [
                                'key' => 'field_partners_hero_car_image',
                                'label' => 'Imagem do Carro (Overlay)',
                                'name' => 'car_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'instructions' => 'Imagem sobreposta à imagem de fundo (ex: carro de corrida).',
                            ],
                            [
                                'key' => 'field_partners_hero_badges',
                                'label' => 'Badges',
                                'name' => 'badges',
                                'type' => 'repeater',
                                'layout' => 'table',
                                'button_label' => 'Adicionar Badge',
                                'max' => 5,
                                'sub_fields' => [
                                    [
                                        'key' => 'field_partners_hero_badge_icon',
                                        'label' => 'Ícone',
                                        'name' => 'icon',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'thumbnail',
                                        'instructions' => 'Ícone do badge (48x44px recomendado)',
                                    ],
                                    [
                                        'key' => 'field_partners_hero_badge_text',
                                        'label' => 'Texto',
                                        'name' => 'text',
                                        'type' => 'text',
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Influencers Section
                    // =========================================================
                    'influencers_section' => [
                        'key' => 'layout_influencers_section',
                        'name' => 'influencers_section',
                        'label' => 'Seção de Influenciadores',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_influencers_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_influencers_subtitle',
                                'label' => 'Subtítulo',
                                'name' => 'subtitle',
                                'type' => 'textarea',
                                'rows' => 2,
                            ],
                            // Embaixador (exibido apenas no mobile)
                            [
                                'key' => 'field_influencers_ambassador',
                                'label' => 'Embaixador',
                                'name' => 'ambassador',
                                'type' => 'group',
                                'instructions' => 'Card do embaixador principal. Exibido apenas no mobile.',
                                'layout' => 'block',
                                'sub_fields' => [
                                    [
                                        'key' => 'field_ambassador_image',
                                        'label' => 'Foto',
                                        'name' => 'image',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'medium',
                                    ],
                                    [
                                        'key' => 'field_ambassador_tag',
                                        'label' => 'Tag',
                                        'name' => 'tag',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Selo de Autoridade"',
                                    ],
                                    [
                                        'key' => 'field_ambassador_name',
                                        'label' => 'Nome',
                                        'name' => 'name',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_ambassador_description',
                                        'label' => 'Descrição',
                                        'name' => 'description',
                                        'type' => 'textarea',
                                        'rows' => 3,
                                        'instructions' => 'Texto em itálico abaixo do nome.',
                                    ],
                                    [
                                        'key' => 'field_ambassador_badge_text',
                                        'label' => 'Texto do Badge',
                                        'name' => 'badge_text',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Embaixador Mobil™"',
                                    ],
                                    [
                                        'key' => 'field_ambassador_handle',
                                        'label' => 'Handle (@ rede social)',
                                        'name' => 'handle',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "@rubarrichello"',
                                    ],
                                ],
                            ],
                            // Cards de influenciadores
                            [
                                'key' => 'field_influencers_cards',
                                'label' => 'Cards de Influenciadores',
                                'name' => 'cards',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Influenciador',
                                'sub_fields' => [
                                    [
                                        'key' => 'field_influencer_card_image',
                                        'label' => 'Foto',
                                        'name' => 'image',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'medium',
                                    ],
                                    [
                                        'key' => 'field_influencer_card_badge',
                                        'label' => 'Badge / Profissão',
                                        'name' => 'badge',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Piloto e Criador de Conteúdo"',
                                    ],
                                    [
                                        'key' => 'field_influencer_card_name',
                                        'label' => 'Nome',
                                        'name' => 'name',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_influencer_card_handle',
                                        'label' => 'Handle (@ rede social)',
                                        'name' => 'handle',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "@dudubarrichello"',
                                    ],
                                    [
                                        'key' => 'field_influencer_card_description',
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
                    // Layout: Partnership Cards
                    // =========================================================
                    'partnership_cards' => [
                        'key' => 'layout_partnership_cards',
                        'name' => 'partnership_cards',
                        'label' => 'Cards de Parceria (Flip)',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_partnership_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_partnership_subtitle',
                                'label' => 'Subtítulo',
                                'name' => 'subtitle',
                                'type' => 'textarea',
                                'rows' => 2,
                            ],
                            [
                                'key' => 'field_partnership_cards',
                                'label' => 'Cards',
                                'name' => 'cards',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Card',
                                'sub_fields' => [
                                    [
                                        'key' => 'field_partnership_card_image',
                                        'label' => 'Imagem de Fundo',
                                        'name' => 'image',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'medium',
                                    ],
                                    [
                                        'key' => 'field_partnership_card_title',
                                        'label' => 'Título',
                                        'name' => 'title',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Formula 1"',
                                    ],
                                    [
                                        'key' => 'field_partnership_card_description',
                                        'label' => 'Descrição (Frente)',
                                        'name' => 'description',
                                        'type' => 'textarea',
                                        'rows' => 2,
                                        'instructions' => 'Texto curto exibido na frente do card.',
                                    ],
                                    [
                                        'key' => 'field_partnership_card_back_description',
                                        'label' => 'Descrição (Verso)',
                                        'name' => 'back_description',
                                        'type' => 'textarea',
                                        'rows' => 4,
                                        'instructions' => 'Texto completo exibido no verso do card.',
                                    ],
                                    [
                                        'key' => 'field_partnership_card_stats',
                                        'label' => 'Estatísticas',
                                        'name' => 'stats',
                                        'type' => 'repeater',
                                        'layout' => 'table',
                                        'button_label' => 'Adicionar Estatística',
                                        'max' => 4,
                                        'sub_fields' => [
                                            [
                                                'key' => 'field_partnership_stat_number',
                                                'label' => 'Número',
                                                'name' => 'number',
                                                'type' => 'text',
                                                'instructions' => 'Ex: "5+"',
                                            ],
                                            [
                                                'key' => 'field_partnership_stat_label',
                                                'label' => 'Label',
                                                'name' => 'label',
                                                'type' => 'text',
                                                'instructions' => 'Ex: "Décadas de parceria"',
                                            ],
                                        ],
                                    ],
                                    [
                                        'key' => 'field_partnership_card_button_text',
                                        'label' => 'Texto do Botão',
                                        'name' => 'button_text',
                                        'type' => 'text',
                                        'instructions' => 'Ex: "Ver calendário de eventos"',
                                    ],
                                    [
                                        'key' => 'field_partnership_card_button_url',
                                        'label' => 'URL do Botão',
                                        'name' => 'button_url',
                                        'type' => 'url',
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: Logo Grid
                    // =========================================================
                    'logo_grid' => [
                        'key' => 'layout_logo_grid',
                        'name' => 'logo_grid',
                        'label' => 'Grid de Logos',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_logo_grid_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_logo_grid_subtitle',
                                'label' => 'Subtítulo',
                                'name' => 'subtitle',
                                'type' => 'textarea',
                                'rows' => 2,
                            ],
                            [
                                'key' => 'field_logo_grid_logos',
                                'label' => 'Logos',
                                'name' => 'logos',
                                'type' => 'repeater',
                                'layout' => 'table',
                                'button_label' => 'Adicionar Logo',
                                'sub_fields' => [
                                    [
                                        'key' => 'field_logo_grid_logo_image',
                                        'label' => 'Logo',
                                        'name' => 'logo',
                                        'type' => 'image',
                                        'return_format' => 'array',
                                        'preview_size' => 'thumbnail',
                                        'instructions' => 'Logo do parceiro (fundo transparente recomendado).',
                                    ],
                                ],
                            ],
                        ],
                    ],

                    // =========================================================
                    // Layout: CTA Banner
                    // =========================================================
                    'cta_banner' => [
                        'key' => 'layout_cta_banner',
                        'name' => 'cta_banner',
                        'label' => 'Banner de CTA',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_cta_banner_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_cta_banner_text',
                                'label' => 'Texto',
                                'name' => 'text',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_cta_banner_button_text',
                                'label' => 'Texto do Botão',
                                'name' => 'button_text',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_cta_banner_button_url',
                                'label' => 'URL do Botão',
                                'name' => 'button_url',
                                'type' => 'url',
                            ],
                            [
                                'key' => 'field_cta_banner_bg_image',
                                'label' => 'Imagem de Fundo',
                                'name' => 'background_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
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
                    'value' => moove_get_partners_page_id(),
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
 * Obtém o ID da página de parceiros
 */
function moove_get_partners_page_id() {
    $page = get_page_by_path('parceiros');
    return $page ? $page->ID : 0;
}
