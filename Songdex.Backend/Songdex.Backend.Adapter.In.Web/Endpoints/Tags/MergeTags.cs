using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

public static partial class TagsApi
{
    /// <summary>
    /// Folds the tag <paramref name="id"/> into <paramref name="targetId"/> and returns the target.
    /// </summary>
    public static async Task<Results<Ok<TagSummaryResponse>, ValidationProblem, NotFound>> MergeTags(
        string id,
        string targetId,
        IMergeTagsUseCase mergeTags)
    {
        var result = await mergeTags.MergeTags(new TagId(id), new TagId(targetId));
        return result.Status switch
        {
            TagChangeStatus.Succeeded => TypedResults.Ok(TagContractMappings.ToSummary(result.Tag!)),
            TagChangeStatus.SameTag => TypedResults.ValidationProblem(
                new Dictionary<string, string[]> { ["targetId"] = ["A tag cannot be merged into itself."] }),
            _ => TypedResults.NotFound(),
        };
    }
}
