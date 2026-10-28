using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<Results<Created<SongResponse>, ValidationProblem>> CreateSong(
        SongRequest request,
        ICreateSongUseCase createSong)
    {
        var errors = Validate(request);
        if (errors is not null)
        {
            return TypedResults.ValidationProblem(errors);
        }

        var created = await createSong.CreateSong(SongContractMappings.ToDomainObject(request));
        var response = SongContractMappings.ToResponse(created);
        return TypedResults.Created($"/api/songs/{response.Id}", response);
    }
}
