<?php
/**
 * Store Finder REST API Endpoint
 *
 * GET /moove/v1/stores
 *
 * Searches for stores near a given location using Salesforce SOQL with DISTANCE()
 *
 * Query Parameters:
 * - lat (required): Latitude coordinate
 * - lng (required): Longitude coordinate
 * - radius (optional): Search radius in km (default: 30)
 * - vehicle_type (optional): Filter by vehicle segment
 */

if (!defined('ABSPATH')) {
    exit;
}

// Note: Salesforce functions (moove_sf_*) are loaded from salesforce-proxy.php
// which is auto-loaded by functions.php

/**
 * Register the stores endpoint
 */
add_action('rest_api_init', function () {
    register_rest_route('moove/v1', '/stores', [
        'methods' => 'GET',
        'callback' => 'moove_get_stores',
        'permission_callback' => '__return_true',
        'args' => [
            'lat' => [
                'required' => true,
                'type' => 'number',
                'description' => 'Latitude coordinate',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param >= -90 && $param <= 90;
                }
            ],
            'lng' => [
                'required' => true,
                'type' => 'number',
                'description' => 'Longitude coordinate',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param >= -180 && $param <= 180;
                }
            ],
            'radius' => [
                'required' => false,
                'type' => 'integer',
                'default' => 30,
                'description' => 'Search radius in kilometers',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0 && $param <= 100;
                }
            ],
            'vehicle_type' => [
                'required' => false,
                'type' => 'string',
                'description' => 'Vehicle type filter (carros, motos, caminhoes, agricola, industrial)',
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'cep' => [
                'required' => false,
                'type' => 'string',
                'description' => 'CEP for fallback postal-code search when geo returns no results',
                'sanitize_callback' => function($param) {
                    return preg_replace('/\D/', '', $param);
                }
            ]
        ]
    ]);
});

/**
 * Handler for GET /moove/v1/stores
 */
function moove_get_stores(WP_REST_Request $request) {
    $lat = floatval($request->get_param('lat'));
    $lng = floatval($request->get_param('lng'));
    $radius = intval($request->get_param('radius') ?: 30);
    $vehicle_type = $request->get_param('vehicle_type');
    $cep = $request->get_param('cep');

    // Check cache first
    $cache_key = 'moove_stores_' . md5("{$lat}_{$lng}_{$radius}_{$vehicle_type}_{$cep}");
    $cached = get_transient($cache_key);

    if ($cached !== false) {
        return moove_api_success($cached, 'Stores retrieved from cache', ['cache' => 'HIT']);
    }

    // Get Salesforce credentials first
    $credentials = moove_sf_get_credentials();
    if (is_wp_error($credentials)) {
        return moove_api_error('Salesforce credentials not configured', 'sf_config_error', 500);
    }

    // Get Salesforce access token
    $token = moove_sf_request_token($credentials);
    if (is_wp_error($token)) {
        return moove_api_error('Failed to authenticate with Salesforce', 'sf_auth_error', 500);
    }

    // Get instance URL from transient (saved during token request)
    $instance_url = get_transient('moove_sf_instance_url');
    if (!$instance_url) {
        return moove_api_error('Salesforce instance URL not found', 'sf_config_error', 500);
    }

    // 1) Primary: geolocation-based DISTANCE() query
    $soql = moove_build_stores_query($lat, $lng, $radius, $vehicle_type);
    $result = moove_execute_stores_query($instance_url, $token, $soql);

    if (is_wp_error($result)) {
        return moove_api_error(
            $result->get_error_message(),
            $result->get_error_code(),
            500
        );
    }

    $stores = moove_format_stores_response($result, $lat, $lng);

    // 2) Fallback: CEP prefix search when geo returns no results
    if (empty($stores) && !empty($cep) && strlen($cep) >= 5) {
        $cep_soql = moove_build_stores_cep_query($cep, $vehicle_type);
        $cep_result = moove_execute_stores_query($instance_url, $token, $cep_soql);

        if (!is_wp_error($cep_result)) {
            $stores = moove_format_stores_response($cep_result, $lat, $lng);
        }
    }

    $response_data = [
        'stores' => $stores,
        'total' => count($stores),
        'center' => [
            'lat' => $lat,
            'lng' => $lng
        ],
        'radius' => $radius
    ];

    // Cache for 5 minutes
    set_transient($cache_key, $response_data, 5 * MINUTE_IN_SECONDS);

    return moove_api_success($response_data, 'Stores retrieved successfully', ['cache' => 'MISS']);
}

/**
 * Shared list of Account fields used in all store queries.
 */
function moove_get_store_fields() {
    return [
        'Id',
        'Name',
        'FantasyName__c',
        'BillingStreet__c',
        'BillingAddressNumber__c',
        'BillingAddressContinued__c',
        'BillingCity__c',
        'BillingState',
        'BillingPostalCode',
        'Phone',
        'Segment__c',
        'Subsegment__c',
        'CustomerGeolocation__Latitude__s',
        'CustomerGeolocation__Longitude__s'
    ];
}

/**
 * Shared vehicle type segment mapping and WHERE clause builder.
 */
function moove_get_vehicle_type_clause($vehicle_type) {
    if (empty($vehicle_type)) {
        return null;
    }

    $segment_map = [
        'carros' => 'Automotivo',
        'motos' => 'Motos',
        'caminhoes' => 'Caminhões',
        'agricola' => 'Agrícola',
        'industrial' => 'Industrial'
    ];

    if (isset($segment_map[$vehicle_type])) {
        return "Segment__c = '{$segment_map[$vehicle_type]}'";
    }

    return null;
}

/**
 * Primary query: geolocation DISTANCE() search.
 */
function moove_build_stores_query($lat, $lng, $radius, $vehicle_type = null) {
    $fields = moove_get_store_fields();

    $where_clauses = [
        "DISTANCE(CustomerGeolocation__c, GEOLOCATION({$lat}, {$lng}), 'km') < {$radius}",
        "CustomerGeolocation__Latitude__s != null",
        "CustomerGeolocation__Longitude__s != null",
        "(IsBlocked__c = false OR IsBlocked__c = null)"
    ];

    $vehicle_clause = moove_get_vehicle_type_clause($vehicle_type);
    if ($vehicle_clause) {
        $where_clauses[] = $vehicle_clause;
    }

    return sprintf(
        "SELECT %s FROM Account WHERE %s ORDER BY DISTANCE(CustomerGeolocation__c, GEOLOCATION(%s, %s), 'km') ASC LIMIT 200",
        implode(', ', $fields),
        implode(' AND ', $where_clauses),
        $lat,
        $lng
    );
}

/**
 * Fallback query: search by BillingPostalCode prefix.
 * Tries 5-digit prefix first (neighborhood), then 3-digit (city region).
 */
function moove_build_stores_cep_query($cep, $vehicle_type = null) {
    $fields = moove_get_store_fields();

    $prefix5 = substr($cep, 0, 5);

    $where_clauses = [
        "BillingPostalCode LIKE '{$prefix5}%'",
        "(IsBlocked__c = false OR IsBlocked__c = null)"
    ];

    $vehicle_clause = moove_get_vehicle_type_clause($vehicle_type);
    if ($vehicle_clause) {
        $where_clauses[] = $vehicle_clause;
    }

    return sprintf(
        "SELECT %s FROM Account WHERE %s ORDER BY Name ASC LIMIT 200",
        implode(', ', $fields),
        implode(' AND ', $where_clauses)
    );
}

/**
 * Execute SOQL query against Salesforce
 */
function moove_execute_stores_query($instance_url, $token, $soql) {
    $query_url = $instance_url . '/services/data/v64.0/query?q=' . urlencode($soql);

    $response = wp_remote_get($query_url, [
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json'
        ],
        'timeout' => 30
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('sf_request_error', $response->get_error_message());
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($status_code !== 200) {
        $error_message = isset($body[0]['message']) ? $body[0]['message'] : 'Unknown Salesforce error';
        return new WP_Error('sf_query_error', $error_message);
    }

    return $body;
}

/**
 * Format Salesforce response into clean store objects
 */
function moove_format_stores_response($sf_response, $center_lat = null, $center_lng = null) {
    $stores = [];

    if (!isset($sf_response['records']) || !is_array($sf_response['records'])) {
        return $stores;
    }

    foreach ($sf_response['records'] as $record) {
        $has_geo = !empty($record['CustomerGeolocation__Latitude__s']) && !empty($record['CustomerGeolocation__Longitude__s']);

        $store_lat = $has_geo ? floatval($record['CustomerGeolocation__Latitude__s']) : null;
        $store_lng = $has_geo ? floatval($record['CustomerGeolocation__Longitude__s']) : null;

        // Calculate distance if both center and store coordinates are available
        $distance = null;
        if ($has_geo && $center_lat !== null && $center_lng !== null) {
            $distance = moove_calculate_distance($center_lat, $center_lng, $store_lat, $store_lng);
        }

        // Build full address
        $address_parts = array_filter([
            $record['BillingStreet__c'] ?? '',
            $record['BillingAddressNumber__c'] ?? '',
            $record['BillingAddressContinued__c'] ?? ''
        ]);

        $stores[] = [
            'id' => $record['Id'] ?? '',
            'name' => $record['Name'] ?? '',
            'fantasyName' => $record['FantasyName__c'] ?? null,
            'address' => implode(', ', $address_parts),
            'city' => $record['BillingCity__c'] ?? '',
            'state' => $record['BillingState'] ?? '',
            'cep' => $record['BillingPostalCode'] ?? '',
            'phone' => $record['Phone'] ?? null,
            'segment' => $record['Segment__c'] ?? null,
            'subsegment' => $record['Subsegment__c'] ?? null,
            'lat' => $store_lat,
            'lng' => $store_lng,
            'distance_km' => $distance
        ];
    }

    return $stores;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function moove_calculate_distance($lat1, $lng1, $lat2, $lng2) {
    $earth_radius = 6371; // km

    $lat1_rad = deg2rad($lat1);
    $lat2_rad = deg2rad($lat2);
    $delta_lat = deg2rad($lat2 - $lat1);
    $delta_lng = deg2rad($lng2 - $lng1);

    $a = sin($delta_lat / 2) * sin($delta_lat / 2) +
         cos($lat1_rad) * cos($lat2_rad) *
         sin($delta_lng / 2) * sin($delta_lng / 2);

    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    return round($earth_radius * $c, 1);
}
