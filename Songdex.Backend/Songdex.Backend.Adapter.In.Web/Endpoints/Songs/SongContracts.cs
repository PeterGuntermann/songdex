using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

/// <summary>
/// What the API returns. Deliberately flat: the domain model wraps the id in a
/// <see cref="SongId"/>, which would otherwise surface as <c>{"id":{"value":"…"}}</c>.
/// </summary>
public record SongResponse(
    string Id,
    string Title,
    string Artist,
    int? ReleaseYear,
    string? ReferenceLink);

/// <summary>
/// What the API accepts. Carries no id — it comes from the route on update and is assigned by
/// the application on create.
/// </summary>
public record SongRequest(
    string? Title,
    string? Artist,
    int? ReleaseYear,
    string? ReferenceLink);

public static class SongContractMappings
{
    public static SongResponse ToResponse(Song song)
        => new(
            song.Id.Value,
            song.Title,
            song.Artist,
            song.ReleaseYear,
            song.ReferenceLink);

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
            ReferenceLink = string.IsNullOrWhiteSpace(request.ReferenceLink)
                ? null
                : request.ReferenceLink.Trim(),
        };
}
