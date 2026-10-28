/**
 * Production build, served by nginx under Docker Compose.
 *
 * The base URL is empty on purpose: nginx proxies `/api/` to the backend container, so the API
 * shares the app's origin and the app does not care which host it is reached under.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
};
