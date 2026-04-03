import axios from 'axios';

// A chave deve ser gerada no painel do themoviedb.org

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

export const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
  },
});
