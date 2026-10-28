using Microsoft.AspNetCore.Http;

namespace Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

public static partial class SongsApi
{
    public static async Task<IResult> DeleteSong(int id)
    {
        // TODO
        return TypedResults.Ok();
    }
}
