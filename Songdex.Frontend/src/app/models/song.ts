/**
 * Mirrors `SongResponse` of the backend. Ids are assigned by the backend, never here.
 */
export type Song = {
  id: string;
  title: string;
  artist: string;
  releaseYear: number | null;
  referenceLink: string | null;
};

/** What the backend accepts on create and update — everything but the id. */
export type SongDraft = Omit<Song, 'id'>;
