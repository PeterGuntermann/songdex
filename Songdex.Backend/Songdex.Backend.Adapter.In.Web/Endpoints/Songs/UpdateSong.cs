using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<Results<Ok<SongResponse>, NotFound, ValidationProblem>> UpdateSong(
        string id,
        SongRequest request,
        IUpdateSongUseCase updateSong)
    {
        var errors = Validate(request);
        if (errors is not null)
        {
            return TypedResults.ValidationProblem(errors);
        }

        var song = SongContractMappings.ToDomainObject(request, new SongId(id));
        var updated = await updateSong.UpdateSong(song);
        return updated is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(SongContractMappings.ToResponse(updated));
    }
}
