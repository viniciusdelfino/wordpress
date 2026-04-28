<?php
/**
 * Cron Jobs Manager
 * Gerencia sincronização automática e manutenção
 */

class Cron_Manager {
    
    private $product_manager;
    private $cache_manager;
    
    public function __construct($product_manager, $cache_manager) {
        $this->product_manager = $product_manager;
        $this->cache_manager = $cache_manager;
        
        // Registrar hooks de cron
        add_action('salesforce_daily_sync', [$this, 'daily_sync']);
        add_action('salesforce_hourly_cache_check', [$this, 'hourly_cache_check']);
        add_action('salesforce_weekly_cleanup', [$this, 'weekly_cleanup']);
        
        // Adicionar intervalos personalizados
        add_filter('cron_schedules', [$this, 'add_cron_intervals']);
    }
    
    /**
     * Adiciona intervalos personalizados de cron
     */
    public function add_cron_intervals($schedules) {
        // Intervalo a cada 15 minutos
        $schedules['every_15_minutes'] = [
            'interval' => 15 * MINUTE_IN_SECONDS,
            'display' => __('Every 15 minutes', 'salesforce-products')
        ];
        
        // Intervalo a cada 6 horas
        $schedules['every_6_hours'] = [
            'interval' => 6 * HOUR_IN_SECONDS,
            'display' => __('Every 6 hours', 'salesforce-products')
        ];
        
        return $schedules;
    }
    
    /**
     * Sincronização diária completa
     */
    public function daily_sync() {
        if (DISABLE_SALESFORCE_SYNC) {
            return;
        }
        
        $start_time = microtime(true);
        
        try {
            // 1. Sincronização completa
            $result = $this->product_manager->full_sync();
            
            // 2. Limpar cache expirado
            $this->cache_manager->cleanup_expired();
            
            $execution_time = round(microtime(true) - $start_time, 2);
            
            // Log detalhado
            $this->log_cron('daily_sync', [
                'success' => $result['success'] ?? false,
                'execution_time' => $execution_time,
                'categories_count' => $result['data']['categories_count'] ?? 0,
                'products_count' => $result['data']['products_count'] ?? 0,
                'message' => $result['message'] ?? ''
            ]);
            
        } catch (Exception $e) {
            $this->log_cron('daily_sync', [
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
    
    /**
     * Verificação horária de cache e sincronização incremental
     */
    public function hourly_cache_check() {
        if (DISABLE_SALESFORCE_SYNC) {
            return;
        }
        
        $start_time = microtime(true);
        
        try {
            // 1. Sincronização incremental
            $sync_result = $this->product_manager->incremental_sync();
            
            // 2. Verificar estatísticas de cache
            $cache_stats = $this->cache_manager->get_stats();
            $cache_hit_rate = $cache_stats['hit_rate'] ?? 0;
            
            // 3. Se hit rate estiver baixo, ajustar estratégia
            if ($cache_hit_rate < 50) {
                $this->adjust_cache_strategy($cache_stats);
            }
            
            // 4. Verificar se precisa de sync completa
            $last_full_sync = get_option('salesforce_last_full_sync', '');
            $days_since_full_sync = $last_full_sync ? 
                (time() - strtotime($last_full_sync)) / DAY_IN_SECONDS : 999;
            
            if ($days_since_full_sync > 7) {
                // Forçar sync completa uma vez por semana
                update_option('salesforce_last_full_sync', current_time('mysql'));
                wp_schedule_single_event(time() + 300, 'salesforce_daily_sync');
            }
            
            $execution_time = round(microtime(true) - $start_time, 2);
            
            $this->log_cron('hourly_check', [
                'success' => $sync_result['success'] ?? false,
                'execution_time' => $execution_time,
                'modified_count' => $sync_result['modified_count'] ?? 0,
                'cache_hit_rate' => $cache_hit_rate,
                'needs_full_sync' => $days_since_full_sync > 7
            ]);
            
        } catch (Exception $e) {
            $this->log_cron('hourly_check', [
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Limpeza semanal
     */
    public function weekly_cleanup() {
        try {
            // 1. Limpar logs antigos
            $this->cleanup_old_logs();
            
            // 2. Otimizar tabelas
            $this->optimize_tables();
            
            // 3. Limpar cache muito antigo
            $this->cache_manager->clear();
            
            // 4. Verificar integridade dos dados
            $this->check_data_integrity();
            
            $this->log_cron('weekly_cleanup', [
                'success' => true,
                'message' => 'Weekly maintenance completed'
            ]);
            
        } catch (Exception $e) {
            $this->log_cron('weekly_cleanup', [
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Ajusta estratégia de cache baseado em estatísticas
     */
    private function adjust_cache_strategy($stats) {
        $environment = get_option('salesforce_environment', 'development');
        
        if ($environment === 'production') {
            // Em produção, aumentar tempo de cache se hit rate estiver baixo
            $current_duration = get_option('salesforce_cache_duration', 3600);
            
            if ($stats['hit_rate'] < 30 && $current_duration < 7200) {
                $new_duration = min($current_duration * 1.5, 10800); // Max 3 horas
                update_option('salesforce_cache_duration', $new_duration);
                
                $this->log_cron('cache_adjustment', [
                    'old_duration' => $current_duration,
                    'new_duration' => $new_duration,
                    'reason' => 'Low hit rate: ' . $stats['hit_rate']
                ]);
            }
        }
    }
    
    /**
     * Limpa logs antigos
     */
    private function cleanup_old_logs() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $thirty_days_ago = date('Y-m-d H:i:s', strtotime('-30 days'));
        
        $wpdb->query($wpdb->prepare(
            "DELETE FROM {$table_name} WHERE created_at < %s",
            $thirty_days_ago
        ));
    }
    
    /**
     * Otimiza tabelas do banco
     */
    private function optimize_tables() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $wpdb->query("OPTIMIZE TABLE {$table_name}");
    }
    
    /**
     * Verifica integridade dos dados
     */
    private function check_data_integrity() {
        // Verificar se há categorias sem produtos
        $categories = $this->product_manager->get_all_categories();
        $empty_categories = [];
        
        foreach ($categories['categories'] as $category) {
            $products = $this->product_manager->get_products_by_category($category['slug']);
            if (empty($products['records'])) {
                $empty_categories[] = $category['name'];
            }
        }
        
        if (!empty($empty_categories)) {
            $this->log_cron('data_integrity_check', [
                'warning' => 'Empty categories found',
                'empty_categories' => $empty_categories,
                'total_categories' => count($categories['categories'])
            ]);
        }
    }
    
    /**
     * Log de atividades do cron
     */
    private function log_cron($job_name, $data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $status = $data['success'] ?? false ? 'success' : 'error';
        $message = json_encode($data, JSON_UNESCAPED_UNICODE);
        
        $wpdb->insert($table_name, [
            'sync_type' => 'cron_' . $job_name,
            'status' => $status,
            'error_message' => $message,
            'finished_at' => current_time('mysql')
        ]);
    }
    
    /**
     * Agenda todos os cron jobs
     */
    public static function schedule_all_cron_jobs() {
        if (!wp_next_scheduled('salesforce_daily_sync')) {
            // Executar diariamente às 2:00 AM
            $timestamp = strtotime('today 2:00');
            if ($timestamp < time()) {
                $timestamp = strtotime('tomorrow 2:00');
            }
            wp_schedule_event($timestamp, 'daily', 'salesforce_daily_sync');
        }
        
        if (!wp_next_scheduled('salesforce_hourly_cache_check')) {
            // Executar a cada hora
            wp_schedule_event(time(), 'hourly', 'salesforce_hourly_cache_check');
        }
        
        if (!wp_next_scheduled('salesforce_weekly_cleanup')) {
            // Executar toda segunda-feira às 3:00 AM
            $timestamp = strtotime('next monday 3:00');
            wp_schedule_event($timestamp, 'weekly', 'salesforce_weekly_cleanup');
        }
    }
    
    /**
     * Remove todos os cron jobs
     */
    public static function unschedule_all_cron_jobs() {
        wp_clear_scheduled_hook('salesforce_daily_sync');
        wp_clear_scheduled_hook('salesforce_hourly_cache_check');
        wp_clear_scheduled_hook('salesforce_weekly_cleanup');
    }
    
    /**
     * Verifica status dos cron jobs
     */
    public static function get_cron_status() {
        $status = [
            'daily_sync' => [
                'next' => wp_next_scheduled('salesforce_daily_sync'),
                'scheduled' => wp_next_scheduled('salesforce_daily_sync') !== false
            ],
            'hourly_check' => [
                'next' => wp_next_scheduled('salesforce_hourly_cache_check'),
                'scheduled' => wp_next_scheduled('salesforce_hourly_cache_check') !== false
            ],
            'weekly_cleanup' => [
                'next' => wp_next_scheduled('salesforce_weekly_cleanup'),
                'scheduled' => wp_next_scheduled('salesforce_weekly_cleanup') !== false
            ]
        ];
        
        // Converter timestamps para datas legíveis
        foreach ($status as &$job) {
            if ($job['next']) {
                $job['next_formatted'] = date_i18n('Y-m-d H:i:s', $job['next']);
                $job['next_relative'] = human_time_diff($job['next'], time()) . ' ' . __('from now', 'salesforce-products');
            }
        }
        
        return $status;
    }
}