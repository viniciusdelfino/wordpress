<?php
class moove_Vehicle_Data_Filter
{
    public static function filter_response($api_response)
    {
       // 1. Log para o log de erros do servidor (wp-content/debug.log)
        error_log('--- CHECKTUDO RAW RESPONSE ---');
        error_log(print_r($api_response, true));

        // 2. Tenta capturar os dados em QUALQUER lugar do JSON
        $brand = $api_response['body']['extraInfos']['marca'] ?? 
                $api_response['extraInfos']['MARCA'] ?? 
                $api_response['body']['marca'] ?? '';

        $model = $api_response['body']['extraInfos']['modelo'] ?? 
                $api_response['extraInfos']['MODELO'] ?? 
                $api_response['body']['modelo'] ?? '';

        // Se ainda estiver vazio, vamos devolver o JSON inteiro no debug_raw para o seu Console F12
        if (empty($brand)) {
            return [
                'success' => false,
                'message' => 'Dados não mapeados. Verifique o debug_raw.',
                'debug_raw' => $api_response // <-- ISSO VAI MOSTRAR TUDO NO SEU NAVEGADOR
            ];
        }

        return [
            'success' => true,
            'plate'   => $api_response['body']['headerInfos']['keys']['placa'] ?? '',
            'brand'   => $brand,
            'model'   => $model,
        ];
    }
}
