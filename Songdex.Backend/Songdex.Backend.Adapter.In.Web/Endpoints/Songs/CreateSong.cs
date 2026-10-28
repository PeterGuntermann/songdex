using Microsoft.AspNetCore.Http;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<IResult> CreateSong()
    {
        // TODO
        return TypedResults.Created();
    }
}
