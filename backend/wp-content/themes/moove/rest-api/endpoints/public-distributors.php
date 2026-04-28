<?php
/**
 * Distributor Finder REST API Endpoint
 *
 * GET /moove/v1/distributors
 *
 * Searches for distributors filtered by Brazilian state (UF)
 *
 * Query Parameters:
 * - state (required): Brazilian state abbreviation (e.g., SP, RJ, MG)
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('moove/v1', '/distributors', [
        'methods' => 'GET',
        'callback' => 'moove_get_distributors',
        'permission_callback' => '__return_true',
        'args' => [
            'state' => [
                'required' => true,
                'type' => 'string',
                'description' => 'Brazilian state abbreviation (UF)',
                'sanitize_callback' => function($param) {
                    return strtoupper(sanitize_text_field($param));
                },
                'validate_callback' => function($param) {
                    $valid_states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
                    return in_array(strtoupper($param), $valid_states);
                }
            ]
        ]
    ]);
});

/**
 * Handler for GET /moove/v1/distributors
 */
function moove_get_distributors(WP_REST_Request $request) {
    $state = $request->get_param('state');

    // Check cache first
    $cache_key = 'moove_distributors_' . $state;
    $cached = get_transient($cache_key);

    if ($cached !== false) {
        return moove_api_success($cached, 'Distributors retrieved from cache', ['cache' => 'HIT']);
    }

    $credentials = moove_sf_get_credentials();
    if (is_wp_error($credentials)) {
        return moove_api_error('Salesforce credentials not configured', 'sf_config_error', 500);
    }

    $token = moove_sf_request_token($credentials);
    if (is_wp_error($token)) {
        return moove_api_error('Failed to authenticate with Salesforce', 'sf_auth_error', 500);
    }

    $instance_url = get_transient('moove_sf_instance_url');
    if (!$instance_url) {
        return moove_api_error('Salesforce instance URL not found', 'sf_config_error', 500);
    }

    $soql = moove_build_distributors_query($state);
    $result = moove_execute_stores_query($instance_url, $token, $soql);

    if (is_wp_error($result)) {
        return moove_api_error(
            $result->get_error_message(),
            $result->get_error_code(),
            500
        );
    }

    $distributors = moove_format_stores_response($result);

    $response_data = [
        'distributors' => $distributors,
        'total' => count($distributors),
        'state' => $state
    ];

    // Cache for 10 minutes
    set_transient($cache_key, $response_data, 10 * MINUTE_IN_SECONDS);

    return moove_api_success($response_data, 'Distributors retrieved successfully', ['cache' => 'MISS']);
}

/**
 * Build SOQL query to find distributors by state
 */
function moove_build_distributors_query($state) {
    $fields = moove_get_store_fields();

    $where_clauses = [
        "BillingState = '{$state}'",
        "(IsBlocked__c = false OR IsBlocked__c = null)"
    ];

    return sprintf(
        "SELECT %s FROM Account WHERE %s ORDER BY Name ASC LIMIT 200",
        implode(', ', $fields),
        implode(' AND ', $where_clauses)
    );
}
