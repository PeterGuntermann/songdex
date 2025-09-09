using Coversongs.Backend.Domain.Model;

namespace Coversongs.Backend.Application.Coversongs;

public static class TestData
{
    public static Coversong AnyCoversong => new()
    {
        Title = "I just wanna live"
    };
}