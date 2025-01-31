// Create a config file (e.g., src/config.ts)
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://goapi.nuritas.tr'  // Production URL
  : '/api'                      // Development URL (proxied)