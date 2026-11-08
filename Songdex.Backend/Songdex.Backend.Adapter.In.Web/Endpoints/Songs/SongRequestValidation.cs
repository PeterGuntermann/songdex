namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    private const int MaxTitleLength = 200;
    private const int MaxArtistLength = 200;
    private const int MaxReferenceLinkLength = 500;
    private const int MaxNotesLength = 4000;
    private const int MaxGenreLength = 100;
    private const int MaxLanguageLength = 50;
    private const int MaxAlbumLength = 200;

    /// <summary>
    /// Mirrors the length limits of the persistence entity. Returns the problem details for a
    /// 400 response, or <c>null</c> when the request is acceptable.
    /// </summary>
    private static Dictionary<string, string[]>? Validate(SongRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            errors[nameof(SongRequest.Title)] = ["Title is required."];
        }
        else if (request.Title.Trim().Length > MaxTitleLength)
        {
            errors[nameof(SongRequest.Title)] =
                [$"Title must not exceed {MaxTitleLength} characters."];
        }

        CheckMaxLength(errors, nameof(SongRequest.Artist), "Artist", request.Artist, MaxArtistLength);
        CheckMaxLength(
            errors, nameof(SongRequest.ReferenceLink), "Reference link", request.ReferenceLink,
            MaxReferenceLinkLength);
        CheckMaxLength(errors, nameof(SongRequest.Notes), "Notes", request.Notes, MaxNotesLength);
        CheckMaxLength(errors, nameof(SongRequest.Genre), "Genre", request.Genre, MaxGenreLength);
        CheckMaxLength(
            errors, nameof(SongRequest.Language), "Language", request.Language, MaxLanguageLength);
        CheckMaxLength(errors, nameof(SongRequest.Album), "Album", request.Album, MaxAlbumLength);

        return errors.Count == 0 ? null : errors;
    }

    private static void CheckMaxLength(
        Dictionary<string, string[]> errors, string key, string label, string? value, int max)
    {
        if (value?.Trim().Length > max)
        {
            errors[key] = [$"{label} must not exceed {max} characters."];
        }
    }
}
