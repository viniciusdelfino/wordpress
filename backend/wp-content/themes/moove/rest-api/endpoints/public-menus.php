<?php
/**
 * Endpoints de Menus
 */

if (!defined('ABSPATH')) exit;

// ============================================
// MENUS
// ============================================

add_action('rest_api_init', function() {
    // Todos os menus
    register_rest_route(MOOVE_API_NAMESPACE, '/menus', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_menus',
        'permission_callback' => '__return_true',
    ]);
    
    // Menu por localização
    register_rest_route(MOOVE_API_NAMESPACE, '/menu/(?P<location>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_menu_by_location',
        'permission_callback' => '__return_true',
    ]);
    
    // Menu por ID
    register_rest_route(MOOVE_API_NAMESPACE, '/menu/id/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_menu_by_id',
        'permission_callback' => '__return_true',
    ]);

    //Menu por Name
    register_rest_route(MOOVE_API_NAMESPACE, '/menu/name/(?P<name>[a-zA-Z0-9_-]+)', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_menu_by_name',
        'permission_callback' => '__return_true',
    ]);
});

/**
 * Todos os menus
 */
function moove_api_get_menus() {
    $menus = wp_get_nav_menus();
    
    if (empty($menus)) {
        return moove_api_success([], 'Nenhum menu encontrado');
    }
    
    $formatted_menus = [];
    foreach ($menus as $menu) {
        $formatted_menus[] = [
            'id' => $menu->term_id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'description' => $menu->description,
            'count' => $menu->count,
            'locations' => moove_get_menu_locations($menu->term_id),
        ];
    }
    
    return moove_api_success($formatted_menus, 'Menus disponíveis');
}

/**
 * Menu por localização
 */
function moove_api_get_menu_by_location($request) {
    $location = $request['location'];
    $locations = get_nav_menu_locations();
    
    if (!isset($locations[$location])) {
        return moove_api_error('Localização não encontrada', 'menu_location_not_found', 404);
    }
    
    $menu_id = $locations[$location];
    return moove_api_get_menu_items($menu_id, $location);
}

/**
 * Menu por ID
 */
function moove_api_get_menu_by_id($request) {
    $menu_id = $request['id'];
    $menu = wp_get_nav_menu_object($menu_id);
    
    if (!$menu) {
        return moove_api_error('Menu não encontrado', 'menu_not_found', 404);
    }
    
    return moove_api_get_menu_items($menu_id);
}

/**
 * Menu por Nome
 */
function moove_api_get_menu_by_name($request) {
    $menu_name = $request['name'];
    $menu = wp_get_nav_menu_object($menu_name);
    
    if (!$menu) {
        return moove_api_error('Menu não encontrado', 'menu_not_found', 404);
    }
    
    return moove_api_get_menu_items($menu->term_id);
}

/**
 * Obter itens do menu formatados
 */
function moove_api_get_menu_items($menu_id, $location = null) {
    $menu_items = wp_get_nav_menu_items($menu_id);
    
    if (empty($menu_items)) {
        return moove_api_success([
            'menu_id' => $menu_id,
            'location' => $location,
            'items' => [],
        ], 'Menu vazio');
    }
    
    $items = [];
    foreach ($menu_items as $item) {
        $items[] = moove_format_menu_item($item);
    }
   
    // Construir hierarquia
    $hierarchical_items = moove_build_menu_tree($items);
    
    return moove_api_success([
        'menu_id' => $menu_id,
        'location' => $location,
        'items' => $hierarchical_items,
        'total_items' => count($items),
    ], 'Itens do menu');
}

/**
 * Formatar item do menu
 */
function moove_format_menu_item($item) {
    $formatted = [
        'id' => $item->ID,
        'title' => $item->title,
        'url' => $item->url,
        'target' => $item->target,
        'classes' => $item->classes,
        'parent' => (int) $item->menu_item_parent,
        'order' => $item->menu_order,
        'object_id' => $item->object_id,
        'object' => $item->object,
        'type' => $item->type,
        'description' => $item->description,
    ];
    
    // Adicionar campos ACF do item de menu
    if (function_exists('get_field')) {
        // Ícone do menu (mantido)
        $icon = get_field('menu_icon', $item->ID);
        if ($icon) {
            $formatted['icon'] = is_array($icon) ? $icon['url'] : $icon;
        }

        // Repetidor related_images (substitui menu_image e ind_image)
        $related_images_raw = get_field('related_images', $item->ID);
        if (!empty($related_images_raw) && is_array($related_images_raw)) {
            $formatted_images = [];
            foreach ($related_images_raw as $row) {
                $img = isset($row['menu_image']) ? $row['menu_image'] : null;
                $image_data = null;
                if (!empty($img)) {
                    if (is_array($img)) {
                        $image_data = [
                            'url'    => isset($img['url'])    ? $img['url']    : '',
                            'alt'    => isset($img['alt'])    ? $img['alt']    : '',
                            'width'  => isset($img['width'])  ? (int) $img['width']  : 0,
                            'height' => isset($img['height']) ? (int) $img['height'] : 0,
                        ];
                    } elseif (is_string($img) && !empty($img)) {
                        $image_data = ['url' => $img, 'alt' => '', 'width' => 0, 'height' => 0];
                    }
                }
                // Campo 'link' do ACF pode ser do tipo Link (array com url/title/target)
                // ou texto simples. Extraímos sempre uma string de URL.
                $raw_link = isset($row['link']) ? $row['link'] : null;
                if (is_array($raw_link)) {
                    $link_url = isset($raw_link['url']) && !empty($raw_link['url'])
                        ? (string) $raw_link['url']
                        : '';
                } elseif (is_string($raw_link) && !empty($raw_link)) {
                    $link_url = $raw_link;
                } else {
                    $link_url = '';
                }

                $formatted_images[] = [
                    'menu_image' => $image_data,
                    'add_label'  => !empty($row['add_label']),
                    'label'      => isset($row['label']) ? (string) $row['label'] : '',
                    'link'       => $link_url,
                ];
            }
            $formatted['related_images'] = $formatted_images;
        } else {
            $formatted['related_images'] = [];
        }
    }

    if (in_array($item->type, ['post_type', 'post_type_archive'])) {
        $thumbnail_id = get_post_thumbnail_id($item->object_id);
        if ($thumbnail_id) {
            $formatted['featured_image'] = moove_format_image($thumbnail_id, 'thumbnail', false);
        }
    }
    
    if ($item->type === 'taxonomy') {
        $term = get_term($item->object_id, $item->object);
        if ($term && !is_wp_error($term)) {
            if (empty($formatted['description']) && isset($term->description) && $term->description !== '') {
                $formatted['description'] = $term->description;
            }
        }
    }
    
    return $formatted;
}

/**
 * Construir árvore hierárquica do menu
 */
function moove_build_menu_tree(&$items, $parent_id = 0) {
    $branch = [];
    
    foreach ($items as $item) {
        if ($item['parent'] == $parent_id) {
            $children = moove_build_menu_tree($items, $item['id']);
            if ($children) {
                $item['children'] = $children;
            }
            $branch[] = $item;
        }
    }
    
    return $branch;
}

/**
 * Obter localizações do menu
 */
function moove_get_menu_locations($menu_id) {
    $locations = [];
    $nav_locations = get_nav_menu_locations();
    
    foreach ($nav_locations as $location => $id) {
        if ($id == $menu_id) {
            $locations[] = $location;
        }
    }
    
    return $locations;
}