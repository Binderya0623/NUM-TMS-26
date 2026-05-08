/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_USER?: string;
  readonly VITE_API_TOPIC?: string;
  readonly VITE_API_WORKFLOW?: string;
  readonly VITE_API_COMMITTEE?: string;
  readonly VITE_API_THESIS?: string;
  readonly VITE_API_EVALUATION?: string;
  readonly VITE_API_NOTIFICATION?: string;
  readonly VITE_API_REPORT?: string;
  readonly VITE_API_MESSAGE?: string;
  readonly VITE_API_ANALYTIC?: string;
  readonly VITE_API_GRADING?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
