<?php
class moove_Vehicle_API_Handler
{
    private $user_id;
    private $auth_token;

    public function __construct()
    {
        $this->user_id = get_option('moove_vehicle_api_url', '');
        $this->auth_token = get_option('moove_vehicle_api_token', '');
    }

    public function consult_vehicle($plate)
    {
       $clean_plate = $this->sanitize_plate($plate);
    
    $url = 'https://api.checktudo.com.br/api/v1/vehicle'; 
    
    $response = wp_remote_post($url, [
        'headers' => [
            'Authorization' => 'Token ' . $this->auth_token, 
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json'
        ],
        'body' => json_encode([
            'user_id'   => $this->user_id, 
            'querycode' => 71,
            'keys'      => ['placa' => $clean_plate]
        ]),
        'timeout' => 20
    ]);
    
    if (is_wp_error($response)) return $response;
    
    $data = json_decode(wp_remote_retrieve_body($response), true);

    // DEBUG: Se ainda der 404, tentaremos a URL antiga (v1 pura)
    if (isset($data['status']['cod']) && $data['status']['cod'] == 404) {
        $url_fallback = 'https://api.checktudo.com.br/v1/vehicle'; // Sem o /api/
        $response = wp_remote_post($url_fallback, [ /* mesmos argumentos */ ]);
        return json_decode(wp_remote_retrieve_body($response), true);
    }
    
    return $data;
    }

    private function sanitize_plate($plate)
    {
        return strtoupper(preg_replace('/[^A-Z0-9]/', '', $plate));
    }
}