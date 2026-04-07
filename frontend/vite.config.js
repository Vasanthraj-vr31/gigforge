import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes env vars prefixed with VITE_ at runtime.
  // The project requirements expect process.env.REACT_APP_API_URL, so we map it here.
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.REACT_APP_API_URL || env.VITE_API_URL || 'http://localhost:5000/api/v1';

  return {
    plugins: [react()],
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(apiUrl),
    },
  };
});
