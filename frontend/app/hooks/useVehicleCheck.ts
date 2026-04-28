import { useCallback, useState } from 'react';
import api from '../lib/api';

export interface PlateCheckSuccess {
  success: true;
  plate: string;
}

export interface PlateCheckError {
  success: false;
  message: string;
}

export type PlateCheckResponse = PlateCheckSuccess | PlateCheckError;

export interface UseVehicleCheckReturn {
  checkPlate: (plate: string) => Promise<PlateCheckResponse>;
  loading: boolean;
  error: string | null;
  result: PlateCheckResponse | null;
  reset: () => void;
}

export const useVehicleCheck = (): UseVehicleCheckReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlateCheckResponse | null>(null);

  const checkPlate = useCallback(async (plate: string): Promise<PlateCheckResponse> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validação básica do formato da placa
      const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // Verifica formato básico
      const isValidFormat = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(cleanPlate) || 
                           /^[A-Z]{3}[0-9]{4}$/.test(cleanPlate);
      
      if (cleanPlate.length !== 7 || !isValidFormat) {
        const errorResponse: PlateCheckError = {
          success: false,
          message: 'Formato de placa inválido. Use AAA1A11 (Mercosul) ou AAA1111 (antigo)'
        };
        setResult(errorResponse);
        setError(errorResponse.message);
        return errorResponse;
      }

      // TODO: Implementar chamada real à API WordPress quando as credenciais estiverem prontas
      // const response = await fetch('http://seu-wp/wp-json/tv1-vehicle/v1/verify-plate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plate: cleanPlate })
      // });
      // 
      // const data = await response.json();
      // setResult(data);
      // return data;

      // Por enquanto, retorna estrutura vazia - será substituído pela API real
      const placeholderResponse: PlateCheckResponse = {
        success: false,
        message: 'API não configurada. Aguarde a configuração das credenciais da CheckTudo.'
      };
      
      setResult(placeholderResponse);
      setError(placeholderResponse.message);
      return placeholderResponse;

    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado na verificação';
      const errorResponse: PlateCheckError = {
        success: false,
        message: errorMessage
      };
      
      setResult(errorResponse);
      setError(errorMessage);
      return errorResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return { checkPlate, loading, error, result, reset };
};