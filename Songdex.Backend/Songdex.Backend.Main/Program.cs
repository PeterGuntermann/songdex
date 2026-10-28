using Songdex.Backend.Adapter.In.Web;
using Songdex.Backend.Adapter.Out.Persistence;
using Songdex.Backend.Application;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

services.AddApplication();
services.AddPersistenceAdapter(builder.Configuration);
services.AddWebAdapter();

if (builder.Environment.IsDevelopment())
{
    services.AddLocalDatabaseInitializer();
}

var app = builder.Build();
app.UseWebAdapter();

app.Run();
