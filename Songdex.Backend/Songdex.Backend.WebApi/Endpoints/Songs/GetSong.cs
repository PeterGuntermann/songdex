using Microsoft.AspNetCore.Http;
using Songdex.Backend.Application.Abstractions;

namespace Songdex.Backend.WebApi.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<IResult> GetSong(int id, ISongRepository songRepository)
    {
        // TODO
        return TypedResults.Ok();
    }
}