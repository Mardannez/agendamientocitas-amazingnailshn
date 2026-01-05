/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // aquí puedes agregar más si luego usas otros .env
  readonly VITE_RESEND_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

