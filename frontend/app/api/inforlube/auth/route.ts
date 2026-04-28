import { INFORLUBE_CREDENTIALS } from '@/app/lib/constants/server-credentials';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!INFORLUBE_CREDENTIALS.HASH) {
      return NextResponse.json(
        { success: false, message: 'Credenciais do Inforlube não configuradas' },
        { status: 500 },
      );
    }

    const response = await fetch(`${INFORLUBE_CREDENTIALS.API_URL}/Auth`, {
      method: 'GET',
      headers: {
        Credentials: INFORLUBE_CREDENTIALS.HASH,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Falha na autenticação com o Inforlube' },
        { status: 502 },
      );
    }

    const data = await response.json();
    const jwt = data?.Jwt || data?.jwt || data?.token;

    if (!jwt) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticação não retornado' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, jwt }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erro interno no proxy Inforlube' },
      { status: 500 },
    );
  }
}
