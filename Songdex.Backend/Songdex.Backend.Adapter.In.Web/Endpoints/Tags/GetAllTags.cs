using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

public static partial class TagsApi
{
    public static async Task<Ok<IEnumerable<TagResponse>>> GetAllTags(IGetAllTagsUseCase getAllTags)
    {
        var tags = await getAllTags.GetAllTags();
        return TypedResults.Ok(tags.Select(TagContractMappings.ToResponse));
    }
}
