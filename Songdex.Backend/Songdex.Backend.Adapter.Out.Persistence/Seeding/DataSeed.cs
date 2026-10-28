using Songdex.Backend.Adapter.Out.Persistence.Entities;
using Songdex.Backend.Adapter.Out.Persistence.Mappings;
using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.Out.Persistence.Seeding;

public static class DataSeed
{
    public static IEnumerable<SongEntity> Songs => new List<Song>
    {
        new("1000 und 1 Nacht (Zoom)"),
        new("Angels", "Robbie Williams"),
        new("A night like this", "Caro Emerald", 2009)
    }.Select(SongMappings.ToDatabaseEntity);
}
