/**
 * Mirrors `TagResponse` of the backend. Names are unique regardless of case.
 */
export type Tag = {
  id: string;
  name: string;
};

/** Keep in sync with `TagsApi.MaxNameLength` in the backend. */
export const TagLimits = {
  name: 50,
} as const;

/**
 * The form tag names are compared in; "Akustik" and "akustik" are the same tag. Locale-independent
 * like `Tag.Normalize` in the backend.
 */
export function normalizeTagName(name: string): string {
  return name.trim().toUpperCase();
}
