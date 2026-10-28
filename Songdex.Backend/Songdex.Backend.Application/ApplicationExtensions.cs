using Microsoft.Extensions.DependencyInjection;
using Songdex.Backend.Application.Domain.Service;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Application;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IGetAllSongsUseCase, SongService>();
        return services;
    }
}
