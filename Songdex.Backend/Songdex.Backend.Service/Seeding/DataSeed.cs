using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Service.Seeding;

public static class DataSeed
{
    public static IEnumerable<Song> Songs => new List<Song>
    {
        new() { Title = "Foobar" }
    };
}