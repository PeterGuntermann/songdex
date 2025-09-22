using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Application.Coversongs;

public static class TestData
{
    public static Song AnySong => new()
    {
        Title = "I just wanna live"
    };
}