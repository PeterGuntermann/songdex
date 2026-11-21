using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

/// <summary>
/// A tag as part of a song. Flat for the same reason as <c>SongResponse</c>.
/// </summary>
public record TagResponse(string Id, string Name);

/// <summary>
/// A tag as the tag endpoints return it, with the number of songs that carry it.
/// </summary>
public record TagSummaryResponse(string Id, string Name, int SongCount);

/// <summary>
/// What the API accepts to create or rename a tag. The id is assigned by the application.
/// </summary>
public record TagRequest(string? Name);

public static class TagContractMappings
{
    public static TagResponse ToResponse(Tag tag) => new(tag.Id.Value, tag.Name);

    public static TagSummaryResponse ToSummary(TagUsage usage)
        => new(usage.Tag.Id.Value, usage.Tag.Name, usage.SongCount);

    public static Tag ToDomainObject(TagRequest request) => new() { Name = request.Name?.Trim() ?? string.Empty };
}
