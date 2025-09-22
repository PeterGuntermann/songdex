using Songdex.Backend.Application.Coversongs;
using Songdex.Backend.Domain.Services;
using Songdex.Backend.WebApi;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
services.AddWebApi();
services.AddSingleton<ICoversongsService, CoversongsService>();

var app = builder.Build();
app.UseWebApi();

app.Run();