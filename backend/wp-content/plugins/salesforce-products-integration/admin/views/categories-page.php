<?php
// Verificar segurança
if (!defined('ABSPATH')) {
    exit;
}

$category_map = get_option('salesforce_category_map', []);
$default_map  = function_exists('sf_get_default_category_map') ? sf_get_default_category_map() : [];

// Buscar dinamicamente todas as taxonomias associadas ao post_type 'produtos'
$target_post_type = 'produtos';
$taxonomies = get_object_taxonomies($target_post_type, 'objects');

// Fallback para 'product' se 'produtos' não retornar nada (caso use WooCommerce ou outro nome)
if (empty($taxonomies)) {
    $taxonomies = get_object_taxonomies('product', 'objects');
}

$grouped_terms = [];

foreach ($taxonomies as $tax_slug => $tax_obj) {
    $terms = get_terms(['taxonomy' => $tax_slug, 'hide_empty' => false]);
    if (!is_wp_error($terms) && !empty($terms)) {
        $grouped_terms[$tax_obj->labels->name] = $terms;
    }
}
?>

<div class="wrap salesforce-admin">
    <h1><?php esc_html_e('Mapeamento de Categorias', 'salesforce-products'); ?></h1>
    
    <?php if (isset($_GET['updated'])): ?>
        <div class="notice notice-success is-dismissible">
            <p><?php esc_html_e('Mapeamento salvo com sucesso!', 'salesforce-products'); ?></p>
        </div>
    <?php endif; ?>

     <!-- Seção de Mapeamentos via Código -->
    <?php if (!empty($default_map)): ?>
    <div class="card" style="max-width: 100%; margin-top: 20px; background-color: #f9f9f9; border-left: 4px solid #2271b1;">
        <h2 style="margin-top:0;"><?php esc_html_e('Mapeamentos do Sistema (Via Código)', 'salesforce-products'); ?></h2>
        <p class="description">
            Estes termos já foram configurados internamente pela equipe de desenvolvimento para garantir o funcionamento base.<br>
            Eles são carregados automaticamente. Você <strong>não precisa</strong> adicioná-los manualmente abaixo, 
            a menos que queira <strong>sobrescrever</strong> o comportamento padrão de algum deles.
        </p>
        <table class="widefat striped" style="margin-top: 10px;">
            <thead>
                <tr>
                    <th style="width: 45%;">Termo no Salesforce</th>
                    <th style="width: 55%;">Categorias Associadas</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($default_map as $sf_term => $wp_slugs): 
                    $wp_slugs = (array) $wp_slugs;
                    $is_overridden = isset($category_map[$sf_term]);
                ?>
                <tr class="<?php echo $is_overridden ? 'opacity-50' : ''; ?>">
                    <td>
                        <strong><?php echo esc_html($sf_term); ?></strong>
                        <?php if ($is_overridden): ?>
                            <span class="dashicons dashicons-warning" title="Este termo está sendo sobrescrito pela configuração manual abaixo" style="color: #dba617; font-size: 16px;"></span>
                            <small style="color: #dba617;">(Sobrescrito)</small>
                        <?php endif; ?>
                    </td>
                    <td>
                        <?php 
                        foreach ($wp_slugs as $slug) {
                            echo '<span class="badge" style="background: #e5e5e5; padding: 2px 6px; border-radius: 4px; margin-right: 5px; font-size: 11px;">' . esc_html($slug) . '</span>';
                        }
                        ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>

    <div class="card" style="max-width: 100%; margin-top: 20px;">
        <p class="description">
            Associe os termos técnicos vindos do Salesforce (Coluna Esquerda) com os Slugs das categorias no seu site (Coluna Direita).<br>
            Selecione as categorias correspondentes usando as caixas de seleção abaixo.
        </p>

        <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
            <input type="hidden" name="action" value="salesforce_save_category_map">
            <?php wp_nonce_field('salesforce_save_category_map'); ?>

            <table class="widefat striped" id="category-map-table" style="margin-top: 20px;">
                <thead>
                    <tr>
                        <th style="width: 45%;">Termo no Salesforce (Exato)</th>
                        <th style="width: 45%;">Slug da Categoria no Site</th>
                        <th style="width: 10%;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($category_map)) : ?>
                        <?php $i = 0; foreach ($category_map as $sf_term => $wp_slugs) : 
                            $wp_slugs = (array) $wp_slugs; // Garante que seja array para o multiselect
                        ?>
                            <tr>
                                <td><input type="text" name="salesforce_category_map_keys[<?php echo $i; ?>]" value="<?php echo esc_attr($sf_term); ?>" class="widefat" /></td>
                                <td>
                                    <div class="taxonomy-checkbox-list" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #fff; border-radius: 4px;">
                                        <?php foreach ($grouped_terms as $group_label => $terms): ?>
                                            <strong style="display:block; margin-bottom:5px; border-bottom:1px solid #eee; color:#666; font-size:12px;"><?php echo esc_html($group_label); ?></strong>
                                                <?php foreach ($terms as $term): ?>
                                                    <label style="display:block; margin-bottom: 4px;">
                                                        <input type="checkbox" name="salesforce_category_map_values[<?php echo $i; ?>][]" value="<?php echo esc_attr($term->slug); ?>" <?php echo in_array($term->slug, $wp_slugs) ? 'checked' : ''; ?>> 
                                                        <?php echo esc_html($term->name); ?>
                                                    </label>
                                                <?php endforeach; ?>
                                        <?php endforeach; ?>
                                    </div>
                                </td>
                                <td><button type="button" class="button remove-row"><span class="dashicons dashicons-trash"></span></button></td>
                            </tr>
                        <?php $i++; endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <p style="margin-top: 15px;">
                <button type="button" class="button button-secondary add-category-row">
                    <span class="dashicons dashicons-plus"></span> Adicionar Nova Linha
                </button>
            </p>

            <hr>
            
            <p class="submit">
                <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php esc_html_e('Salvar Mapeamento', 'salesforce-products'); ?>">
            </p>
        </form>
    </div>
</div>

<!-- Template oculto para novas linhas (garante que o JS use o select atualizado) -->
<table style="display:none">
    <tbody id="row-template">
        <tr>
            <td><input type="text" name="salesforce_category_map_keys[{index}]" class="widefat" placeholder="Ex: MOTOR DE MOTOS" /></td>
            <td>
                <div class="taxonomy-checkbox-list" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #fff; border-radius: 4px;">
                    <?php foreach ($grouped_terms as $group_label => $terms): ?>
                        <strong style="display:block; margin-bottom:5px; border-bottom:1px solid #eee; color:#666; font-size:12px;"><?php echo esc_html($group_label); ?></strong>
                            <?php foreach ($terms as $term): ?>
                                <label style="display:block; margin-bottom: 4px;">
                                    <input type="checkbox" name="salesforce_category_map_values[{index}][]" value="<?php echo esc_attr($term->slug); ?>"> 
                                    <?php echo esc_html($term->name); ?>
                                </label>
                            <?php endforeach; ?>
                    <?php endforeach; ?>
                </div>
            </td>
            <td><button type="button" class="button remove-row"><span class="dashicons dashicons-trash"></span></button></td>
        </tr>
    </tbody>
</table>

<script type="text/javascript">
jQuery(document).ready(function($) {
    var rowCount = <?php echo isset($i) ? $i : 0; ?>;
    $('.add-category-row').on('click', function() {
        rowCount++;
        var template = $('#row-template').html();
        var row = $(template.replace(/{index}/g, rowCount));
        $('#category-map-table tbody').append(row);
    });
    $(document).on('click', '.remove-row', function() {
        $(this).closest('tr').remove();
    });
});
</script>
