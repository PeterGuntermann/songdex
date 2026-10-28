using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<Results<NoContent, NotFound>> DeleteSong(
        string id,
        IDeleteSongUseCase deleteSong)
    {
        var deleted = await deleteSong.DeleteSong(new SongId(id));
        return deleted ? TypedResults.NoContent() : TypedResults.NotFound();
    }
}
