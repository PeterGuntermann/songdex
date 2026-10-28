using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<Results<Ok<SongResponse>, NotFound>> GetSong(
        string id,
        IGetSongUseCase getSong)
    {
        var song = await getSong.GetSong(new SongId(id));
        return song is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(SongContractMappings.ToResponse(song));
    }
}
