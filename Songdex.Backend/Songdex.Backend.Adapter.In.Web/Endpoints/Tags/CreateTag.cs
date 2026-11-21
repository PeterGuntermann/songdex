using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

public static partial class TagsApi
{
    public static async Task<Results<Created<TagResponse>, ValidationProblem, Conflict>> CreateTag(
        TagRequest request,
        ICreateTagUseCase createTag)
    {
        var errors = Validate(request);
        if (errors is not null)
        {
            return TypedResults.ValidationProblem(errors);
        }

        var created = await createTag.CreateTag(TagContractMappings.ToDomainObject(request));
        if (created is null)
        {
            return TypedResults.Conflict();
        }

        // No Location header: there is no endpoint for a single tag to point it at.
        return TypedResults.Created((string?)null, TagContractMappings.ToResponse(created));
    }
}
