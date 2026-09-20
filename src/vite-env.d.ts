/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** So para desenvolvimento local: vai para o bundle (publico). Ver README. */
  readonly VITE_API_KEY?: string
  /** `full` (padrão) ou `expert` (só /avaliacao/*). Variavel de BUILD; ver README. */
  readonly VITE_APP_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
