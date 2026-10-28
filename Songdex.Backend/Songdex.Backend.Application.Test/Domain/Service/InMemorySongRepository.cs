using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Test.Domain.Service;

/// <summary>
/// Stand-in for the outgoing port. The application is testable without a database precisely
/// because <see cref="ISongRepository"/> says nothing about one.
/// </summary>
public class InMemorySongRepository : ISongRepository
{
    private readonly Dictionary<string, Song> songs = [];

    public InMemorySongRepository(params Song[] initialSongs)
    {
        foreach (var song in initialSongs)
        {
            songs[song.Id.Value] = song;
        }
    }

    public Task<IEnumerable<Song>> GetAll() => Task.FromResult<IEnumerable<Song>>([.. songs.Values]);

    public Task<Song?> GetById(SongId id)
        => Task.FromResult(songs.GetValueOrDefault(id.Value));

    public Task<Song> Add(Song song)
    {
        songs[song.Id.Value] = song;
        return Task.FromResult(song);
    }

    public Task<bool> Update(Song song)
    {
        if (!songs.ContainsKey(song.Id.Value))
        {
            return Task.FromResult(false);
        }

        songs[song.Id.Value] = song;
        return Task.FromResult(true);
    }

    public Task<bool> Delete(SongId id) => Task.FromResult(songs.Remove(id.Value));
}
