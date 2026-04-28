<?php
/**
 * Sinc Manager and products manipulation (CPT 'produtos')
 */

class Product_Manager
{

    private $api;
    private $cache;
    private static $hooked = false;
    private $skipped_products = [];

    public function __construct($api, $cache)
    {
        $this->api = $api;
        $this->cache = $cache;

        // Evita duplicidade de hooks se a classe for instanciada múltiplas vezes
        if (! self::$hooked) {
            add_action('admin_menu', [$this, 'register_admin_pages'], 99);
            add_action('add_meta_boxes', [$this, 'register_meta_boxes']);
            
            add_filter('acf/format_value/name=list', [$this, 'inject_sf_data_into_acf_list'], 10, 3);
            add_filter('acf/format_value/name=product_list', [$this, 'inject_sf_data_into_acf_list'], 10, 3);

            add_action('admin_notices', [$this, 'render_uncategorized_admin_notice']);
            add_action('pre_get_posts', [$this, 'filter_uncategorized_products_query']);

            add_action('rest_api_init', [$this, 'register_filter_endpoints']);
            add_action('rest_api_init', [$this, 'register_product_endpoints']);
            self::$hooked = true;
        }
    }

    /**
     * Executa o processo de sincronização de produtos
     */
    public function fetch_products($force = false)
    {
        $this->logger("Iniciando sincronização (Force: " . ($force ? 'Sim' : 'Não') . ")");
        $this->skipped_products = [];

        try {
            // 1. Busca todos os produtos do Salesforce
            $result = $this->api->get_all_products();

            if (empty($result['records'])) {
                $this->logger("Nenhum registro retornado pela API do Salesforce.");
                return ['success' => false, 'message' => 'Nenhum produto encontrado no Salesforce.'];
            }

            $count_created = 0;
            $count_updated = 0;
            $count_skipped = 0;
            $errors = [];

            // 2. Itera sobre cada produto
            foreach ($result['records'] as $sf_product) {
                try {
                    $status = $this->sync_single_product($sf_product, $force);
                    if ($status === 'created') $count_created++;
                    if ($status === 'updated') $count_updated++;
                    if ($status === 'skipped_uptodate') $count_skipped++;
                    if ($status === 'skipped_no_name') $count_skipped++;
                } catch (Exception $e) {
                    $msg = "Erro SKU {$sf_product['StockKeepingUnit']}: " . $e->getMessage();
                    $errors[] = $msg;
                    $this->logger($msg);
                }
            }
            update_option('moove_sf_skipped_products', $this->skipped_products);
            delete_transient('moove_sf_uncategorized_count'); // Reseta cache do contador ao sincronizar

            global $wpdb;
            $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_moove_filters_%' OR option_name LIKE '_transient_timeout_moove_filters_%' OR option_name LIKE '_transient_moove_segment_products_%' OR option_name LIKE '_transient_timeout_moove_segment_products_%'");

            $this->logger("Sincronização finalizada. Criados: $count_created, Atualizados: $count_updated, Ignorados: $count_skipped");
            return [
                'success' => true,
                'created' => $count_created,
                'updated' => $count_updated,
                'skipped' => $count_skipped,
                'errors' => $errors
            ];
        } catch (Exception $e) {
            $this->logger("Erro fatal na sincronização: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }


    /**
     * Sincroniza um único produto
     */
    private function sync_single_product($sf_data, $force = false)
    {
        $sku = $sf_data['StockKeepingUnit'];

        // Validação básica
        if (empty($sku)){
            $this->skipped_products[] = ['ID' => $sf_data['Id'], 'SKU' => $sf_data['StockKeepingUnit'], 'Name' => $sf_data['Name']];

            return 'skipped';
        }

        // Tenta encontrar produto existente pelo SKU
        $existing_id = $this->get_product_id_by_sku($sku);

        // Checagem de Duplicidade e Atualização Recente (LastModifiedDate)
        if (!$force && $existing_id && !empty($sf_data['LastModifiedDate'])) {
            $sf_modified_ts = strtotime($sf_data['LastModifiedDate']);
            $local_modified_ts = (int) get_post_meta($existing_id, '_salesforce_last_modified_ts', true);

            $local_api = get_post_meta($existing_id, '_salesforce_api', true);
            $local_approvals = get_post_meta($existing_id, '_salesforce_approvals', true);
            $local_packing = get_post_meta($existing_id, '_salesforce_packing', true);
            $local_raw = get_post_meta($existing_id, '_salesforce_raw_data', true);

            $raw_api = is_array($local_raw)
                ? (isset($local_raw['API__c']) ? $local_raw['API__c'] : (isset($local_raw['API__C']) ? $local_raw['API__C'] : ''))
                : '';
            $raw_approvals = is_array($local_raw) && isset($local_raw['Approvals__c']) ? $local_raw['Approvals__c'] : '';
            $raw_packing = is_array($local_raw) && isset($local_raw['Packing__c']) ? $local_raw['Packing__c'] : '';

            $needs_field_backfill = empty($local_api) || empty($raw_api) || empty($local_approvals) || empty($raw_approvals) || empty($local_packing) || empty($raw_packing);

            // Se o registro local já estiver atualizado (timestamp local >= timestamp SF), pula a atualização
            if ($local_modified_ts && $local_modified_ts >= $sf_modified_ts && !$needs_field_backfill) {
                return 'skipped_uptodate';
            }
        }

        // Validação: Produto deve ter Nome Comercial (B2BProductName__c)
        if (empty($sf_data['B2BProductName__c'])) {
            $this->logger("Produto Ignorado (Sem Nome Comercial) - ID: {$sf_data['Id']}, SKU: {$sf_data['StockKeepingUnit']}, Nome: {$sf_data['Name']}");
            $this->skipped_products[] = ['ID' => $sf_data['Id'], 'SKU' => $sf_data['StockKeepingUnit'], 'Name' => $sf_data['Name']];

            return 'skipped_no_name';
        }

        $raw_title = $sf_data['B2BProductName__c'];
        $title = html_entity_decode($raw_title, ENT_QUOTES | ENT_HTML5);
        $title = trim($title, '"');

        $post_data = [
            'post_title'   => $title,
            'post_type'    => 'produtos',
            'post_status'  => 'publish',
        ];

        if ($existing_id) {
            $post_data['ID'] = $existing_id;
            $updated = wp_update_post($post_data);
            if ($updated === 0) {
                throw new Exception("Falha ao atualizar o post ID {$existing_id}");
            }
            $post_id = $existing_id;
            $action = 'updated';
        } else {
            $post_id = wp_insert_post($post_data);
            $action = 'created';
        }

        if (is_wp_error($post_id)) {
            throw new Exception($post_id->get_error_message());
        }

        // Salvar Metadados Essenciais
        update_post_meta($post_id, '_salesforce_sku', $sku);
        update_post_meta($post_id, '_salesforce_id', $sf_data['Id']);

        if (!empty($sf_data['LastModifiedDate'])) {
            update_post_meta($post_id, '_salesforce_last_modified_ts', strtotime($sf_data['LastModifiedDate']));
        }

        // Salvar Descrição para uso no Card (Frontend)
        update_post_meta($post_id, '_salesforce_description', isset($sf_data['Description']) ? $sf_data['Description'] : '');

        // Salvar Viscosidade e outros dados úteis para o Card
        if (isset($sf_data['Viscosity__c'])) {
            update_post_meta($post_id, '_salesforce_viscosity', $sf_data['Viscosity__c']);
        }
        
        // Tecnologia: Tenta IndustryClassifications__c, fallback para Technology__c
        $tech = '';
        if (!empty($sf_data['IndustryClassifications__c'])) {
            $tech = $sf_data['IndustryClassifications__c'];
        } elseif (!empty($sf_data['Technology__c'])) {
            $tech = $sf_data['Technology__c'];
        }
        update_post_meta($post_id, '_salesforce_technology', $tech);
          
        if (isset($sf_data['ProductApplication__c'])) {
            update_post_meta($post_id, '_salesforce_application', $sf_data['ProductApplication__c']);
        }

        if (isset($sf_data['API__c']) || isset($sf_data['API__C'])) {
            $api = isset($sf_data['API__c']) ? $sf_data['API__c'] : $sf_data['API__C'];
            update_post_meta($post_id, '_salesforce_api', $api);
        }

        if (isset($sf_data['Approvals__c'])) {
            update_post_meta($post_id, '_salesforce_approvals', $sf_data['Approvals__c']);
        }

        if (isset($sf_data['Packing__c'])) {
            update_post_meta($post_id, '_salesforce_packing', $sf_data['Packing__c']);
        }

        // Salvar JSON completo para exibição "Somente Leitura" no Admin
        update_post_meta($post_id, '_salesforce_raw_data', $sf_data);

        // Mapear Taxonomias (Segmento e Tipo de Produto)
        $this->apply_automatic_categorization($post_id, $sf_data);

        return $action;
    }

    /**
     * Exclui todos os produtos locais (Limpeza)
     */
    private function delete_all_products()
    {
        $posts = get_posts([
            'post_type'   => 'produtos',
            'numberposts' => -1,
            'post_status' => 'any',
            'fields'      => 'ids'
        ]);

        $count = 0;
        foreach ($posts as $post_id) {
            wp_delete_post($post_id, true); // true = força exclusão (pula lixeira)
            $count++;
        }
        return $count;
    }

    /**
     * Registra páginas de administração
     */
    public function register_admin_pages()
    {
        add_submenu_page(
            'salesforce-products',
            'Sincronizar Produtos Salesforce',
            'Sync Produtos',
            'manage_options',
            'sf-product-sync',
            [$this, 'render_sync_page']
        );
    }

    /**
     * Renderiza a página de sincronização
     */
    public function render_sync_page()
    {
        $logo_url = '';
        $skipped_products = get_option('moove_sf_skipped_products', []);
        if (function_exists('get_theme_mod')) {
            $custom_logo_id = get_theme_mod('custom_logo');
            $image = wp_get_attachment_image_src($custom_logo_id, 'full');
            $logo_url = $image ? $image[0] : '';
        }
?>
        <style>
            #moove-sync-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                z-index: 9999;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
            }

            #moove-sync-overlay.active {
                display: flex;
            }

            .moove-spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }
        </style>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const form = document.getElementById('moove-sync-form');
                if (form) {
                    form.addEventListener('submit', function() {
                        document.getElementById('moove-sync-overlay').classList.add('active');
                    });
                }
            });
        </script>

        <div id="moove-sync-overlay">
            <?php if ($logo_url): ?>
                <img src="<?php echo esc_url($logo_url); ?>" alt="Logo" style="max-width: 200px; margin-bottom: 20px; height: auto;">
            <?php endif; ?>
            <div class="moove-spinner"></div>
            <h2 style="color: #23282d;">Sincronizando produtos com Salesforce...</h2>
            <p>Isso pode levar alguns instantes. Por favor, não feche a página.</p>
        </div>

        <div class="wrap">
            <h1>Sincronização de Produtos Salesforce</h1>
            <p>Esta ferramenta busca todos os produtos ativos (EnabledProductB2BCommerce__c = true) no Salesforce e atualiza os registros locais.</p>

            <?php
            if (isset($_POST['moove_trigger_sync']) && check_admin_referer('moove_sf_sync_action', 'moove_sf_sync_nonce')) {
                $force = isset($_POST['moove_force_sync']);
                $result = $this->fetch_products($force);
                if ($result['success']) {
                    update_option('moove_sf_skipped_products', $this->skipped_products);
                    echo '<div class="notice notice-success"><p>Sincronização concluída! Criados: ' . $result['created'] . ' | Atualizados: ' . $result['updated'] . ' | Mantidos (Sem alterações): ' . ($result['skipped'] ?? 0) . '</p></div>';
                    if (!empty($result['errors'])) {
                        echo '<div class="notice notice-warning"><p>Alguns erros ocorreram:</p><ul>';
                        foreach ($result['errors'] as $err) echo "<li>$err</li>";
                        echo '</ul></div>';
                    }
                } else {
                    echo '<div class="notice notice-error"><p>Erro: ' . esc_html($result['message']) . '</p></div>';
                }
            }

            if (isset($_POST['moove_trigger_delete_all']) && check_admin_referer('moove_sf_delete_action', 'moove_sf_delete_nonce')) {
                $deleted = $this->delete_all_products();
                echo '<div class="notice notice-error"><p>Todos os produtos locais foram excluídos. Total: ' . $deleted . '</p></div>';
            }

            if (isset($_POST['moove_clear_logs']) && check_admin_referer('moove_sf_logs_action', 'moove_sf_logs_nonce')) {
                update_option('moove_sf_sync_logs', []);
                echo '<div class="notice notice-success"><p>Logs limpos com sucesso.</p></div>';
            }
            ?>

            <form method="post" id="moove-sync-form">
                <?php wp_nonce_field('moove_sf_sync_action', 'moove_sf_sync_nonce'); ?>

                <p>
                    <label>
                        <input type="checkbox" name="moove_force_sync" value="1">
                        <strong>Forçar atualização completa</strong> (Ignorar verificação de data e sobrescrever dados locais)
                    </label>
                </p>

                <p>
                    <button type="submit" name="moove_trigger_sync" class="button button-primary button-hero">
                        Iniciar Sincronização Completa
                    </button>
                </p>
            </form>

            <hr style="margin-top: 40px; border-color: #ccc;">

            <h2 style="color: #d63638;">Zona de Perigo</h2>
            <p>Atenção: A exclusão removerá todos os produtos do banco de dados do WordPress. Dados extras cadastrados manualmente no WP serão perdidos.</p>

            <form method="post" onsubmit="return confirm('Tem certeza absoluta? Esta ação apagará TODOS os produtos locais e não pode ser desfeita.');">
                <?php wp_nonce_field('moove_sf_delete_action', 'moove_sf_delete_nonce'); ?>
                <button type="submit" name="moove_trigger_delete_all" class="button button-link-delete" style="color: #d63638; border: 1px solid #d63638; padding: 4px 10px; border-radius: 4px;">Excluir Todos os Produtos</button>
            </form>

            <hr style="margin-top: 40px; border-color: #ccc;">

            <h2>Logs do Sistema</h2>
            <form method="post">
                <?php wp_nonce_field('moove_sf_logs_action', 'moove_sf_logs_nonce'); ?>
                <textarea style="width: 100%; height: 300px; font-family: monospace; background: #f0f0f1; margin-bottom: 10px;" readonly><?php 
                    $logs = get_option('moove_sf_sync_logs', []);
                    echo esc_textarea(implode("\n", is_array($logs) ? $logs : [])); 
                ?></textarea>
                <button type="submit" name="moove_clear_logs" class="button">Limpar Logs</button>
            </form>
        </div>
         <?php
            // Display skipped products table
            $skipped_products = get_option('moove_sf_skipped_products', []);
            if (!empty($skipped_products)) {
                echo '<hr style="margin-top: 40px; border-color: #ccc;">';
                echo '<h2>Produtos Ignorados (Sem Nome Comercial)</h2>';
                echo '<table class="wp-list-table widefat striped">';
                echo '<thead><tr><th>ID</th><th>SKU</th><th>Nome</th></tr></thead>';
                echo '<tbody>';
                foreach ($skipped_products as $product) {
                    echo '<tr>';
                    echo '<td>' . esc_html($product['ID']) . '</td>';
                    echo '<td>' . esc_html($product['SKU']) . '</td>';
                    echo '<td>' . esc_html($product['Name']) . '</td>';
                    echo '</tr>';
                }
                echo '</tbody></table>';
            }
            ?>

<?php
    }

    /**
     * Registra Meta Boxes
     */
    public function register_meta_boxes()
    {
        add_meta_box(
            'sf_product_details',
            'Detalhes do Salesforce (Somente Leitura)',
            [$this, 'render_sf_details_box'],
            'produtos',
            'normal',
            'high'
        );
    }

    /**
     * Renderiza o conteúdo do Meta Box
     */
    public function render_sf_details_box($post)
    {
        $sf_data = get_post_meta($post->ID, '_salesforce_raw_data', true);
        $sku = get_post_meta($post->ID, '_salesforce_sku', true);
        $viscosity = get_post_meta($post->ID, '_salesforce_viscosity', true);
        $technology = get_post_meta($post->ID, '_salesforce_technology', true);

        $extended_data = $this->get_product_extended_data($post->ID);

        echo '<p><strong>SKU:</strong> ' . esc_html($sku) . '</p>';
        echo '<p><strong>Viscosidade:</strong> ' . esc_html($viscosity) . '</p>';
        echo '<p><strong>Tecnologia:</strong> ' . esc_html($technology) . '</p>';
        if ($extended_data && isset($extended_data['sf'])) {
            echo '<hr><p><strong>Dados do Produto:</strong></p>';
            echo '<pre style="background: #f0f0f1; padding: 10px; overflow: auto; max-height: 600px; font-size: 12px;">';
            echo json_encode($extended_data['sf'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            echo '</pre>';
        } else {
            echo '<p>Dados estendidos não disponíveis.</p>';
        }

        // Debug dos dados brutos caso algo esteja faltando
        echo '<hr><details><summary style="cursor:pointer;">Ver Dados Brutos (_salesforce_raw_data)</summary>';
        echo '<pre style="background: #e5e5e5; padding: 10px; margin-top: 5px; overflow: auto; max-height: 300px; font-size: 11px;">';
        print_r($sf_data);
        echo '</pre></details>';
    }

    /**
     * Filtro ACF: Injeta dados estendidos (SF + ACF) na lista de produtos
     */
    public function inject_sf_data_into_acf_list($value, $post_id, $field) {
        if (empty($value) || !is_array($value)) {
            return $value;
        }

        foreach ($value as $key => $item) {
            $p_id = 0;
            if (is_object($item) && isset($item->ID)) {
                $p_id = $item->ID;
            } elseif (is_array($item) && isset($item['ID'])) {
                $p_id = $item['ID'];
            }

            if ($p_id) {
                $extended_data = $this->get_product_extended_data($p_id);
                
                if (is_object($item)) {
                    $item->extended_data = $extended_data;
                } elseif (is_array($item)) {
                    $value[$key]['extended_data'] = $extended_data;
                }
            }
        }
        return $value;
    }

    /**
     * Helper: Recupera dados estendidos de um produto
     */
    private function get_product_extended_data($post_id) {
        $data = [];

        if (function_exists('get_field')) {
            $thumb_products = get_field('thumb_products', $post_id);
            $data['acf'] = [
                'thumb_products'    => $thumb_products ? $thumb_products : '',
                'shortdesc_products'=> get_field('shortdesc_products', $post_id),
            ];
        } else {
            $data['acf'] = [];
        }

        $sf_raw = get_post_meta($post_id, '_salesforce_raw_data', true);
        $sf_desc = get_post_meta($post_id, '_salesforce_description', true);
        $sf_visc = get_post_meta($post_id, '_salesforce_viscosity', true);
        $sf_tech = get_post_meta($post_id, '_salesforce_technology', true);
        $sf_packing = get_post_meta($post_id, '_salesforce_packing', true);

        $terms = get_the_terms($post_id, 'segmento');
        $application = ($terms && !is_wp_error($terms)) ? $terms[0]->name : '';

        // Processamento de Produtos Relacionados (String -> Array)
        $related_products = [];
        if (!empty($sf_raw['RelatedProducts__c'])) {
            $related_raw = preg_split('/[;,]/', $sf_raw['RelatedProducts__c'], -1, PREG_SPLIT_NO_EMPTY);
            $related_products = array_map('trim', $related_raw);
        }

        // Montagem da estrutura idêntica ao Proxy JSON
        $api_value = '';
        if (isset($sf_raw['API__c']) && $sf_raw['API__c'] !== '') {
            $api_value = $sf_raw['API__c'];
        } elseif (isset($sf_raw['API__C']) && $sf_raw['API__C'] !== '') {
            $api_value = $sf_raw['API__C'];
        } else {
            $api_value = get_post_meta($post_id, '_salesforce_api', true);
        }

        $data['sf'] = [         
            'B2BProductName__c'            => isset($sf_raw['B2BProductName__c']) ? $sf_raw['B2BProductName__c'] : '',
            'StockKeepingUnit'             => get_post_meta($post_id, '_salesforce_sku', true),
            'slug'                         => sanitize_title(isset($sf_raw['B2BProductName__c']) ? $sf_raw['B2BProductName__c'] : get_the_title($post_id)),
            'last_modified'                => isset($sf_raw['LastModifiedDate']) ? date('d/m/Y', strtotime($sf_raw['LastModifiedDate'])) : '',
            'LastModifiedDate'             => isset($sf_raw['LastModifiedDate']) ? $sf_raw['LastModifiedDate'] : '',
            'EnabledProductB2BCommerce__c' => isset($sf_raw['EnabledProductB2BCommerce__c']) ? (bool)$sf_raw['EnabledProductB2BCommerce__c'] : false,
            'IndustryClassifications__c'   => isset($sf_raw['IndustryClassifications__c']) ? $sf_raw['IndustryClassifications__c'] : '',
            'Description'                  => $sf_desc,
            'DisplayUrl'                   => isset($sf_raw['DisplayUrl']) ? $sf_raw['DisplayUrl'] : '',
            'category_slug'                => $application ? sanitize_title($application) : '', // Simplificação: usa o termo WP
            'seo_description'              => isset($sf_raw['B2BSEODescription__c']) ? $sf_raw['B2BSEODescription__c'] : '',
            'seo_title'                    => isset($sf_raw['B2BSEOTitle__c']) ? $sf_raw['B2BSEOTitle__c'] : '',
            'Benefits__c'                  => isset($sf_raw['Benefits__c']) ? $sf_raw['Benefits__c'] : '',
            'Recommendation__c'            => isset($sf_raw['Recommendation__c']) ? $sf_raw['Recommendation__c'] : '',
            'Brand__c'                     => isset($sf_raw['Brand__c']) ? $sf_raw['Brand__c'] : '',
            'BusinessLine__c'              => isset($sf_raw['BusinessLine__c']) ? $sf_raw['BusinessLine__c'] : '',
            'ProductFamily__c'             => isset($sf_raw['ProductFamily__c']) ? $sf_raw['ProductFamily__c'] : '',
            'MeetsOrExceeds__c'            => isset($sf_raw['MeetsOrExceeds__c']) ? $sf_raw['MeetsOrExceeds__c'] : '',
            'API__c'                       => $api_value,
            'Approvals__c'                 => isset($sf_raw['Approvals__c']) ? $sf_raw['Approvals__c'] : '',
            'ProductApplication__c'        => isset($sf_raw['ProductApplication__c']) ? $sf_raw['ProductApplication__c'] : '',
            'Viscosity__c'                 => $sf_visc,
            'Technology__c'                => $sf_tech,
            'Packing__c'                   => isset($sf_raw['Packing__c']) && $sf_raw['Packing__c'] !== '' ? $sf_raw['Packing__c'] : $sf_packing,
            '_debug_b2b_name'              => isset($sf_raw['B2BProductName__c']) ? $sf_raw['B2BProductName__c'] : 'VAZIO/NULL',
            '_debug_sf_name'               => isset($sf_raw['Name']) ? $sf_raw['Name'] : '',
            
            // Estrutura de Variações (Simulada com o próprio produto, já que no WP é 1:1)
            'variations' => [
                [
                    'sf_id'        => isset($sf_raw['Id']) ? $sf_raw['Id'] : '',
                    'sku'          => get_post_meta($post_id, '_salesforce_sku', true),
                    'size'         => isset($sf_raw['Size__c']) ? $sf_raw['Size__c'] : null,
                    'size_unit'    => isset($sf_raw['SizeUnit__c']) ? $sf_raw['SizeUnit__c'] : null,
                    'packing'      => isset($sf_raw['Packing__c']) && $sf_raw['Packing__c'] !== '' ? $sf_raw['Packing__c'] : $sf_packing,
                    'viscosity'    => $sf_visc,
                    'gross_weight' => isset($sf_raw['GrossWeight__c']) ? $sf_raw['GrossWeight__c'] : null,
                    'weight_unit'  => isset($sf_raw['WeightUnit__c']) ? $sf_raw['WeightUnit__c'] : null,
                    'full_name'    => isset($sf_raw['B2BProductName__c']) ? $sf_raw['B2BProductName__c'] : ''
                ]
            ],
            'RelatedProducts__c' => $related_products, 
        ];


        return $data;
    }

    /**
     * Helper de Log
     */
    private function logger($message) {
       $logs = get_option('moove_sf_sync_logs', []);
       if (!is_array($logs)) $logs = [];
       
       $entry = '[' . current_time('mysql') . '] ' . $message;
       array_unshift($logs, $entry);
       
       // Mantém apenas os últimos 200 logs
       if (count($logs) > 200) $logs = array_slice($logs, 0, 200);
       update_option('moove_sf_sync_logs', $logs);
    }

    /**
     * Exibe alerta de produtos Sem Categoria
     * Solicitado por Natalie para monitorar novas famílias de produtos do Salesforce
     */
    public function render_uncategorized_admin_notice() {
        if (!current_user_can('manage_options')) return;

        $screen = get_current_screen();
        // Exibe apenas no Dashboard ou na listagem de Produtos
        if (!$screen || !in_array($screen->id, ['dashboard', 'edit-produtos'])) return;

        // Se o filtro estiver ativo, exibe mensagem de confirmação
        if (isset($_GET['moove_uncategorized_filter']) && $_GET['moove_uncategorized_filter'] == '1') {
            echo '<div class="notice notice-success is-dismissible">';
            echo '<p><strong>Filtro Ativo:</strong> Exibindo apenas produtos sem categorização. <a href="' . esc_url(remove_query_arg('moove_uncategorized_filter')) . '">Limpar filtro</a></p>';
            echo '</div>';
            return;
        }

        $count = get_transient('moove_sf_uncategorized_count');

        if ($count === false) {
            $query = new WP_Query([
                'post_type'      => 'produtos',
                'post_status'    => 'publish',
                'posts_per_page' => 1, // Apenas para obter o total
                'fields'         => 'ids',
                'tax_query'      => [
                    [
                        'taxonomy' => 'segmento',
                        'operator' => 'NOT EXISTS' // Produtos sem nenhum termo em 'segmento'
                    ]
                ]
            ]);
            $count = $query->found_posts;
            set_transient('moove_sf_uncategorized_count', $count, 300); // Cache por 5 minutos
        }

        if ($count > 0) {
            $filter_url = admin_url('edit.php?post_type=produtos&moove_uncategorized_filter=1');
            echo '<div class="notice notice-warning is-dismissible">';
            echo '<p><strong>Atenção:</strong> Existem <strong>' . intval($count) . '</strong> produtos marcados para exibição, mas sem categorização. ';
            echo '<a href="' . esc_url($filter_url) . '" class="button button-secondary" style="margin-left: 10px;">Filtrar Produtos Sem Categoria</a></p>';
            echo '</div>';
        }
    }

    public function filter_uncategorized_products_query($query) {
        if (!is_admin() || !$query->is_main_query()) return;

        if ($query->get('post_type') === 'produtos' && isset($_GET['moove_uncategorized_filter']) && $_GET['moove_uncategorized_filter'] == '1') {
            $tax_query = $query->get('tax_query') ?: [];
            $tax_query[] = [
                'taxonomy' => 'segmento',
                'operator' => 'NOT EXISTS'
            ];
            $query->set('tax_query', $tax_query);
        }
    }

    /**
     * Registra endpoint para buscar opções de filtro baseadas nos produtos existentes
     */
    public function register_filter_endpoints() {
        register_rest_route('moove/v1', '/filters/(?P<segment>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_segment_filters'],
            'permission_callback' => '__return_true'
        ]);
    }

    /**
     * Retorna valores únicos de Viscosidade e Tecnologia para um segmento
     * Usa SQL direto para performance e cache via Transients
     */
    public function get_segment_filters($request) {
        global $wpdb;
        $segment_slug = $request['segment'];
        $aplicacao_slug = $request->get_param('aplicacao');
        $tecnologia_slug = $request->get_param('tecnologia');
        $ponto_lubrificacao_slug = $request->get_param('ponto_lubrificacao');
        $espessante_slug = $request->get_param('espessante');

        // Cache key baseada no segmento
        $cache_key = 'moove_filters_v2_' . $segment_slug;
        if (!empty($aplicacao_slug)) {
            $cache_key .= '_app_' . md5($aplicacao_slug);
        }
        if (!empty($tecnologia_slug)) {
            $cache_key .= '_tech_' . md5($tecnologia_slug);
        }
        if (!empty($ponto_lubrificacao_slug)) {
            $cache_key .= '_ponto_' . md5($ponto_lubrificacao_slug);
        }
        if (!empty($espessante_slug)) {
            $cache_key .= '_esp_' . md5($espessante_slug);
        }

        $cached_data = get_transient($cache_key);

        if ($cached_data !== false) {
            return rest_ensure_response($cached_data);
        }

        // 1. Obter IDs dos produtos na categoria (Segmento)
        $base_args = [
            'post_type' => 'produtos',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'tax_query' => [
                [
                    'taxonomy' => 'segmento',
                    'field' => 'slug',
                    'terms' => $segment_slug
                ]
            ]
        ];
        $segment_product_ids = get_posts($base_args);

        if (empty($segment_product_ids) || is_wp_error($segment_product_ids)) {
            return [
                'viscosidade' => [],
                'tecnologia' => [],
                'aplicacao' => [],
                'ponto_lubrificacao' => [],
                'espessante' => [],
            ];
        }

        $segment_ids_string = implode(',', array_map('intval', $segment_product_ids));

        $get_taxonomy_term_counts = function ($taxonomy, $product_ids_string) use ($wpdb) {
            if (empty($product_ids_string)) {
                return [];
            }

            $taxonomy = esc_sql($taxonomy);

            return $wpdb->get_results("
                SELECT t.name as label, t.slug as value, COUNT(DISTINCT tr.object_id) as count
                FROM {$wpdb->term_relationships} tr
                INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
                INNER JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
                WHERE tt.taxonomy = '{$taxonomy}'
                AND tr.object_id IN ($product_ids_string)
                GROUP BY t.term_id
                ORDER BY t.name ASC
            ");
        };

        $get_filtered_ids_by_taxonomy = function ($product_ids_string, $taxonomy, $slug_csv) {
            if (empty($product_ids_string) || empty($slug_csv)) {
                return $product_ids_string;
            }

            $product_ids = array_filter(array_map('intval', explode(',', $product_ids_string)));
            if (empty($product_ids)) {
                return null;
            }

            $filtered_ids = get_posts([
                'post_type' => 'produtos',
                'posts_per_page' => -1,
                'fields' => 'ids',
                'post__in' => $product_ids,
                'tax_query' => [
                    [
                        'taxonomy' => $taxonomy,
                        'field' => 'slug',
                        'terms' => explode(',', $slug_csv),
                        'operator' => 'IN',
                    ],
                ],
            ]);

            if (empty($filtered_ids) || is_wp_error($filtered_ids)) {
                return null;
            }

            return implode(',', array_map('intval', $filtered_ids));
        };

        // 2. Obter IDs FILTRADOS pela Aplicação (Para listar Tecnologia e Viscosidade)
        $filtered_ids_string = $segment_ids_string;
        
        if (!empty($aplicacao_slug)) {
            $filtered_args = $base_args;
            $filtered_args['tax_query'][] = [
                'taxonomy' => 'aplicacoes',
                'field' => 'slug',
                'terms' => explode(',', $aplicacao_slug),
                'operator' => 'IN'
            ];
            // Garante relação AND
            $filtered_args['tax_query']['relation'] = 'AND';
            
            $filtered_product_ids = get_posts($filtered_args);
            
            if (empty($filtered_product_ids)) {
                 $filtered_ids_string = null; // Nenhum produto encontrado com essa aplicação
            } else {
                 $filtered_ids_string = implode(',', array_map('intval', $filtered_product_ids));
            }
        }

        $filtered_ids_tech_string = $filtered_ids_string;

        if (!empty($tecnologia_slug) && $filtered_ids_string) {
            $tech_args = [
                'post_type' => 'produtos',
                'posts_per_page' => -1,
                'fields' => 'ids',
                'post__in' => explode(',', $filtered_ids_string),
                'meta_query' => [
                    [
                        'key' => '_salesforce_technology',
                        'value' => explode(',', $tecnologia_slug),
                        'compare' => 'IN'
                    ]
                ]
            ];
            $tech_product_ids = get_posts($tech_args);
            
            if (empty($tech_product_ids)) {
                $filtered_ids_tech_string = null;
            } else {
                $filtered_ids_tech_string = implode(',', array_map('intval', $tech_product_ids));
            }
        }

        // 2. Buscar valores únicos via SQL direto (Muito mais rápido que loopar objetos)
        // Viscosidade (Usa IDs Filtrados)
        $viscosities = [];
        if ($filtered_ids_tech_string) {
            $viscosities = $wpdb->get_results("
                SELECT DISTINCT meta_value as value, COUNT(post_id) as count 
                FROM {$wpdb->postmeta} 
                WHERE meta_key = '_salesforce_viscosity' 
                AND post_id IN ($filtered_ids_tech_string) 
                AND meta_value != ''
                GROUP BY meta_value
                ORDER BY meta_value ASC
            ");
        }

        // Tecnologia (Usa IDs Filtrados)
        $technologies = [];
        if ($filtered_ids_string) {
            $technologies = $wpdb->get_results("
                SELECT DISTINCT meta_value as value, COUNT(post_id) as count 
                FROM {$wpdb->postmeta} 
                WHERE meta_key = '_salesforce_technology' 
                AND post_id IN ($filtered_ids_string) 
                AND meta_value != ''
                GROUP BY meta_value
                ORDER BY meta_value ASC
            ");
        }
        
        // Aplicação (Usa TODOS os IDs do segmento - para manter as opções irmãs visíveis)
        $applications = $wpdb->get_results("
            SELECT t.name as label, t.slug as value, COUNT(tr.object_id) as count
            FROM {$wpdb->term_relationships} tr
            INNER JOIN {$wpdb->term_taxonomy} tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            INNER JOIN {$wpdb->terms} t ON tt.term_id = t.term_id
            WHERE tt.taxonomy = 'aplicacoes'
            AND tr.object_id IN ($segment_ids_string)
            GROUP BY t.term_id
            ORDER BY t.name ASC
        ");

        $is_graxas_active = !empty($aplicacao_slug) && in_array('graxas', array_filter(explode(',', $aplicacao_slug)), true);
        $pontos_lubrificacao = [];
        $espessantes = [];

        if ($is_graxas_active) {
            $ponto_ids_string = $get_filtered_ids_by_taxonomy($filtered_ids_string, 'espessante', $espessante_slug);
            $espessante_ids_string = $get_filtered_ids_by_taxonomy($filtered_ids_string, 'pontos_lubrificacao', $ponto_lubrificacao_slug);

            $pontos_lubrificacao = $get_taxonomy_term_counts('pontos_lubrificacao', $ponto_ids_string);
            $espessantes = $get_taxonomy_term_counts('espessante', $espessante_ids_string);
        }

        $data = [
            'viscosidade' => $viscosities,
            'tecnologia' => $technologies,
            'aplicacao' => $applications,
            'ponto_lubrificacao' => $pontos_lubrificacao,
            'espessante' => $espessantes,
        ];

        // Salva no cache por 1 hora (3600s)
        set_transient($cache_key, $data, 3600);

        return rest_ensure_response($data);
    }

    /**
     * Registra endpoint para listagem de produtos com filtros
     */
    public function register_product_endpoints() {
        register_rest_route('moove/v1', '/products/(?P<segment>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_segment_products'],
            'permission_callback' => '__return_true'
        ]);
    }

    /**
     * Retorna produtos filtrados por segmento e parâmetros de URL
     */
    public function get_segment_products($request) {
        $segment = $request['segment'];
        $page = max(1, (int) ($request->get_param('page') ?: 1));
        $per_page = 12;
        $viscosidade = $request->get_param('viscosidade');
        $tecnologia = $request->get_param('tecnologia');
        $aplicacao = $request->get_param('aplicacao');
        $ponto_lubrificacao = $request->get_param('ponto_lubrificacao');
        $espessante = $request->get_param('espessante');
        $debug = defined('WP_DEBUG') && WP_DEBUG;

        $args = [
            'post_type' => 'produtos',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'tax_query' => [
                'relation' => 'AND',
                [
                    'taxonomy' => 'segmento',
                    'field' => 'slug',
                    'terms' => $segment
                ]
            ],
            'meta_query' => [
                'relation' => 'AND'
            ]
        ];

        // Filtro: Viscosidade (Meta)
        if (!empty($viscosidade)) {
            $values = explode(',', $viscosidade);
            $args['meta_query'][] = [
                'key' => '_salesforce_viscosity',
                'value' => $values,
                'compare' => 'IN'
            ];
        }

        // Filtro: Tecnologia (Meta)
        if (!empty($tecnologia)) {
            $values = explode(',', $tecnologia);
            $args['meta_query'][] = [
                'key' => '_salesforce_technology',
                'value' => $values,
                'compare' => 'IN'
            ];
        }

        // Filtro: Aplicação (Taxonomy: aplicacoes)
        if (!empty($aplicacao)) {
            $values = explode(',', $aplicacao);
            $args['tax_query'][] = [
                'taxonomy' => 'aplicacoes',
                'field' => 'slug',
                'terms' => $values,
                'operator' => 'IN'
            ];
        }

        // Filtro: Pontos de Lubrificação (Taxonomy: pontos_lubrificacao)
        if (!empty($ponto_lubrificacao)) {
            $values = explode(',', $ponto_lubrificacao);
            $args['tax_query'][] = [
                'taxonomy' => 'pontos_lubrificacao',
                'field' => 'slug',
                'terms' => $values,
                'operator' => 'IN'
            ];
        }

        // Filtro: Espessante (Taxonomy: espessante)
        if (!empty($espessante)) {
            $values = explode(',', $espessante);
            $args['tax_query'][] = [
                'taxonomy' => 'espessante',
                'field' => 'slug',
                'terms' => $values,
                'operator' => 'IN'
            ];
        }

        $cache_key_parts = [
            'segment' => $segment,
            'viscosidade' => $viscosidade,
            'tecnologia' => $tecnologia,
            'aplicacao' => $aplicacao,
            'ponto_lubrificacao' => $ponto_lubrificacao,
            'espessante' => $espessante,
        ];
        $grouped_cache_key = 'moove_segment_products_' . md5(wp_json_encode($cache_key_parts));

        $grouped_products = get_transient($grouped_cache_key);
        $raw_count = 0;

        if ($grouped_products === false) {
            $query = new WP_Query($args);

            $products_raw = [];
            foreach ($query->posts as $post_id) {
                $extended = $this->get_product_extended_data($post_id);
                if (!empty($extended['sf']) && is_array($extended['sf'])) {
                    $products_raw[] = $extended['sf'];
                }
            }

            $raw_count = count($products_raw);
            $grouped_products = $this->group_products_by_commercial_name($products_raw);
            set_transient($grouped_cache_key, $grouped_products, 900);
        }

        if (!is_array($grouped_products)) {
            $grouped_products = [];
        }

        $total_grouped = count($grouped_products);
        $total_pages = (int) max(1, ceil($total_grouped / $per_page));
        $safe_page = min($page, $total_pages);
        $offset = ($safe_page - 1) * $per_page;
        $products = array_slice($grouped_products, $offset, $per_page);

        if ($debug) {
            error_log(sprintf(
                '[moove/v1/products] segment=%s raw=%d grouped=%d page=%d/%d',
                $segment,
                $raw_count,
                $total_grouped,
                $safe_page,
                $total_pages
            ));
        }

        return [
            'products' => $products,
            'pagination' => [
                'total' => $total_grouped,
                'pages' => $total_pages,
                'current' => $safe_page
            ]
        ];
    }

    /**
     * Agrupa produtos por nome comercial para evitar duplicidade por SKU.
     */
    private function group_products_by_commercial_name($products) {
        $grouped = [];

        foreach ($products as $product) {
            $name = !empty($product['B2BProductName__c'])
                ? $product['B2BProductName__c']
                : (!empty($product['_debug_sf_name']) ? $product['_debug_sf_name'] : 'produto-sem-nome');

            $group_key = sanitize_title(wp_strip_all_tags(html_entity_decode($name, ENT_QUOTES | ENT_HTML5)));

            if (empty($grouped[$group_key])) {
                $base = $product;
                $base['slug'] = sanitize_title($name);
                $base['variations'] = [];
                $grouped[$group_key] = $base;
            }

            $variation = [
                'sku' => isset($product['StockKeepingUnit']) ? $product['StockKeepingUnit'] : '',
                'viscosity' => isset($product['Viscosity__c']) ? $product['Viscosity__c'] : '',
                'packing' => isset($product['Packing__c']) ? $product['Packing__c'] : '',
                'full_name' => $name,
            ];

            $existing_skus = array_column($grouped[$group_key]['variations'], 'sku');
            if (!in_array($variation['sku'], $existing_skus, true)) {
                $grouped[$group_key]['variations'][] = $variation;
            }
        }

        usort($grouped, function ($a, $b) {
            $name_a = isset($a['B2BProductName__c']) ? $a['B2BProductName__c'] : '';
            $name_b = isset($b['B2BProductName__c']) ? $b['B2BProductName__c'] : '';
            return strcasecmp($name_a, $name_b);
        });

        return $grouped;
    }

    /**
     * Busca ID do post pelo SKU salvo no meta
     */
    private function get_product_id_by_sku($sku)
    {
        $args = [
            'post_type'   => 'produtos',
            'meta_key'   => '_salesforce_sku',
            'meta_value' => $sku,
            'fields'     => 'ids',
            'numberposts' => 1,
            'post_status' => 'any'
        ];
        $posts = get_posts($args);
        return !empty($posts) ? $posts[0] : false;
    }

    /**
     * Aplica a categorização automática (Segmento e Tipo de Produto) baseada em regras.
     * Lógica de Preservação: Só aplica se o produto NÃO tiver termos nessas taxonomias.
     * Isso evita sobrescrever edições manuais do cliente em sincronizações futuras.
     */
    private function apply_automatic_categorization($post_id, $sf_data) {
        // 1. Preparar o texto para análise
        $text_to_analyze = '';
        if (!empty($sf_data['ProductApplication__c'])) {
            $text_to_analyze .= ' ' . $sf_data['ProductApplication__c'];
        }
        if (!empty($sf_data['B2BProductName__c'])) {
            $text_to_analyze .= ' ' . $sf_data['B2BProductName__c'];
        }
        $text_to_analyze = mb_strtoupper($text_to_analyze, 'UTF-8');

        // 2. Obter as regras
        $rules = $this->get_categorization_rules();

        // 3. Segmento - Só aplica se estiver vazio (Preserva manual)
        $current_segments = wp_get_object_terms($post_id, 'segmento', ['fields' => 'ids']);
        if (empty($current_segments) || is_wp_error($current_segments)) {
            $segment_slug = $this->find_term_slug_from_rules($text_to_analyze, $rules['segmento']);
            if ($segment_slug) {
                wp_set_object_terms($post_id, $segment_slug, 'segmento');
            } else {
                // Fallback explícito para 'sem-segmento' caso nenhuma regra seja atendida
                wp_set_object_terms($post_id, 'sem-segmento', 'segmento');
            }
        }

        // 4. Aplicações - Só aplica se estiver vazio (Preserva manual)
        // Taxonomia alterada para: 'aplicacoes'
        $current_types = wp_get_object_terms($post_id, 'aplicacoes', ['fields' => 'ids']);
        if (empty($current_types) || is_wp_error($current_types)) {
            $product_type_slug = $this->find_term_slug_from_rules($text_to_analyze, $rules['aplicacoes']);
            
            if (!$product_type_slug) {
                $product_type_slug = 'outras-aplicacoes';
            }
            wp_set_object_terms($post_id, $product_type_slug, 'aplicacoes');
        }
    }

    /**
     * Helper para encontrar slug baseado em regras
     */
    private function find_term_slug_from_rules($text, $rules_group) {
        foreach ($rules_group as $slug => $keywords) {
            foreach ($keywords as $keyword) {
                if (mb_strpos($text, $keyword) !== false) {
                    return $slug;
                }
            }
        }
        return null;
    }

    /**
     * Regras de categorização
     */
    private function get_categorization_rules() {
        return [
            'segmento' => [
                'carros' => ['CARRO', 'AUTOMÓVEIS', 'AUTOMOTIVO', 'PASSAGEIRO'],
                'motos' => ['MOTO', 'MOTOCICLETA'],
                'caminhoes' => ['CAMINHÃO', 'CAMINHÕES', 'COMERCIAL', 'PESADO'],
                'maquinas-agricolas' => ['AGRÍCOLA', 'TRATOR', 'COLHEITADEIRA'],
                'industria' => ['INDÚSTRIA', 'INDUSTRIAL'],
            ],
            'aplicacoes' => [
                'oleos-para-motor' => ['ÓLEOS PARA MOTOR', 'ÓLEO DE MOTOR', 'OLEO PARA MOTOR'],
                'transmissao-e-eixo' => ['TRANSMISSÃO E EIXO'],
                'equipamento-fora-de-estrada' => ['FORA DE ESTRADA', 'OFF-ROAD'],
                'fluidos-especiais' => ['FLUÍDO', 'FLUIDO', 'FLUÍDOS ESPECIAIS'],
                'transmissao' => ['TRANSMISSÃO', 'TRANSMISSAO'],
                'eixo-diferencial' => ['EIXO', 'DIFERENCIAL'],
                'graxas' => ['GRAXA'],
                'motor' => ['MOTOR'],
            ]
        ];
    }
}
