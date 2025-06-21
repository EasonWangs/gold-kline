/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOLDAPI_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 