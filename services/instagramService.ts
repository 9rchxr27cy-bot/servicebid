
import axios from 'axios';

// Tipos definidos baseados na Instagram Basic Display API
export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string; // Disponível apenas para vídeos
  permalink: string;
  timestamp: string;
}

interface InstagramTokenResponse {
  access_token: string;
  user_id: number;
  expires_in: number; // Segundos
}

const INSTAGRAM_APP_ID = 'SEU_APP_ID_AQUI'; // Em produção, viria de process.env
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/instagram/callback` : '';
const CACHE_KEY = 'servicebid_insta_cache';
const TOKEN_KEY = 'servicebid_insta_token';

// Dados Mockados para Simulação (Demo Mode)
const MOCK_MEDIA: InstagramMedia[] = [
  {
    id: '179238472',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop',
    caption: 'Instalação elétrica completa em residência moderna. #eletricista #luxembourg',
    permalink: '',
    timestamp: new Date().toISOString()
  },
  {
    id: '179238473',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1581094794329-cd1096a7a2e8?q=80&w=600&auto=format&fit=crop',
    caption: 'Manutenção de painéis solares. Energia limpa para sua casa! ☀️',
    permalink: '',
    timestamp: new Date().toISOString()
  },
  {
    id: '179238474',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=600&auto=format&fit=crop',
    caption: 'Renovação de cozinha: encanamento e iluminação LED.',
    permalink: '',
    timestamp: new Date().toISOString()
  },
  {
    id: '179238475',
    media_type: 'VIDEO',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Placeholder video
    thumbnail_url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=600&auto=format&fit=crop',
    caption: 'Timelapse do nosso trabalho de hoje. Rápido e limpo!',
    permalink: '',
    timestamp: new Date().toISOString()
  },
  {
    id: '179238476',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1632921256082-277a119777f9?q=80&w=600&auto=format&fit=crop',
    caption: 'Troca de disjuntores antigos. Segurança em primeiro lugar.',
    permalink: '',
    timestamp: new Date().toISOString()
  },
  {
    id: '179238477',
    media_type: 'IMAGE',
    media_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop',
    caption: 'Antes e depois desta instalação. O que acharam?',
    permalink: '',
    timestamp: new Date().toISOString()
  }
];

export const instagramService = {
  /**
   * Passo 1: Iniciar Autenticação
   * Redireciona o usuário para o Instagram para aprovar permissões
   */
  initiateAuth: () => {
    // Em produção real:
    // const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    // window.location.href = authUrl;
    
    // Para DEMO: Simulamos sucesso imediato salvando um token fake
    console.log("Simulating Instagram Auth Redirect...");
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.setItem(TOKEN_KEY, JSON.stringify({
          access_token: 'mock_long_lived_token_12345',
          expires_in: 5184000, // 60 dias
          timestamp: Date.now()
        }));
        resolve();
      }, 1500);
    });
  },

  /**
   * Passo 2: Verificar se está conectado
   */
  isConnected: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Passo 3: Buscar Mídia (Com Cache Strategy)
   * Regra: Cache de 24h para evitar Rate Limits
   */
  getMedia: async (): Promise<InstagramMedia[]> => {
    // 1. Verificar Cache
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { media, timestamp } = JSON.parse(cachedData);
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (Date.now() - timestamp < oneDay) {
        console.log("Serving Instagram media from cache (Optimistic UI)");
        return media;
      }
    }

    // 2. Se não tiver cache ou expirou, buscar da API
    // Simulando chamada API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Em produção: axios.get(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${token}`)
        
        // Salvando no cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          media: MOCK_MEDIA,
          timestamp: Date.now()
        }));
        
        resolve(MOCK_MEDIA);
      }, 1000);
    });
  },

  /**
   * Função de Logout / Desconectar
   */
  disconnect: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CACHE_KEY);
  }
};
