namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    private const int MaxTitleLength = 200;
    private const int MaxArtistLength = 200;
    private const int MaxReferenceLinkLength = 500;

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

        if (request.Artist?.Trim().Length > MaxArtistLength)
        {
            errors[nameof(SongRequest.Artist)] =
                [$"Artist must not exceed {MaxArtistLength} characters."];
        }

        if (request.ReferenceLink?.Trim().Length > MaxReferenceLinkLength)
        {
            errors[nameof(SongRequest.ReferenceLink)] =
                [$"Reference link must not exceed {MaxReferenceLinkLength} characters."];
        }

        return errors.Count == 0 ? null : errors;
    }
}
