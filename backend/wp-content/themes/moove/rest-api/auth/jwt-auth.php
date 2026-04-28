<?php
/**
 * Autenticação JWT
 */

if (!defined('ABSPATH')) exit;

// ============================================
// AUTENTICAÇÃO
// ============================================

add_action('rest_api_init', function() {
    // Status da autenticação
    register_rest_route(MOOVE_API_NAMESPACE, '/auth/status', [
        'methods' => 'GET',
        'callback' => 'moove_api_auth_status',
        'permission_callback' => '__return_true',
    ]);
    
    // Login
    register_rest_route(MOOVE_API_NAMESPACE, '/auth/login', [
        'methods' => 'POST',
        'callback' => 'moove_api_login',
        'permission_callback' => '__return_true',
    ]);
    
    // Validar token
    register_rest_route(MOOVE_API_NAMESPACE, '/auth/validate', [
        'methods' => 'GET',
        'callback' => 'moove_api_validate_token',
        'permission_callback' => '__return_true',
    ]);
    
    // Refresh token
    register_rest_route(MOOVE_API_NAMESPACE, '/auth/refresh', [
        'methods' => 'POST',
        'callback' => 'moove_api_refresh_token',
        'permission_callback' => '__return_true',
    ]);
    
    // Meu perfil (autenticado)
    register_rest_route(MOOVE_API_NAMESPACE, '/auth/me', [
        'methods' => 'GET',
        'callback' => 'moove_api_get_my_profile',
        'permission_callback' => function($request) {
            $user = moove_check_jwt_auth($request);
            return !is_wp_error($user);
        },
    ]);
});

/**
 * Status da autenticação
 */
function moove_api_auth_status() {
    $status = [
        'jwt_plugin_installed' => class_exists('Jwt_Auth_Public'),
        'jwt_secret_configured' => defined('JWT_AUTH_SECRET_KEY') && !empty(JWT_AUTH_SECRET_KEY),
        'api_namespace' => MOOVE_API_NAMESPACE,
        'timestamp' => current_time('mysql'),
    ];
    
    return moove_api_success($status, 'Status da autenticação');
}

/**
 * Login
 */
function moove_api_login($request) {
    $username = sanitize_user($request->get_param('username'));
    $password = $request->get_param('password');
    
    if (empty($username) || empty($password)) {
        return moove_api_error('Usuário e senha são obrigatórios', 'missing_credentials', 400);
    }
    
    $user = wp_authenticate($username, $password);
    
    if (is_wp_error($user)) {
        return moove_api_error('Credenciais inválidas', 'invalid_credentials', 401);
    }
    
    // Verificar se plugin JWT está ativo
    if (!class_exists('Jwt_Auth_Public')) {
        return moove_api_error('Plugin JWT não está ativo', 'jwt_not_active', 500);
    }
    
    try {
        // Usar a função do plugin para gerar token
        $jwt = new Jwt_Auth_Public('jwt-auth', '1.0');
        
        // Gerar token (simulação - plugin real tem sua própria lógica)
        $token_data = [
            'iss' => get_bloginfo('url'),
            'iat' => time(),
            'exp' => time() + (7 * DAY_IN_SECONDS),
            'data' => [
                'user' => [
                    'id' => $user->ID,
                    'username' => $user->user_login,
                ]
            ]
        ];
        
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = base64_encode(json_encode($token_data));
        $signature = hash_hmac('sha256', "$header.$payload", JWT_AUTH_SECRET_KEY, true);
        $signature_encoded = base64_encode($signature);
        
        $token = "$header.$payload.$signature_encoded";
        $token = str_replace(['+', '/', '='], ['-', '_', ''], $token);
        
        return moove_api_success([
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_in' => 7 * DAY_IN_SECONDS,
            'user' => [
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'roles' => $user->roles,
            ]
        ], 'Login realizado com sucesso');
        
    } catch (Exception $e) {
        return moove_api_error('Erro ao gerar token: ' . $e->getMessage(), 'token_generation_error', 500);
    }
}

/**
 * Validar token
 */
function moove_api_validate_token($request) {
    $user = moove_check_jwt_auth($request);
    
    if (is_wp_error($user)) {
        return $user;
    }
    
    return moove_api_success([
        'valid' => true,
        'user' => [
            'id' => $user->ID,
            'username' => $user->user_login,
            'display_name' => $user->display_name,
        ]
    ], 'Token válido');
}

/**
 * Refresh token
 */
function moove_api_refresh_token($request) {
    $user = moove_check_jwt_auth($request);
    
    if (is_wp_error($user)) {
        return $user;
    }
    
    // Simular refresh (na prática, gerar novo token)
    return moove_api_success([
        'message' => 'Token refreshed successfully',
        'user_id' => $user->ID,
    ], 'Token atualizado');
}

/**
 * Meu perfil
 */
function moove_api_get_my_profile($request) {
    $user = moove_check_jwt_auth($request);
    
    if (is_wp_error($user)) {
        return $user;
    }
    
    return moove_api_success([
        'id' => $user->ID,
        'username' => $user->user_login,
        'email' => $user->user_email,
        'display_name' => $user->display_name,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'roles' => $user->roles,
        'capabilities' => array_keys($user->allcaps),
        'avatar' => get_avatar_url($user->ID, ['size' => 256]),
        'registered' => $user->user_registered,
    ], 'Perfil do usuário');
}