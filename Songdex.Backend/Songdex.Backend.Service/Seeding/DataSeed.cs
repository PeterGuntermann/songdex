using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Service.Seeding;

public static class DataSeed
{
    public static IEnumerable<Song> Songs => new List<Song>
    {
        new("1000 und 1 Nacht (Zoom)"),
        new("Angels", "Robbie Williams"),
        new("A night like this", "Caro Emerald", 2009)
    };
}