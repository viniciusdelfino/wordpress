<?php
// Verificar segurança
if (!defined('ABSPATH')) {
    exit;
}

$current_env = get_option('salesforce_environment', 'development');
$dev_credentials = get_option('salesforce_credentials_development', []);
$prod_credentials = get_option('salesforce_credentials_production', []);

// Determinar qual credencial mostrar
$active_credentials = $current_env === 'production' ? $prod_credentials : $dev_credentials;

// URLs de ação
$save_url = admin_url('admin-post.php?action=salesforce_save_credentials');
$switch_url = admin_url('admin-post.php?action=salesforce_switch_environment');
?>

<div class="wrap salesforce-admin">
    <h1><?php echo esc_html__('Integração de Produtos com Salesforce', 'salesforce-products'); ?></h1>
    
    <?php if (isset($_GET['updated'])): ?>
        <div class="notice notice-success is-dismissible">
            <p><?php esc_html_e('Credencial salva com sucesso!', 'salesforce-products'); ?></p>
        </div>
    <?php endif; ?>
    
    <?php if (isset($_GET['switched'])): ?>
        <div class="notice notice-info is-dismissible">
            <p>
                <?php printf(
                    esc_html__('Ambiente alterado com sucesso de %s para %s', 'salesforce-products'),
                    esc_html($_GET['from']),
                    esc_html($_GET['to'])
                ); ?>
            </p>
        </div>
    <?php endif; ?>

    <?php if ($active_tab == 'credentials'): ?>
    
    <div class="environment-switcher">
        <h2><?php esc_html_e(' Selecione o ambiente', 'salesforce-products'); ?></h2>
        
        <div class="environment-buttons">
            <form method="post" action="<?php echo esc_url($switch_url); ?>" class="environment-form">
                <?php wp_nonce_field('salesforce_switch_environment'); ?>
                
                <input type="hidden" name="new_environment" value="development">
                
                <button type="submit" class="button button-large environment-btn 
                    <?php echo $current_env === 'development' ? 'button-primary active' : 'button-secondary'; ?>">
                    <span class="dashicons dashicons-admin-tools"></span>
                    <?php esc_html_e('Desenvolvimento', 'salesforce-products'); ?>
                    <?php if ($current_env === 'development'): ?>
                        <span class="current-badge"><?php esc_html_e('ATUAL', 'salesforce-products'); ?></span>
                    <?php endif; ?>
                </button>
            </form>
            
            <form method="post" action="<?php echo esc_url($switch_url); ?>" class="environment-form">
                <?php wp_nonce_field('salesforce_switch_environment'); ?>
                
                <input type="hidden" name="new_environment" value="production">
                
                <button type="submit" class="button button-large environment-btn 
                    <?php echo $current_env === 'production' ? 'button-primary active' : 'button-secondary'; ?>">
                    <span class="dashicons dashicons-businesswoman"></span>
                    <?php esc_html_e('Produção', 'salesforce-products'); ?>
                    <?php if ($current_env === 'production'): ?>
                        <span class="current-badge"><?php esc_html_e('ATUAL', 'salesforce-products'); ?></span>
                    <?php endif; ?>
                </button>
            </form>
        </div>
        
        <div class="environment-info">
            <p>
                <strong><?php esc_html_e(' Ambiente atual:', 'salesforce-products'); ?></strong>
                <span class="env-badge env-<?php echo esc_attr($current_env); ?>">
                    <?php echo strtoupper(esc_html($current_env)); ?>
                </span>
            </p>
            
            <div class="env-descriptions">
                <div class="env-description dev-desc" style="<?php echo $current_env !== 'development' ? 'display:none;' : ''; ?>">
                    <h3><span class="dashicons dashicons-info"></span> Ambiente de desenvolvimento </h3>
                    <p> Use isso para atestar e desenvolver. Não são dados reais.</p>
                    <ul>
                        <li>Sandbox/Staging instance</li>
                        <li>Lower API limits</li>
                        <li>Test data only</li>
                        <li>Safe for testing</li>
                    </ul>
                </div>
                
                <div class="env-description prod-desc" style="<?php echo $current_env !== 'production' ? 'display:none;' : ''; ?>">
                    <h3><span class="dashicons dashicons-warning"></span> Ambiente de produção </h3>
                    <p><strong> Cuidado:</strong> Contém dados reais.</p>
                    <ul>
                        <li>Live Salesforce instance</li>
                        <li>Real customer data</li>
                        <li>Higher API limits</li>
                        <li>Changes affect real users</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <?php elseif ($active_tab == 'categories'): ?>
        <?php $category_map = get_option('salesforce_category_map', []); ?>
        
        <div class="card" style="max-width: 100%; margin-top: 20px;">
            <h2><?php esc_html_e('Mapeamento de Categorias', 'salesforce-products'); ?></h2>
            <p class="description">
                Associe os termos técnicos vindos do Salesforce (Coluna Esquerda) com os Slugs das categorias no seu site (Coluna Direita).<br>
                Isso permite agrupar múltiplos termos do Salesforce sob uma única categoria no site.
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
                            <?php foreach ($category_map as $sf_term => $wp_slug) : ?>
                                <tr>
                                    <td><input type="text" name="salesforce_category_map_keys[]" value="<?php echo esc_attr($sf_term); ?>" class="widefat" /></td>
                                    <td><input type="text" name="salesforce_category_map_values[]" value="<?php echo esc_attr($wp_slug); ?>" class="widefat" /></td>
                                    <td><button type="button" class="button remove-row"><span class="dashicons dashicons-trash"></span></button></td>
                                </tr>
                            <?php endforeach; ?>
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

        <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('.add-category-row').on('click', function() {
                var row = '<tr><td><input type="text" name="salesforce_category_map_keys[]" class="widefat" placeholder="Ex: MOTOR DE MOTOS" /></td><td><input type="text" name="salesforce_category_map_values[]" class="widefat" placeholder="Ex: motos" /></td><td><button type="button" class="button remove-row"><span class="dashicons dashicons-trash"></span></button></td></tr>';
                $('#category-map-table tbody').append(row);
            });
            $(document).on('click', '.remove-row', function() {
                $(this).closest('tr').remove();
            });
        });
        </script>
    <?php endif; ?>
    
    <div class="credentials-form">
        <h2><?php printf(
            esc_html__('%s Credenciais de ambientes', 'salesforce-products'),
            ucfirst($current_env)
        ); ?></h2>
        
        <form method="post" action="<?php echo esc_url($save_url); ?>">
            <?php wp_nonce_field('salesforce_save_credentials'); ?>
            
            <input type="hidden" name="environment" value="<?php echo esc_attr($current_env); ?>">
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="client_id"><?php esc_html_e('Client ID', 'salesforce-products'); ?></label>
                    </th>
                    <td>
                        <input type="text" id="client_id" name="client_id" 
                               value="<?php echo esc_attr($active_credentials['client_id'] ?? ''); ?>" 
                               class="regular-text" required>
                        <p class="description"><?php esc_html_e('Also known as Consumer Key', 'salesforce-products'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="client_secret"><?php esc_html_e('Client Secret', 'salesforce-products'); ?></label>
                    </th>
                    <td>
                        <input type="password" id="client_secret" name="client_secret" 
                               value="<?php echo esc_attr($active_credentials['client_secret'] ?? ''); ?>" 
                               class="regular-text" required>
                        <p class="description"><?php esc_html_e('Also known as Consumer Secret', 'salesforce-products'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="username"><?php esc_html_e('Username', 'salesforce-products'); ?></label>
                    </th>
                    <td>
                        <input type="text" id="username" name="username" 
                               value="<?php echo esc_attr($active_credentials['username'] ?? ''); ?>" 
                               class="regular-text" required>
                        <p class="description"><?php esc_html_e('Salesforce login email', 'salesforce-products'); ?></p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="password"><?php esc_html_e('Password', 'salesforce-products'); ?></label>
                    </th>
                    <td>
                        <input type="password" id="password" name="password" 
                               value="<?php echo esc_attr($active_credentials['password'] ?? ''); ?>" 
                               class="regular-text" required>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="security_token"><?php esc_html_e('Security Token', 'salesforce-products'); ?></label>
                    </th>
                    <td>
                        <input type="text" id="security_token" name="security_token" 
                               value="<?php echo esc_attr($active_credentials['security_token'] ?? ''); ?>" 
                               class="regular-text">
                        <p class="description">
                            <?php esc_html_e('Get this from Salesforce: Setup → My Personal Information → Reset Security Token', 'salesforce-products'); ?>
                        </p>
                    </td>
                </tr>
            </table>
            
            <div class="form-actions">
                <button type="submit" class="button button-primary">
                    <?php esc_html_e('Save Credentials', 'salesforce-products'); ?>
                </button>
                
                <button type="button" class="button button-secondary test-connection-btn"
                        data-environment="<?php echo esc_attr($current_env); ?>">
                    <?php esc_html_e('Test Connection', 'salesforce-products'); ?>
                </button>
            </div>
        </form>
        
        <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border: 1px solid #ddd;">
            <h3>Debug Info</h3>
            <p><strong>Environment:</strong> <?php echo esc_html($current_env); ?></p>
            <p><strong>Credentials Configured:</strong> 
                <?php echo $this->auth->has_credentials($current_env) ? '✅ Yes' : '❌ No'; ?>
            </p>
            <p><strong>Security Token Note:</strong> Append to password! Password+Token = "<?php echo esc_html($active_credentials['password'] ?? '') . ($active_credentials['security_token'] ?? ''); ?>"</p>
        </div>
    </div>
    
    <div class="current-status">
        <h2><?php esc_html_e('Current Status', 'salesforce-products'); ?></h2>
        
        <?php
        $last_sync = get_option('salesforce_last_sync', '');
        $cache_count = $this->get_cache_count();
        ?>
        
        <div class="status-cards">
            <div class="status-card">
                <h3><?php esc_html_e('Environment', 'salesforce-products'); ?></h3>
                <div class="status-value env-<?php echo esc_attr($current_env); ?>">
                    <?php echo strtoupper(esc_html($current_env)); ?>
                </div>
            </div>
            
            <div class="status-card">
                <h3><?php esc_html_e('Last Sync', 'salesforce-products'); ?></h3>
                <div class="status-value">
                    <?php echo $last_sync ? date_i18n('d/m/Y H:i', strtotime($last_sync)) : 
                          esc_html__('Never', 'salesforce-products'); ?>
                </div>
            </div>
            
            <div class="status-card">
                <h3><?php esc_html_e('Cache Items', 'salesforce-products'); ?></h3>
                <div class="status-value"><?php echo esc_html($cache_count); ?></div>
            </div>
            
            <div class="status-card">
                <h3><?php esc_html_e('API Status', 'salesforce-products'); ?></h3>
                <div class="status-value api-status" id="api-status-check">
                    <?php esc_html_e('Check connection', 'salesforce-products'); ?>
                </div>
            </div>
        </div>
    </div>
    
    <div class="quick-actions">
        <h2><?php esc_html_e('Quick Actions', 'salesforce-products'); ?></h2>
        
        <div class="action-buttons">
            <button class="button" id="clear-cache-btn">
                <?php esc_html_e('Clear Cache', 'salesforce-products'); ?>
            </button>
            
            <button class="button" id="force-sync-btn">
                <?php esc_html_e('Force Sync', 'salesforce-products'); ?>
            </button>
            
            <button class="button" id="view-logs-btn" 
                    onclick="window.location.href='<?php echo admin_url('admin.php?page=salesforce-log'); ?>'">
                <?php esc_html_e('View Logs', 'salesforce-products'); ?>
            </button>
        </div>
    </div>
</div>

<!-- Modal de Teste de Conexão -->
<div id="test-connection-modal" class="salesforce-modal" style="display:none;">
    <div class="modal-content">
        <h3><?php esc_html_e('Testing Connection', 'salesforce-products'); ?></h3>
        <div class="modal-body">
            <div class="test-progress">
                <div class="spinner is-active"></div>
                <p id="test-message"><?php esc_html_e('Connecting to Salesforce...', 'salesforce-products'); ?></p>
            </div>
            <div class="test-result" id="test-result" style="display:none;"></div>
        </div>
        <div class="modal-footer">
            <button type="button" class="button" id="close-test-modal">
                <?php esc_html_e('Close', 'salesforce-products'); ?>
            </button>
        </div>
    </div>
</div>