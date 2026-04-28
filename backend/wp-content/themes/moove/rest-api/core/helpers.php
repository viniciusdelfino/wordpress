<?php
/**
 * Core Helpers - Funções auxiliares
 */

if (!defined('ABSPATH')) exit;

// ============================================
// CONSTANTES
// ============================================

if (!defined('MOOVE_API_NAMESPACE')) {
    define('MOOVE_API_NAMESPACE', 'moove/v1');
}

if (!defined('MOOVE_API_DEBUG')) {
    define('MOOVE_API_DEBUG', true);
}

// ============================================
// FUNÇÕES DE RESPOSTA
// ============================================

/**
 * Formatar resposta de sucesso
 */
function moove_api_success($data = [], $message = '') {
    $response = [
        'success' => true,
        'data' => $data,
        'meta' => [
            'api_version' => '1.0',
        ]
    ];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    return $response;
}

/**
 * Formatar resposta de erro
 */
function moove_api_error($message, $code = 'error', $status = 400, $details = []) {
    return new WP_Error(
        $code,
        $message,
        array_merge(['status' => $status], $details)
    );
}

/**
 * Formatar imagem para resposta
 */
function moove_format_image($attachment_id, $size = 'full', $return_sizes = true) {
    if (!$attachment_id) return null;
    
    $image = wp_get_attachment_image_src($attachment_id, $size);
    if (!$image) return null;
    
    $data = [
        'id' => $attachment_id,
        'url' => $image[0],
        'width' => $image[1],
        'height' => $image[2],
        'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
        'caption' => wp_get_attachment_caption($attachment_id),
        'mime_type' => get_post_mime_type($attachment_id),
    ];
    
    if ($return_sizes) {
        $data['sizes'] = moove_get_image_sizes($attachment_id);
    }

    return $data;
}

/**
 * Obter todos os tamanhos de uma imagem
 */
function moove_get_image_sizes($attachment_id) {
    $sizes = [];
    $image_sizes = get_intermediate_image_sizes();
    
    foreach ($image_sizes as $size) {
        $image = wp_get_attachment_image_src($attachment_id, $size);
        if ($image) {
            $sizes[$size] = [
                'url' => $image[0],
                'width' => $image[1],
                'height' => $image[2],
            ];
        }
    }
    
    return $sizes;
}

/**
 * Verificar autenticação JWT
 * @param WP_REST_Request $request
 */
function moove_check_jwt_auth($request) {
    $auth_header = $request->get_header('Authorization');
    
    if (!$auth_header) {
        return moove_api_error(
            'Token de autenticação não fornecido',
            'no_auth_token',
            401
        );
    }
    
    $token = '';

    // Extrair token
    if (preg_match('/Bearer\s+(.+)$/i', $auth_header, $matches)) {
        $token = trim($matches[1]);
    } else {
        return moove_api_error(
            'Formato do token inválido',
            'invalid_token_format', 
            401
        );
    }
    
    // Usar plugin JWT se disponível
    if (class_exists('Jwt_Auth_Public')) {
        try {
            $jwt = new Jwt_Auth_Public('jwt-auth', '1.0');
            if (method_exists($jwt, 'validate_token')) {
                $user_id = $jwt->validate_token($token, $request);
                if ($user_id) {
                    return get_user_by('id', $user_id);
                }
            }
        } catch (Exception $e) {
            error_log('Moove JWT Error: ' . $e->getMessage());
        }
    }
    
    return moove_api_error('Token inválido ou expirado', 'invalid_token', 401);
}