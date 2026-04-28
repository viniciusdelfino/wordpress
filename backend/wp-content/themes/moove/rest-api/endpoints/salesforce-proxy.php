<?php
/**
 * Endpoint Proxy: Salesforce -> Next.js (Headless Strategy)
 * 
 * Objetivo: Atuar como middleware seguro. O Next.js consulta este endpoint,
 * que autentica no Salesforce, busca os dados e retorna JSON.
 * Não salva nada no banco de dados do WordPress (exceto cache de token).
 */

if (! defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    // 1. Endpoint Principal: Busca Produtos (Proxy)
    // URL: GET /wp-json/moove/v1/salesforce/proxy/products
    register_rest_route('moove/v1', '/salesforce/proxy/products', array(
        'methods'             => 'GET',
        'callback'            => 'moove_sf_proxy_products',
        'permission_callback' => '__return_true',
    ));

    // 2. Endpoint de Checagem (ISR): Verifica última modificação
    // URL: GET /wp-json/moove/v1/salesforce/proxy/check-update?name=NomeDoProduto
    register_rest_route('moove/v1', '/salesforce/proxy/check-update', array(
        'methods'             => 'GET',
        'callback'            => 'moove_sf_proxy_check_update',
        'permission_callback' => '__return_true',
    ));
});

/**
 * 1. Proxy de Produtos
 */
function moove_sf_proxy_products($request)
{
    try {
        $creds = moove_sf_get_credentials();
        if (is_wp_error($creds)) {
            error_log('[SF Proxy] Erro Credenciais: ' . $creds->get_error_message());
            return $creds;
        }

        $token = moove_sf_request_token($creds);
        if (is_wp_error($token)) {
            error_log('[SF Proxy] Erro Token: ' . $token->get_error_message());
            return $token;
        }

        // Recupera a URL da instância do cache (salva durante o login)
        $instance_url = get_transient('moove_sf_instance_url');
        if (! $instance_url) {
            // Se não tiver URL, força renovação do token
            delete_transient('moove_sf_token');
            $token = moove_sf_request_token($creds);
            $instance_url = get_transient('moove_sf_instance_url');

            if (! $instance_url) {
                error_log('[SF Proxy] Erro Crítico: Instance URL não encontrada após login.');
                return new WP_Error('auth_error', 'Instance URL não encontrada. Verifique credenciais.', array('status' => 500));
            }
        }

        // Filtros adicionais (comuns para todas as estratégias de query)
        $filter_suffix = "";

        // 1. Filtro por Categoria
        $category_slug = $request->get_param('category');
        if ($category_slug) {
            $map = moove_sf_get_category_map();
            // Encontra todas as categorias SF que mapeiam para este slug WP (Suporte a N:1)
            // Como o valor agora é um array de slugs, precisamos iterar para encontrar
            $sf_categories = array();
            foreach ($map as $sf_term => $wp_slugs) {
                $wp_slugs = (array) $wp_slugs; // Garante array
                if (in_array($category_slug, $wp_slugs)) {
                    $sf_categories[] = $sf_term;
                }
            }

            if (! empty($sf_categories)) {
                // Sanitiza e monta cláusula IN para suportar múltiplos termos
                $sf_cats_escaped = array_map(function ($cat) {
                    return "'" . moove_sanitize_soql($cat) . "'";
                }, $sf_categories);
                $sf_cats_str = implode(',', $sf_cats_escaped);
                $filter_suffix .= " AND B2BProductCategory__c IN ($sf_cats_str)";
            } else {
                // Fallback: Tenta buscar pelo slug diretamente (sem hardcoding)
                $clean_slug = moove_sanitize_soql($category_slug);
                $filter_suffix .= " AND B2BProductCategory__c LIKE '%$clean_slug%'";
            }
        }

        // 2. Filtro por Busca (Search)
        $search_term = $request->get_param('search');
        if ($search_term) {
            $clean_term = moove_sanitize_soql($search_term);
            $filter_suffix .= " AND (Name LIKE '%$clean_term%' OR B2BProductName__c LIKE '%$clean_term%')";
        }

        // 3. Filtro por SKU
        $sku = $request->get_param('sku');
        if ($sku) {
            $clean_sku = moove_sanitize_soql($sku);
            $filter_suffix .= " AND (StockKeepingUnit = '$clean_sku' OR ProductCode = '$clean_sku')";
        }

        $select_clause = "SELECT Id, Name, Family, B2BProductName__c, ProductCode, StockKeepingUnit, Description, B2BProductCategory__c, ProductApplication__c, B2BSEODescription__c, SystemModstamp, Size__c, SizeUnit__c, Packing__c, Viscosity__c, IndustryClassifications__c, EnabledProductB2BCommerce__c, LastModifiedDate, DisplayUrl, Benefits__c, Recommendation__c, RelatedProducts__c, B2BSEOKeywords__c, B2BSEOTitle__c, Brand__c, BusinessLine__c, ProductFamily__c, MeetsOrExceeds__c, Approvals__c, GrossWeight__c, WeightUnit__c, API__c FROM Product2";

        $run_query = function ($where_clause) use ($instance_url, $token, $select_clause) {
            $soql = "$select_clause WHERE $where_clause ORDER BY Name ASC LIMIT 200";
            $url = $instance_url . '/services/data/v64.0/query?q=' . urlencode($soql);

            $response = wp_remote_get($url, array(
                'headers' => array('Authorization' => 'Bearer ' . $token)
            ));

            if (is_wp_error($response)) {
                return $response;
            }

            return json_decode(wp_remote_retrieve_body($response), true);
        };

        // Estratégias em ordem: e-commerce habilitado -> ativos -> qualquer registro.
        $where_candidates = array(
            "EnabledProductB2BCommerce__c = true{$filter_suffix}",
            "IsActive = true{$filter_suffix}",
            "Id != null{$filter_suffix}",
        );

        $data = array();
        $debug_attempts = array();
        $used_fallback_index = -1;

        foreach ($where_candidates as $idx => $where_clause) {
            $attempt_data = $run_query($where_clause);

            if (is_wp_error($attempt_data)) {
                return $attempt_data;
            }

            $attempt_count = isset($attempt_data['records']) && is_array($attempt_data['records'])
                ? count($attempt_data['records'])
                : 0;

            $debug_attempts[] = array(
                'where'   => $where_clause,
                'count'   => $attempt_count,
                'has_err' => isset($attempt_data[0]['errorCode']) || isset($attempt_data['errorCode']),
            );

            $data = $attempt_data;
            if ($attempt_count > 0) {
                $used_fallback_index = $idx;
                if ($idx === 2) {
                    error_log('[SF Proxy] AVISO: Fallback máximo ativado (Id != null). Nenhum produto com EnabledProductB2BCommerce__c=true ou IsActive=true. Filtros: ' . $filter_suffix);
                }
                break;
            }
        }

        // Se Salesforce retornou erro (array de erro ou objeto com errorCode), não mascarar como lista vazia.
        if (
            (isset($data[0]['errorCode']) && !empty($data[0]['message'])) ||
            (isset($data['errorCode']) && !empty($data['message']))
        ) {
            $sf_error = isset($data[0]) ? $data[0] : $data;
            $status = isset($sf_error['errorCode']) && $sf_error['errorCode'] === 'INVALID_OPERATION_WITH_EXPIRED_PASSWORD'
                ? 401
                : 502;

            return new WP_Error(
                'salesforce_proxy_error',
                isset($sf_error['message']) ? $sf_error['message'] : 'Erro desconhecido no Salesforce.',
                array(
                    'status' => $status,
                    'salesforce_error' => $sf_error,
                    'attempts' => $debug_attempts,
                )
            );
        }

        // Processamento: Agrupar produtos por Nome Comercial (Variações)
        $grouped_products = array();

        if (isset($data['records'])) {
            foreach ($data['records'] as &$record) {
                // Bug #4: Bloqueia produtos desabilitados no B2B quando no fallback máximo (Id != null)
                if ($used_fallback_index === 2 && empty($record['EnabledProductB2BCommerce__c'])) {
                    continue;
                }

                // Define a chave de agrupamento: Nome Comercial ou Nome padrão
                $raw_name = !empty($record['B2BProductName__c']) ? $record['B2BProductName__c'] : $record['Name'];
                $group_key = moove_sf_clean_name($raw_name);

                // Formatação de Data (Brasileira)
                $date_timestamp = strtotime($record['SystemModstamp']);
                $formatted_date = date('d/m/Y', $date_timestamp);

                if (! isset($grouped_products[$group_key])) {
                    $grouped_products[$group_key] = array(
                        'B2BProductName__c'  => $group_key, 
                        'StockKeepingUnit'   => isset($record['StockKeepingUnit']) ? $record['StockKeepingUnit'] : $record['ProductCode'],
                        'slug'               => sanitize_title($group_key),
                        'last_modified'      => $formatted_date,
                        'LastModifiedDate'   => isset($record['LastModifiedDate']) ? $record['LastModifiedDate'] : '',
                        'EnabledProductB2BCommerce__c' => isset($record['EnabledProductB2BCommerce__c']) ? $record['EnabledProductB2BCommerce__c'] : false,
                        'IndustryClassifications__c' => isset($record['IndustryClassifications__c']) ? $record['IndustryClassifications__c'] : '', 
                        'Description'        => isset($record['Description']) ? $record['Description'] : '',
                        'DisplayUrl'         => isset($record['DisplayUrl']) ? $record['DisplayUrl'] : '',
                        'category_slug'      => moove_sf_map_category($record),
                        'B2BSEODescription__c'    => isset($record['B2BSEODescription__c']) ? $record['B2BSEODescription__c'] : '',
                        'B2BSEOTitle__c'          => isset($record['B2BSEOTitle__c']) ? $record['B2BSEOTitle__c'] : '',
                        'B2BSEOKeywords__c'       => isset($record['B2BSEOKeywords__c']) ? $record['B2BSEOKeywords__c'] : '',
                        'Benefits__c'           => isset($record['Benefits__c']) ? $record['Benefits__c'] : '',
                        'Recommendation__c'     => isset($record['Recommendation__c']) ? $record['Recommendation__c'] : '',
                        'Brand__c'              => isset($record['Brand__c']) ? $record['Brand__c'] : '',
                        'BusinessLine__c'      => isset($record['BusinessLine__c']) ? $record['BusinessLine__c'] : '',
                        'ProductFamily__c'     => isset($record['ProductFamily__c']) ? $record['ProductFamily__c'] : '',
                        'MeetsOrExceeds__c'   => isset($record['MeetsOrExceeds__c']) ? $record['MeetsOrExceeds__c'] : '',
                        'API__c'             => isset($record['API__c']) ? $record['API__c'] : '',
                        'Approvals__c'          => isset($record['Approvals__c']) ? $record['Approvals__c'] : '',
                        'RelatedProducts__c'    => isset($record['RelatedProducts__c']) ? $record['RelatedProducts__c'] : '',
                        'ProductApplication__c' => isset($record['ProductApplication__c']) ? $record['ProductApplication__c'] : '',
                        'Viscosity__c'       => isset($record['Viscosity__c']) ? $record['Viscosity__c'] : '',
                        'Packing__c'         => isset($record['Packing__c']) ? $record['Packing__c'] : '',
                        '_debug_b2b_name'    => isset($record['B2BProductName__c']) ? $record['B2BProductName__c'] : 'VAZIO/NULL',
                        '_debug_sf_name'     => $record['Name'],
                        'variations'         => array(),
                        'related_products'   => array()
                    );
                }

                // Garante que RelatedProducts__c seja capturado se vier em uma variação e não no pai
                if (empty($grouped_products[$group_key]['RelatedProducts__c']) && !empty($record['RelatedProducts__c'])) {
                    $grouped_products[$group_key]['RelatedProducts__c'] = $record['RelatedProducts__c'];
                }

                if (empty($grouped_products[$group_key]['related_products']) && !empty($record['RelatedProducts__c'])) {
                    $related_raw = preg_split('/[;,]/', $record['RelatedProducts__c'], -1, PREG_SPLIT_NO_EMPTY);
                    $grouped_products[$group_key]['related_products'] = array_map('trim', $related_raw);
                }

                $grouped_products[$group_key]['variations'][] = array(
                    'sf_id'       => $record['Id'],
                    'sku'         => isset($record['StockKeepingUnit']) ? $record['StockKeepingUnit'] : $record['ProductCode'],
                    'size'        => isset($record['Size__c']) ? $record['Size__c'] : null,
                    'size_unit'   => isset($record['SizeUnit__c']) ? $record['SizeUnit__c'] : null,
                    'packing'     => isset($record['Packing__c']) ? $record['Packing__c'] : null,
                    'viscosity'   => isset($record['Viscosity__c']) ? $record['Viscosity__c'] : null,
                    'gross_weight'=> isset($record['GrossWeight__c']) ? $record['GrossWeight__c'] : null,
                    'weight_unit' => isset($record['WeightUnit__c']) ? $record['WeightUnit__c'] : null,
                    'full_name'   => moove_sf_clean_name($raw_name)
                );
            }
        }

        $final_list = array_values($grouped_products);

        $response_payload = array(
            'total_grouped' => count($final_list),
            'total_records' => isset($data['totalSize']) ? $data['totalSize'] : 0,
            'products'      => $final_list
        );

        $is_debug_allowed = (defined('SALESFORCE_DEBUG') && SALESFORCE_DEBUG) || is_user_logged_in();
        if ($is_debug_allowed && $request->get_param('debug') === '1') {
            $response_payload['_debug'] = array(
                'attempts' => $debug_attempts,
                'raw_keys' => is_array($data) ? array_keys($data) : array(),
                'raw_error' => isset($data[0]) ? $data[0] : (isset($data['errorCode']) ? $data : null),
            );
        }

        return new WP_REST_Response($response_payload, 200);
    } catch (Exception $e) {
        error_log('[SF Proxy] Exception: ' . $e->getMessage());
        return new WP_Error('server_error', $e->getMessage(), array('status' => 500));
    }
}

/**
 * 2. Checagem de Atualização (Smart Cache)
 */
function moove_sf_proxy_check_update($request)
{
    $creds = moove_sf_get_credentials();
    if (is_wp_error($creds)) return $creds;

    $token = moove_sf_request_token($creds);
    if (is_wp_error($token)) return $token;

    $instance_url = get_transient('moove_sf_instance_url');
    if (! $instance_url) {
        delete_transient('moove_sf_token');
        $token = moove_sf_request_token($creds);
        $instance_url = get_transient('moove_sf_instance_url');
        if (! $instance_url) return new WP_Error('auth_error', 'Instance URL não encontrada.', array('status' => 500));
    }

    $name_filter = $request->get_param('name');

    $where = "IsActive = true";
    if ($name_filter) {
        $where .= " AND Name = '" . moove_sanitize_soql($name_filter) . "'";
    }

    $soql = "SELECT Id, SystemModstamp FROM Product2 WHERE $where ORDER BY SystemModstamp DESC LIMIT 1";

    $url = $instance_url . '/services/data/v64.0/query?q=' . urlencode($soql);

    $response = wp_remote_get($url, array(
        'headers' => array('Authorization' => 'Bearer ' . $token)
    ));

    $data = json_decode(wp_remote_retrieve_body($response), true);

    return new WP_REST_Response(array(
        'check_type' => $name_filter ? 'single_product' : 'global',
        'latest_update' => isset($data['records'][0]) ? $data['records'][0]['SystemModstamp'] : null,
        'record_id' => isset($data['records'][0]) ? $data['records'][0]['Id'] : null
    ), 200);
}

function moove_sf_request_token($creds)
{
    $cached_token = get_transient('moove_sf_token');
    if ($cached_token) return $cached_token;

    $request_token_attempt = function($body) use ($creds) {
        $response = wp_remote_post($creds['auth_url'], array(
            'body' => $body,
        ));

        if (is_wp_error($response)) return $response;

        return array(
            'code' => wp_remote_retrieve_response_code($response),
            'body' => json_decode(wp_remote_retrieve_body($response), true),
        );
    };

    $raw_password = isset($creds['raw_password']) ? (string) $creds['raw_password'] : '';
    $security_token = isset($creds['security_token']) ? (string) $creds['security_token'] : '';
    $username = isset($creds['username']) ? (string) $creds['username'] : '';

    $base_body = array(
        'client_id'     => $creds['client_id'],
        'client_secret' => $creds['client_secret'],
    );

    $attempt_bodies = array();

    // Prioriza client_credentials (mesmo fluxo validado no Insomnia).
    $attempt_bodies[] = array_merge($base_body, array(
        'grant_type' => 'client_credentials',
    ));

    // Fallback: password grant para manter compatibilidade.
    if ($username !== '' && ($raw_password !== '' || $creds['password'] !== '')) {
        $attempt_bodies[] = array_merge($base_body, array(
            'grant_type' => 'password',
            'username'   => $username,
            'password'   => (string) $creds['password'],
        ));

        if ($security_token !== '' && $raw_password !== '') {
            $attempt_bodies[] = array_merge($base_body, array(
                'grant_type' => 'password',
                'username'   => $username,
                'password'   => $raw_password,
            ));
        }
    }

    $result = null;
    $body = array();
    $auth_attempts = array();
    foreach ($attempt_bodies as $attempt_body) {
        $result = $request_token_attempt($attempt_body);
        if (is_wp_error($result)) return $result;

        $body = is_array($result['body']) ? $result['body'] : array();

        $auth_attempts[] = array(
            'grant_type' => isset($attempt_body['grant_type']) ? $attempt_body['grant_type'] : 'unknown',
            'http_code' => isset($result['code']) ? (int) $result['code'] : 0,
            'error' => isset($body['error']) ? $body['error'] : null,
            'error_description' => isset($body['error_description']) ? $body['error_description'] : null,
        );

        if (isset($body['access_token'])) {
            break;
        }
    }

    if (! isset($body['access_token'])) {
        return new WP_Error('auth_error', 'Falha ao obter token', array(
            'response' => $body,
            'attempts' => $auth_attempts,
        ));
    }

    set_transient('moove_sf_token', $body['access_token'], 3600); // Cache 1h

    if (isset($body['instance_url'])) {
        set_transient('moove_sf_instance_url', $body['instance_url'], 3600);
    }

    return $body['access_token'];
}

function moove_sf_map_category($record)
{
    $cat = isset($record['B2BProductCategory__c']) ? mb_strtoupper($record['B2BProductCategory__c']) : '';
    $map = moove_sf_get_category_map();

    $mapped = isset($map[$cat]) ? $map[$cat] : 'outros';
    return is_array($mapped) ? $mapped[0] : $mapped;
}

function moove_sf_get_category_map()
{
   
    $map = array();

    if (function_exists('sf_get_default_category_map')) {
        $map = array_merge($map, sf_get_default_category_map());
    }

  
    $dynamic_map = get_option('salesforce_category_map', array());

    if (is_array($dynamic_map) && ! empty($dynamic_map)) {
        $map = array_merge($map, $dynamic_map);
    }

    $normalized_map = array();
    foreach ($map as $sf_cat => $wp_slug) {
        $normalized_map[mb_strtoupper($sf_cat)] = $wp_slug;
    }

    return $normalized_map;
}

function moove_sf_get_credentials()
{
    // Busca as credenciais salvas no banco de dados (Ambiente de Desenvolvimento)
    $opt = get_option('salesforce_credentials_development');

    if ( ! is_array( $opt ) || empty( $opt['client_id'] ) ) {
        $opt = get_option( 'salesforce_credentials' );
    }

    if (! is_array($opt)) {
        return new WP_Error( 'config_error', 'Credenciais Salesforce não encontradas no banco de dados.', array( 'status' => 500 ) );
    }

    if ( empty($opt['client_id']) ) {
        return new WP_Error( 'config_missing', 'Client ID do Salesforce não configurado.', array( 'status' => 500 ) );
    }

    return array(
        'auth_url'      => defined('SF_AUTH_URL') ? SF_AUTH_URL : 'https://varejo--staging.sandbox.my.salesforce.com/services/oauth2/token',
        'client_id'     => $opt['client_id'],
        'client_secret' => isset($opt['client_secret']) ? $opt['client_secret'] : '',
        'username'      => isset($opt['username']) ? $opt['username'] : '',
        'password'      => (isset($opt['password']) ? $opt['password'] : '') . (isset($opt['security_token']) ? $opt['security_token'] : ''),
        'raw_password'  => isset($opt['password']) ? $opt['password'] : '',
        'security_token'=> isset($opt['security_token']) ? $opt['security_token'] : '',
        'instance_url'  => ''
    );
}

function moove_sanitize_soql($value)
{
    // SOQL escapa aspas simples duplicando-as (''), não com backslash
    $value = str_replace("'", "''", (string) $value);
    // Remove null bytes e backslashes que poderiam escapar da query
    $value = str_replace(array("\0", '\\'), '', $value);
    return $value;
}

/**
 * Limpa nomes de produtos vindos do Salesforce (CSV artifacts)
 */
function moove_sf_clean_name($name)
{
    if (empty($name)) return '';

    $name = html_entity_decode($name, ENT_QUOTES | ENT_HTML5);
    $name = str_replace('""', '"', $name);

    // Remove aspas do início
    if (substr($name, 0, 1) === '"') {
        $name = substr($name, 1);
    }

    // Remove aspas do final se não for polegada (heurística: se anterior não for número)
    $len = strlen($name);
    if ($len > 1 && substr($name, -1) === '"') {
        $prev = substr($name, -2, 1);
        if (! is_numeric($prev)) {
            $name = substr($name, 0, -1);
        }
    }

    return trim($name);
}
