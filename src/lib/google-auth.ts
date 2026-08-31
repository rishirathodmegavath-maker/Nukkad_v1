/** Must match the route registered in AppRoutes and the Authorized redirect URI configured in
 * Google Cloud Console for this origin. */
export const GOOGLE_CALLBACK_PATH = '/auth/google/callback'

export function googleRedirectUri(): string {
  return `${window.location.origin}${GOOGLE_CALLBACK_PATH}`
}
