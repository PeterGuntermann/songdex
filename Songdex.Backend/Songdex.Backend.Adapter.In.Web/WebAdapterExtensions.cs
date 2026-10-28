using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Songdex.Backend.Adapter.In.Web.Endpoints.Songs;

namespace Songdex.Backend.Adapter.In.Web;

public static class WebAdapterConstants
{
    public const string AllowSpecificOrigins = "AllowSpecificOrigins";
}

public static class WebAdapterExtensions
{
    public static IServiceCollection AddWebAdapter(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddOpenApiDocument(options =>
        {
            options.PostProcess = document => { document.Info.Title = "Songdex Backend API"; };
        });
        services.AddCors(options =>
        {
            options.AddPolicy(name: WebAdapterConstants.AllowSpecificOrigins,
                policy => { policy.WithOrigins("http://localhost:4200", "http://localhost:8080"); });
        });
        services.AddControllers();
        return services;
    }

    public static WebApplication UseWebAdapter(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
        {
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        if (app.Environment.IsDevelopment())
        {
            app.UseOpenApi();
            app.UseSwaggerUi();
        }

        app.UseRouting();
        app.UseCors(WebAdapterConstants.AllowSpecificOrigins);

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller}/{action=Index}/{id?}");

        app.MapGet("/", () => "Hello World!");

        var songs = app.MapGroup("/api/songs").WithOpenApi();
        songs.MapGet("/", SongsApi.GetAllSongs);
        songs.MapGet("/{id}", SongsApi.GetSong);
        songs.MapPost("/", SongsApi.CreateSong);
        songs.MapPut("/{id}", SongsApi.UpdateSong);
        songs.MapDelete("/{id}", SongsApi.DeleteSong);

        var artists = app.MapGroup("/api/artists").WithOpenApi();
        artists.MapGet("/", ArtistsApi.GetAllArtists);
        artists.MapGet("/{id}", ArtistsApi.GetArtist);
        artists.MapPost("/", ArtistsApi.CreateArtist);
        artists.MapPut("/{id}", ArtistsApi.UpdateArtist);
        artists.MapDelete("/{id}", ArtistsApi.DeleteArtist);

        return app;
    }
}
