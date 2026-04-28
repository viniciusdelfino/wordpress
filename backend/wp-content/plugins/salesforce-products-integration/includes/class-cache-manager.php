<?php
/**
 * Cache Manager
 * Gerencia cache multi-nível com fallback e estatísticas
 */

class Cache_Manager {
    
    private $cache_prefix = 'sf_prod_';
    private $cache_groups = [];
    private $stats = [
        'hits' => 0,
        'misses' => 0,
        'sets' => 0,
        'deletes' => 0,
        'group_hits' => []
    ];
  
    public function __construct() {
        // Definir grupos de cache
        $this->cache_groups = [
            'products' => 3600,        // 1 hora para produtos individuais
            'category_products' => 7200, // 2 horas para listas de categoria
            'categories' => 86400,     // 24 horas para categorias
            'auth' => 1800,           // 30 minutos para autenticação
            'api_responses' => 300,    // 5 minutos para respostas da API
            'short_lived' => 60        // 1 minuto para cache temporário
        ];
    }
    
    /**
     * Obtém item do cache
     */
    public function get($key, $group = 'default') {
        $cache_key = $this->build_cache_key($key, $group);
        $value = get_transient($cache_key);
        
        if ($value === false) {
            $this->stats['misses']++;
            $this->stats['group_hits'][$group]['misses'] = 
                ($this->stats['group_hits'][$group]['misses'] ?? 0) + 1;
            return false;
        }
        
        $this->stats['hits']++;
        $this->stats['group_hits'][$group]['hits'] = 
            ($this->stats['group_hits'][$group]['hits'] ?? 0) + 1;
        
        // Verificar se é cache negativo
        if ($value === '__NULL_CACHE__') {
            return null;
        }
        
        return maybe_unserialize($value);
    }
    
    /**
     * Define item no cache
     */
    public function set($key, $value, $group = 'default', $custom_expiration = null) {
        $cache_key = $this->build_cache_key($key, $group);
        
        // Tratar cache negativo (null)
        if ($value === null) {
            $value_to_store = '__NULL_CACHE__';
        } else {
            $value_to_store = maybe_serialize($value);
        }
        
        $expiration = $custom_expiration ?? $this->get_group_expiration($group);
        
        $result = set_transient($cache_key, $value_to_store, $expiration);
        
        if ($result) {
            $this->stats['sets']++;
            
            // Registrar no grupo
            if (!isset($this->stats['group_hits'][$group])) {
                $this->stats['group_hits'][$group] = ['sets' => 0, 'hits' => 0, 'misses' => 0];
            }
            $this->stats['group_hits'][$group]['sets']++;
            
            // Adicionar ao índice do grupo
            $this->add_to_group_index($group, $cache_key);
        }
        
        return $result;
    }
    
    /**
     * Remove item do cache
     */
    public function delete($key, $group = 'default') {
        $cache_key = $this->build_cache_key($key, $group);
        $result = delete_transient($cache_key);
        
        if ($result) {
            $this->stats['deletes']++;
            
            // Remover do índice do grupo
            $this->remove_from_group_index($group, $cache_key);
        }
        
        return $result;
    }
    
    /**
     * Limpa todo o cache ou de um grupo específico
     */
    public function clear($group = null) {
        if ($group) {
            return $this->clear_group($group);
        }
        
        global $wpdb;
        
        // Limpar todos os transientes do nosso prefixo
        $sql = $wpdb->prepare(
            "DELETE FROM {$wpdb->options} 
             WHERE option_name LIKE %s 
             OR option_name LIKE %s",
            '_transient_' . $wpdb->esc_like($this->cache_prefix) . '%',
            '_transient_timeout_' . $wpdb->esc_like($this->cache_prefix) . '%'
        );
        
        $result = $wpdb->query($sql);
        
        // Limpar índices de grupo
        foreach ($this->cache_groups as $group_name => $expiration) {
            delete_option("sf_cache_index_{$group_name}");
        }
        
        // Resetar estatísticas
        $this->reset_stats();
        
        $this->log_clear('all', $result !== false);
        
        return $result !== false;
    }
    
    /**
     * Limpa cache de um grupo específico
     */
    private function clear_group($group) {
        $index_key = "sf_cache_index_{$group}";
        $index = get_option($index_key, []);
        
        if (empty($index)) {
            return true;
        }
        
        $deleted_count = 0;
        foreach ($index as $cache_key) {
            if (delete_transient($cache_key)) {
                $deleted_count++;
            }
        }
        
        // Limpar índice
        delete_option($index_key);
        
        $this->log_clear($group, true, $deleted_count);
        
        return true;
    }
    
    /**
     * Adiciona cache key ao índice do grupo
     */
    private function add_to_group_index($group, $cache_key) {
        $index_key = "sf_cache_index_{$group}";
        $index = get_option($index_key, []);
        
        if (!in_array($cache_key, $index, true)) {
            $index[] = $cache_key;
            update_option($index_key, $index, false);
        }
    }
    
    /**
     * Remove cache key do índice do grupo
     */
    private function remove_from_group_index($group, $cache_key) {
        $index_key = "sf_cache_index_{$group}";
        $index = get_option($index_key, []);
        
        $position = array_search($cache_key, $index, true);
        if ($position !== false) {
            unset($index[$position]);
            update_option($index_key, array_values($index), false);
        }
    }
    
    /**
     * Obtém expiração baseada no grupo
     */
    private function get_group_expiration($group) {
        return $this->cache_groups[$group] ?? HOUR_IN_SECONDS;
    }
    
    /**
     * Constrói chave de cache
     */
    private function build_cache_key($key, $group) {
        $environment = get_option('salesforce_environment', 'development');
        return $this->cache_prefix . $environment . '_' . $group . '_' . md5($key);
    }
    
    /**
     * Obtém estatísticas do cache
     */
    public function get_stats() {
        $total_items = 0;
        $total_size = 0;
        
        // Calcular itens por grupo
        $group_counts = [];
        foreach (array_keys($this->cache_groups) as $group) {
            $index_key = "sf_cache_index_{$group}";
            $index = get_option($index_key, []);
            $group_counts[$group] = count($index);
            $total_items += count($index);
        }
        
        return [
            'hits' => $this->stats['hits'],
            'misses' => $this->stats['misses'],
            'hit_rate' => $this->stats['hits'] + $this->stats['misses'] > 0 
                ? round($this->stats['hits'] / ($this->stats['hits'] + $this->stats['misses']) * 100, 2)
                : 0,
            'sets' => $this->stats['sets'],
            'deletes' => $this->stats['deletes'],
            'total_items' => $total_items,
            'group_counts' => $group_counts,
            'group_stats' => $this->stats['group_hits']
        ];
    }
    
    /**
     * Reset estatísticas
     */
    public function reset_stats() {
        $this->stats = [
            'hits' => 0,
            'misses' => 0,
            'sets' => 0,
            'deletes' => 0,
            'group_hits' => []
        ];
    }
    
    /**
     * Limpa cache expirado
     */
    public function cleanup_expired() {
        global $wpdb;
        
        $sql = $wpdb->prepare(
            "DELETE a, b 
             FROM {$wpdb->options} a, {$wpdb->options} b
             WHERE a.option_name LIKE %s 
             AND a.option_name NOT LIKE %s
             AND b.option_name = CONCAT('_transient_timeout_', SUBSTRING(a.option_name, 12))
             AND b.option_value < %d",
            '_transient_' . $wpdb->esc_like($this->cache_prefix) . '%',
            '_transient_timeout_' . $wpdb->esc_like($this->cache_prefix) . '%',
            time()
        );
        
        $result = $wpdb->query($sql);
        
        // Limpar índices de grupos
        $this->cleanup_group_indices();
        
        $this->log_cleanup($result !== false);
        
        return $result !== false;
    }
    
    /**
     * Limpa índices de grupos de cache expirados
     */
    private function cleanup_group_indices() {
        foreach (array_keys($this->cache_groups) as $group) {
            $index_key = "sf_cache_index_{$group}";
            $index = get_option($index_key, []);
            
            if (empty($index)) {
                continue;
            }
            
            $valid_keys = [];
            foreach ($index as $cache_key) {
                if (get_transient($cache_key) !== false) {
                    $valid_keys[] = $cache_key;
                }
            }
            
            if (count($valid_keys) !== count($index)) {
                update_option($index_key, $valid_keys, false);
            }
        }
    }
    
    /**
     * Log de operações de cache
     */
    private function log_clear($scope, $success, $count = null) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $message = "Cache cleared: {$scope}";
        if ($count !== null) {
            $message .= " ({$count} items)";
        }
        
        $wpdb->insert($table_name, [
            'sync_type' => 'cache_clear',
            'items_count' => $count ?? 0,
            'status' => $success ? 'success' : 'error',
            'error_message' => $message,
            'finished_at' => current_time('mysql')
        ]);
    }
    
    private function log_cleanup($success) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'salesforce_sync_log';
        
        $wpdb->insert($table_name, [
            'sync_type' => 'cache_cleanup',
            'status' => $success ? 'success' : 'error',
            'error_message' => 'Expired cache cleanup',
            'finished_at' => current_time('mysql')
        ]);
    }
}