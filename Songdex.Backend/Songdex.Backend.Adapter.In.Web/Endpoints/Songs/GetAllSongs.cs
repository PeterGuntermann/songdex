using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<Ok<IEnumerable<SongResponse>>> GetAllSongs(
        IGetAllSongsUseCase getAllSongs)
    {
        var songs = await getAllSongs.GetAllSongs();
        return TypedResults.Ok(songs.Select(SongContractMappings.ToResponse));
    }
}
