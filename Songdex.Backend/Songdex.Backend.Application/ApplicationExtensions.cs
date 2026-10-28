using Microsoft.Extensions.DependencyInjection;
using Songdex.Backend.Application.Domain.Service;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Application;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // One service instance per scope serves all its use case ports; registering the
        // implementation type against each interface separately would create one per interface.
        services.AddScoped<SongService>();
        services.AddScoped<IGetAllSongsUseCase>(sp => sp.GetRequiredService<SongService>());
        services.AddScoped<IGetSongUseCase>(sp => sp.GetRequiredService<SongService>());
        services.AddScoped<ICreateSongUseCase>(sp => sp.GetRequiredService<SongService>());
        services.AddScoped<IUpdateSongUseCase>(sp => sp.GetRequiredService<SongService>());
        services.AddScoped<IDeleteSongUseCase>(sp => sp.GetRequiredService<SongService>());
        return services;
    }
}
