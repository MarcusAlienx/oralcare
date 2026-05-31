import { defineConfig } from 'orval';

export default defineConfig({
  'backend-contracts': {
    input: {
      target: './openapi.yaml', // Debes tener tu esquema aquí
    },
    output: {
      mode: 'tags',
      target: './src/generated/api-types.ts',
      client: 'none', // IMPORTANTE: Ponemos 'none' porque no queremos que genere peticiones Axios, solo los TIPOS.
      override: {
        useTypeOverUseInterface: true,
      },
    },
  },
});