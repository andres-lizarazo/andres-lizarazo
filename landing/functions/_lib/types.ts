export interface Env {
  DB: D1Database;
  BREVO_API_KEY?: string;
  BREVO_LIST_LEADS?: string;
  BREVO_LIST_BUYERS?: string;
  BREVO_LIST_ABANDONED?: string;
  HOTMART_HOTTOK?: string;
  ADMIN_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
  IP_HASH_SALT?: string;
}
