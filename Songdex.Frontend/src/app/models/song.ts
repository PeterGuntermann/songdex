/**
 * Mirrors `SongResponse` of the backend. Ids are assigned by the backend, never here.
 */
export type Song = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number | null;
  referenceLink: string | null;
  notes: string | null;
  genre: string | null;
  language: string | null;
  album: string | null;
};

/**
 * Maximum lengths of the text fields. Keep in sync with `SongRequestValidation.cs` in the
 * backend, which rejects anything longer.
 */
export const SongLimits = {
  title: 200,
  artist: 200,
  referenceLink: 500,
  notes: 4000,
  genre: 100,
  language: 50,
  album: 200,
} as const;

/** What the backend accepts on create and update — everything but the id. */
export type SongDraft = Omit<Song, 'id'>;
