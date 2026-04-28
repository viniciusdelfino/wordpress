<?php
/**
 * ACF Flexible Content - Blocos da Página de Contato
 *
 * Define os layouts do Flexible Content para a página de contato
 * para serem usados no BlockRenderer do frontend.
 */

if (!defined('ABSPATH')) exit;

add_action('acf/init', 'moove_register_contact_blocks');

function moove_register_contact_blocks() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_contact_page_blocks',
        'title' => 'Blocos da Página de Contato',
        'fields' => [
            [
                'key' => 'field_contact_blocks',
                'label' => 'Blocos',
                'name' => 'blocks',
                'type' => 'flexible_content',
                'layouts' => [
                    // Layout: Contact Hero
                    'contact_hero' => [
                        'key' => 'layout_contact_hero',
                        'name' => 'contact_hero',
                        'label' => 'Hero de Contato',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_contact_hero_image',
                                'label' => 'Imagem Desktop',
                                'name' => 'hero_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                            ],
                            [
                                'key' => 'field_contact_hero_image_mobile',
                                'label' => 'Imagem Mobile',
                                'name' => 'hero_image_mobile',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                            ],
                        ],
                    ],
                    // Layout: Contact Form
                    'contact_form' => [
                        'key' => 'layout_contact_form',
                        'name' => 'contact_form',
                        'label' => 'Formulário de Contato',
                        'display' => 'block',
                        'sub_fields' => [
                            // Seção de texto
                            [
                                'key' => 'field_contact_form_section_title',
                                'label' => 'Título da Seção',
                                'name' => 'section_title',
                                'type' => 'text',
                                'required' => 1,
                            ],
                            [
                                'key' => 'field_contact_form_section_description',
                                'label' => 'Descrição da Seção',
                                'name' => 'section_description',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_contact_form_section_description_2',
                                'label' => 'Descrição da Seção 2 (HTML)',
                                'name' => 'section_description_2',
                                'type' => 'wysiwyg',
                                'tabs' => 'all',
                                'toolbar' => 'basic',
                                'media_upload' => 0,
                            ],
                            [
                                'key' => 'field_contact_form_section_image',
                                'label' => 'Imagem da Seção',
                                'name' => 'section_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                            ],
                            // Campos do formulário
                            [
                                'key' => 'field_contact_form_title',
                                'label' => 'Título do Formulário',
                                'name' => 'form_title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_contact_form_subtitle',
                                'label' => 'Subtítulo do Formulário',
                                'name' => 'form_subtitle',
                                'type' => 'textarea',
                                'rows' => 2,
                            ],
                            [
                                'key' => 'field_contact_form_note',
                                'label' => 'Nota do Formulário',
                                'name' => 'form_note',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_contact_form_cf7_id',
                                'label' => 'ID do Contact Form 7',
                                'name' => 'form_cf7_id',
                                'type' => 'text',
                                'instructions' => 'ID do formulário do Contact Form 7',
                            ],
                            // Mensagens de sucesso
                            [
                                'key' => 'field_contact_form_success_title',
                                'label' => 'Título de Sucesso',
                                'name' => 'success_title',
                                'type' => 'text',
                                'default_value' => 'Obrigado pelo contato!',
                            ],
                            [
                                'key' => 'field_contact_form_success_message',
                                'label' => 'Mensagem de Sucesso',
                                'name' => 'success_message',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_contact_form_success_button',
                                'label' => 'Texto do Botão de Sucesso',
                                'name' => 'success_button_text',
                                'type' => 'text',
                                'default_value' => 'Enviar nova solicitação',
                            ],
                            // Mensagens de erro
                            [
                                'key' => 'field_contact_form_error_title',
                                'label' => 'Título de Erro',
                                'name' => 'error_title',
                                'type' => 'text',
                                'default_value' => 'Não foi possível concluir o envio.',
                            ],
                            [
                                'key' => 'field_contact_form_error_message',
                                'label' => 'Mensagem de Erro',
                                'name' => 'error_message',
                                'type' => 'textarea',
                                'rows' => 3,
                            ],
                            [
                                'key' => 'field_contact_form_error_button',
                                'label' => 'Texto do Botão de Erro',
                                'name' => 'error_button_text',
                                'type' => 'text',
                                'default_value' => 'Tentar novamente',
                            ],
                        ],
                    ],
                    // Layout: Contact Info
                    'contact_info' => [
                        'key' => 'layout_contact_info',
                        'name' => 'contact_info',
                        'label' => 'Informações de Contato',
                        'display' => 'block',
                        'sub_fields' => [
                            [
                                'key' => 'field_contact_info_title',
                                'label' => 'Título',
                                'name' => 'title',
                                'type' => 'text',
                            ],
                            [
                                'key' => 'field_contact_info_description',
                                'label' => 'Descrição',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 2,
                            ],
                            [
                                'key' => 'field_contact_info_cards',
                                'label' => 'Cards',
                                'name' => 'cards',
                                'type' => 'repeater',
                                'layout' => 'block',
                                'button_label' => 'Adicionar Card',
                                'sub_fields' => [
                                    [
                                        'key' => 'field_contact_info_card_icon',
                                        'label' => 'Ícone',
                                        'name' => 'icon',
                                        'type' => 'select',
                                        'choices' => [
                                            'headset' => 'Headset (Atendimento)',
                                            'phone' => 'Imprensa',
                                            'shield' => 'Escudo (Segurança)',
                                        ],
                                        'default_value' => 'headset',
                                    ],
                                    [
                                        'key' => 'field_contact_info_card_title',
                                        'label' => 'Título',
                                        'name' => 'title',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_contact_info_card_phone',
                                        'label' => 'Telefone',
                                        'name' => 'phone',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_contact_info_card_email',
                                        'label' => 'E-mail',
                                        'name' => 'email',
                                        'type' => 'email',
                                    ],
                                    [
                                        'key' => 'field_contact_info_card_company',
                                        'label' => 'Nome da Empresa',
                                        'name' => 'company_name',
                                        'type' => 'text',
                                    ],
                                    [
                                        'key' => 'field_contact_info_card_description',
                                        'label' => 'Descrição',
                                        'name' => 'description',
                                        'type' => 'textarea',
                                        'rows' => 2,
                                    ],
                                    [
                                        'key' => 'field_contact_info_card_hours',
                                        'label' => 'Horário de Atendimento',
                                        'name' => 'hours',
                                        'type' => 'textarea',
                                        'rows' => 2,
                                    ],
                                    [
                                        'key' => 'field_contact_info_card_link',
                                        'label' => 'Link',
                                        'name' => 'link',
                                        'type' => 'link',
                                    ],
                                ],
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
                    'value' => moove_get_contact_page_id(),
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
 * Obtém o ID da página de contato
 */
function moove_get_contact_page_id() {
    $page = get_page_by_path('contato');
    return $page ? $page->ID : 0;
}
