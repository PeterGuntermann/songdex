/**
 * Development defaults, used by `ng serve` and by the unit tests.
 *
 * The backend runs on its own origin here, so requests are cross-origin and rely on the CORS
 * policy in `WebAdapterExtensions`.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5286',
};
