import { INFORLUBE_CONFIG } from './config';

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface RecommendationTicket {
  ticket: string;
  expiresAt: Date;
}

class InforlubeAuthService {
  private jwtToken: string | null = null;
  private ticket: RecommendationTicket | null = null;
  
  // Método PRINCIPAL: Autenticação via reCAPTCHA (igual ao site atual)
  async authenticateWithRecaptcha(recaptchaToken: string): Promise<AuthResponse> {
    const response = await fetch(`${INFORLUBE_CONFIG.BASE_URL}/Auth/Google/ReCaptcha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: recaptchaToken,
        siteKey: INFORLUBE_CONFIG.RECAPTCHA_SITE_KEY
      })
    });
    
    if (!response.ok) throw new Error('Falha na autenticação');
    
    const data = await response.json();
    this.jwtToken = data.token;
    
    return {
      token: data.token,
      expiresIn: 15 * 60 // 15 minutos em segundos
    };
  }
  
  //! ⚠️ Método ALTERNATIVO: Para desenvolvimento/testes (usando hash)
  async authenticateWithHash(): Promise<AuthResponse> {
    // AVISO: Este método NÃO deve ser usado em produção frontend!
    // Apenas para testes com a hash fornecida
    const response = await fetch(`${INFORLUBE_CONFIG.BASE_URL}/Auth`, {
      method: 'GET',
      headers: { 'credentials': INFORLUBE_CONFIG.HASH! }
    });
    
    if (!response.ok) throw new Error('Falha na autenticação');
    
    const data = await response.json();
    this.jwtToken = data.token;
    
    return {
      token: data.token,
      expiresIn: 15 * 60
    };
  }
  
  // Renovar sessão (usando JWT existente)
  async renewSession(): Promise<AuthResponse> {
    if (!this.jwtToken) throw new Error('Nenhum token disponível');
    
    const response = await fetch(`${INFORLUBE_CONFIG.BASE_URL}/Auth/ReLogIn`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.jwtToken}` }
    });
    
    if (!response.ok) throw new Error('Falha ao renovar sessão');
    
    const data = await response.json();
    this.jwtToken = data.token;
    
    return {
      token: data.token,
      expiresIn: 15 * 60
    };
  }
  
  // Gerenciar ticket de recomendação
  setRecommendationTicket(ticket: string) {
    this.ticket = {
      ticket,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
    };
  }
  
  getHeaders(withTicket: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }
    
    if (withTicket && this.ticket) {
      headers['Ticket'] = this.ticket.ticket;
    }
    
    return headers;
  }
}

export const inforlubeAuth = new InforlubeAuthService();