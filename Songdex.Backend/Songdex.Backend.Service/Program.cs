using Songdex.Backend.Application;
using Songdex.Backend.Infrastructure;
using Songdex.Backend.Service.Seeding;
using Songdex.Backend.WebApi;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddApplication();
services.AddInfrastructure();
services.AddWebApi();

if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
{
    services.AddHostedService<LocalDatabaseInitializer>();
}

var app = builder.Build();
app.UseWebApi();

app.Run();