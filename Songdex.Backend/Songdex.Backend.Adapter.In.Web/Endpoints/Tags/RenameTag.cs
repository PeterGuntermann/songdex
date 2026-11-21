using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

public static partial class TagsApi
{
    public static async Task<Results<Ok<TagSummaryResponse>, ValidationProblem, NotFound, Conflict>> RenameTag(
        string id,
        TagRequest request,
        IRenameTagUseCase renameTag)
    {
        var errors = Validate(request);
        if (errors is not null)
        {
            return TypedResults.ValidationProblem(errors);
        }

        var result = await renameTag.RenameTag(new TagId(id), request.Name!);
        return result.Status switch
        {
            TagChangeStatus.Succeeded => TypedResults.Ok(TagContractMappings.ToSummary(result.Tag!)),
            TagChangeStatus.NameTaken => TypedResults.Conflict(),
            _ => TypedResults.NotFound(),
        };
    }
}
