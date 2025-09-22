using Coversongs.Backend.Application.Coversongs;
using Coversongs.Backend.Domain.Services;
using Coversongs.Backend.WebApi;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
services.AddWebApi();
services.AddSingleton<ICoversongsService, CoversongsService>();

var app = builder.Build();
app.UseWebApi();

app.Run();