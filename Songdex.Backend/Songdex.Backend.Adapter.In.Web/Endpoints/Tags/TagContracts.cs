using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

/// <summary>
/// What the API returns for a tag. Flat for the same reason as <c>SongResponse</c>.
/// </summary>
public record TagResponse(string Id, string Name);

/// <summary>
/// What the API accepts to create a tag. The id is assigned by the application.
/// </summary>
public record TagRequest(string? Name);

public static class TagContractMappings
{
    public static TagResponse ToResponse(Tag tag) => new(tag.Id.Value, tag.Name);

    public static Tag ToDomainObject(TagRequest request) => new() { Name = request.Name?.Trim() ?? string.Empty };
}
