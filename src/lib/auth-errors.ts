/**
 * Supabase Auth speaks English. These are the messages the screens show,
 * in European Portuguese, tu form.
 */

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

const INVALID_CREDENTIALS = "Email ou palavra-passe incorretos.";
const EMAIL_NOT_CONFIRMED = "Confirma o teu email antes de entrar. Verifica a tua caixa de entrada.";
const ALREADY_REGISTERED = "Já existe uma conta com este email. Entra ou redefine a palavra-passe.";
const WEAK_PASSWORD = "A palavra-passe é demasiado fraca. Usa pelo menos 6 caracteres.";
const RATE_LIMIT = "Demasiadas tentativas. Espera um pouco e tenta outra vez.";
const BAD_LINK = "Este link expirou ou já não é válido. Pede um novo.";
const NETWORK = "Sem ligação. Verifica a tua rede e tenta outra vez.";
const FALLBACK = "Algo correu mal. Tenta outra vez.";
const OAUTH_STATE = "A sessão de início de sessão expirou. Tenta outra vez.";

function haystack(error: AuthErrorLike | null | undefined): string {
  return `${error?.message ?? ""} ${error?.code ?? ""}`.toLowerCase();
}

export function mapAuthError(error: AuthErrorLike | null | undefined): string {
  const text = haystack(error);
  const status = error?.status;

  if (
    status === 0 ||
    text.includes("failed to fetch") ||
    text.includes("fetch failed") ||
    text.includes("networkerror") ||
    text.includes("network error") ||
    text.includes("load failed") ||
    text.includes("econnrefused") ||
    text.includes("enotfound")
  ) {
    return NETWORK;
  }

  if (
    text.includes("invalid login") ||
    text.includes("invalid credentials") ||
    text.includes("invalid_credentials") ||
    text.includes("invalid_grant")
  ) {
    return INVALID_CREDENTIALS;
  }

  if (text.includes("email not confirmed") || text.includes("email_not_confirmed")) {
    return EMAIL_NOT_CONFIRMED;
  }

  if (
    text.includes("user already registered") ||
    text.includes("already been registered") ||
    text.includes("user_already_exists") ||
    text.includes("email_exists") ||
    text.includes("already registered")
  ) {
    return ALREADY_REGISTERED;
  }

  if (
    text.includes("weak_password") ||
    text.includes("password should be at least") ||
    text.includes("password is too weak") ||
    text.includes("known to be weak")
  ) {
    return WEAK_PASSWORD;
  }

  if (
    status === 429 ||
    text.includes("rate limit") ||
    text.includes("too many requests") ||
    text.includes("over_request_rate_limit") ||
    text.includes("over_email_send_rate_limit")
  ) {
    return RATE_LIMIT;
  }

  if (
    text.includes("otp_expired") ||
    text.includes("flow_state_expired") ||
    text.includes("email link is invalid") ||
    text.includes("invalid or has expired") ||
    text.includes("link is invalid") ||
    text.includes("has expired") ||
    text.includes("expired")
  ) {
    return BAD_LINK;
  }

  if (text.includes("bad_oauth_state") || text.includes("oauth state")) {
    return OAUTH_STATE;
  }

  return FALLBACK;
}

export function isInvalidCredentials(message: string): boolean {
  return message === INVALID_CREDENTIALS;
}
