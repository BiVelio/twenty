// email and profile take no googleapis.com/auth/ prefix, see https://developers.google.com/identity/protocols/oauth2/scopes
// BiVelio (decision crm-4): read-only sync. The Gmail send and compose scopes are not requested, so
// the CRM cannot send or draft email on behalf of anyone. The same list is the one checked against
// the token (google-apis-scopes.ts), so a connection with only these scopes is valid.
// This comment is kept in the compiled file: it must not spell those two scope names, because the
// BiVelio start guard (bivelio-one infra/prod/crm/guardas.sh, crm3-1) greps this file for them.
export const getGoogleApisOauthScopes = () => {
  return [
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/profile.emails.read',
  ];
};
