using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Tags;

public static partial class TagsApi
{
    public static async Task<Results<NoContent, NotFound>> DeleteTag(string id, IDeleteTagUseCase deleteTag)
    {
        var deleted = await deleteTag.DeleteTag(new TagId(id));
        return deleted ? TypedResults.NoContent() : TypedResults.NotFound();
    }
}
