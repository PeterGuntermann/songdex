using Microsoft.AspNetCore.Http;

namespace Songdex.Backend.WebApi.Endpoints.Songs;

public static class ArtistsApi
{
    public static async Task<IResult> GetAllArtists()
    {
        // TODO 
        return TypedResults.Ok();
    }

    public static async Task<IResult> GetArtist(int id)
    {
        // TODO 
        return TypedResults.Ok();
    }

    public static async Task<IResult> CreateArtist()
    {
        // TODO 
        return TypedResults.Ok();
    }

    public static async Task<IResult> UpdateArtist(int id)
    {
        // TODO 
        return TypedResults.Ok();
    }

    public static async Task<IResult> DeleteArtist(int id)
    {
        // TODO 
        return TypedResults.Ok();
    }
}