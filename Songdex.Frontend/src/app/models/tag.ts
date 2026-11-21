/**
 * Mirrors `TagResponse` of the backend. Names are unique regardless of case.
 */
export type Tag = {
  id: string;
  name: string;
};

/** Mirrors `TagSummaryResponse`: a tag as the tag endpoints return it. */
export type TagSummary = Tag & {
  /** Zero marks an unused tag. */
  songCount: number;
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
