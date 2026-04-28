import { XLAB_CREDENTIALS } from '@/app/lib/constants/server-credentials';
import { NextResponse } from 'next/server';

const XLAB_BASE_URL = 'https://oleo.xlab.app.br/api';
const TOKEN_TTL_MS = 55 * 60 * 1000;

let cachedXlabToken: string | null = null;
let cachedXlabTokenExpiresAt = 0;

function clearTokenCache() {
  cachedXlabToken = null;
  cachedXlabTokenExpiresAt = 0;
}

async function loginAndCacheToken(): Promise<string> {
  const authBody = {
    email: XLAB_CREDENTIALS.EMAIL,
    password: XLAB_CREDENTIALS.PASSWORD,
  };

  const authRes = await fetch(`${XLAB_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authBody),
    cache: 'no-store',
  });

  if (!authRes.ok) {
    throw new Error('Falha na autenticação do XLAB');
  }

  const authData = await authRes.json();
  const token = authData?.data?.token || authData?.token;

  if (!token) {
    throw new Error('Token do XLAB não retornado');
  }

  cachedXlabToken = token;
  cachedXlabTokenExpiresAt = Date.now() + TOKEN_TTL_MS;
  return token;
}

async function getXlabToken(): Promise<string> {
  if (cachedXlabToken && Date.now() < cachedXlabTokenExpiresAt) {
    return cachedXlabToken;
  }

  return loginAndCacheToken();
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { path, ticket: clientTicket, method = 'POST', body: requestBodyPayload = {} } = requestBody;

    // Validate credentials are available
    if (!XLAB_CREDENTIALS.EMAIL || !XLAB_CREDENTIALS.PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Credenciais do XLAB não configuradas' },
        { status: 500 }
      );
    }

    // Compatibilidade: endpoint de login explícito retorna token atual
    if (path === "/auth/login") {
      const token = await getXlabToken();
      return NextResponse.json({ success: true, token }, { status: 200 });
    }

    const token = await getXlabToken();
    const url = `${XLAB_BASE_URL}${path}`;
    
    // Detecta o método correto baseado no path
    let httpMethod = method.toUpperCase();
    if (!method || method === 'POST') {
      // Endpoints que precisam GET
      if (path.startsWith('/plate/') || path.startsWith('/models')) {
        httpMethod = 'GET';
      } else {
        httpMethod = 'POST';
      }
    }

    const buildFetchOptions = (authToken: string): RequestInit => ({
      method: httpMethod,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const fetchOptions = buildFetchOptions(token);

    // Add Ticket header if provided
    if (clientTicket) {
      (fetchOptions.headers as any)['Ticket'] = clientTicket;
    }

    if ((httpMethod === 'POST' || httpMethod === 'PUT') && requestBodyPayload) {
      fetchOptions.body = JSON.stringify(requestBodyPayload);
    }

    let res = await fetch(url, fetchOptions);

    // Retry uma vez em caso de token expirado
    if (res.status === 401) {
      clearTokenCache();
      const refreshedToken = await getXlabToken();
      const retryOptions = buildFetchOptions(refreshedToken);

      if (clientTicket) {
        (retryOptions.headers as any)['Ticket'] = clientTicket;
      }

      if ((httpMethod === 'POST' || httpMethod === 'PUT') && requestBodyPayload) {
        retryOptions.body = JSON.stringify(requestBodyPayload);
      }

      res = await fetch(url, retryOptions);
    }

    // Tenta capturar o texto primeiro para evitar erro de JSON vazio
    const resText = await res.text();
    let data;
    try {
      data = JSON.parse(resText);
    } catch (e) {
      data = { message: "Resposta não é JSON", raw: resText };
    }

    return NextResponse.json(data, { status: res.status });

  } catch {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro no servidor interno (Proxy)'
    }, { status: 500 });
  }
}