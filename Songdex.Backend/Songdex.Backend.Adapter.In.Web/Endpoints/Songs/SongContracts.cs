using Songdex.Backend.Adapter.In.Web.Endpoints.Tags;
using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

/// <summary>
/// What the API returns. Deliberately flat: the domain model wraps the id in a
/// <see cref="SongId"/>, which would otherwise surface as <c>{"id":{"value":"…"}}</c>.
/// Tags are sorted by name.
/// </summary>
public record SongResponse(
    string Id,
    string Title,
    string Artist,
    int? ReleaseYear,
    string? ReferenceLink,
    string? Notes,
    string? Genre,
    string? Language,
    string? Album,
    IReadOnlyList<TagResponse> Tags);

/// <summary>
/// What the API accepts. Carries no id — it comes from the route on update and is assigned by
/// the application on create. <see cref="Tags"/> holds tag names and replaces the song's whole
/// tag set; an unknown name creates the tag, a missing list means no tags.
/// </summary>
public record SongRequest(
    string? Title,
    string? Artist,
    int? ReleaseYear,
    string? ReferenceLink,
    string? Notes,
    string? Genre,
    string? Language,
    string? Album,
    IReadOnlyList<string>? Tags);

public static class SongContractMappings
{
    public static SongResponse ToResponse(Song song)
        => new(
            song.Id.Value,
            song.Title,
            song.Artist,
            song.ReleaseYear,
            song.ReferenceLink,
            song.Notes,
            song.Genre,
            song.Language,
            song.Album,
            song.Tags
                .OrderBy(tag => tag.Name, StringComparer.InvariantCultureIgnoreCase)
                .Select(TagContractMappings.ToResponse)
                .ToList());

    /// <summary>
    /// Builds a domain object from a request. Pass <paramref name="id"/> to address an existing
    /// song; omit it to let <see cref="SongId"/> generate a new one.
    /// </summary>
    public static Song ToDomainObject(SongRequest request, SongId? id = null)
        => new()
        {
            Id = id ?? new SongId(),
            Title = request.Title?.Trim() ?? string.Empty,
            Artist = request.Artist?.Trim() ?? string.Empty,
            ReleaseYear = request.ReleaseYear,
            ReferenceLink = NullIfBlank(request.ReferenceLink),
            Notes = NullIfBlank(request.Notes),
            Genre = NullIfBlank(request.Genre),
            Language = NullIfBlank(request.Language),
            Album = NullIfBlank(request.Album),
            // Ids are left to the application, which resolves the names against stored tags.
            Tags = (request.Tags ?? []).Select(name => new Tag { Name = name.Trim() }).ToList(),
        };

    private static string? NullIfBlank(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
