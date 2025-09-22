using Songdex.Backend.Domain.Model;

namespace Songdex.Backend.Application.Coversongs;

public static class TestData
{
    public static Coversong AnyCoversong => new()
    {
        Title = "I just wanna live"
    };
}