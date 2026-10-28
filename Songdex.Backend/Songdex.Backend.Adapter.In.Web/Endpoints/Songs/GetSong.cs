using Microsoft.AspNetCore.Http;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<IResult> GetSong(int id)
    {
        // TODO
        return TypedResults.Ok();
    }
}
