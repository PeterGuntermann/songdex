using Microsoft.AspNetCore.Http;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static Task<IResult> GetAllSongs(IGetAllSongsUseCase getAllSongs)
    {
        return Task.FromResult<IResult>(TypedResults.Ok(getAllSongs.GetAllSongs()));
    }
}
