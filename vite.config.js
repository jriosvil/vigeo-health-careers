import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
    allowedHosts: [
      'localhost',
      'vigeocareers.onrender.com',
      'careers.vigeopt.com',
      'careers.vigeohealth.org',
      '.onrender.com',
      '.vigeohealth.org',
      '.vigeopt.com'
    ]
  }
});