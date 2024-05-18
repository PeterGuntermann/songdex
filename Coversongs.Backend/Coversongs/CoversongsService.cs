namespace Coversongs.Backend;

public interface ICoversongsService
{
    IEnumerable<Coversong> GetAllSongs();
}

public class CoversongsService : ICoversongsService
{
    public IEnumerable<Coversong> GetAllSongs()
    {
        return new List<Coversong>
        {
            TestData.AnyCoversong
        };
    }
}

