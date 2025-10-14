using Songdex.Backend.Domain.Model;
using Songdex.Backend.Infrastructure.Database.Entities;
using Songdex.Backend.Infrastructure.Database.Mappings;

namespace Songdex.Backend.Service.Seeding;

public static class DataSeed
{
    public static IEnumerable<SongEntity> Songs => new List<Song>
    {
        new("1000 und 1 Nacht (Zoom)"),
        new("Angels", "Robbie Williams"),
        new("A night like this", "Caro Emerald", 2009)
    }.Select(SongMappings.ToDatabaseEntity);
}