using Coversongs.Backend.Application.Coversongs;
using Coversongs.Backend.Domain.Services;
using Coversongs.Backend.WebApi;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
services.AddWebApi();
services.AddSingleton<ICoversongsService, CoversongsService>();


var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseRouting();
app.UseCors(WebApiConstants.AllowSpecificOrigins);

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapGet("/", () => "Hello World!");


app.Run();