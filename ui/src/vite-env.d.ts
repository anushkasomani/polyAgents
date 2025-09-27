/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_X402_RESOURCE_SERVER_URL: string
  readonly VITE_X402_FACILITATOR_URL: string
  readonly VITE_WALLET_PRIVATE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
