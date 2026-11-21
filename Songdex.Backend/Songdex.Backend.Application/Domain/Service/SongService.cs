using Songdex.Backend.Application.Domain.Model;
using Songdex.Backend.Application.Port.In;
using Songdex.Backend.Application.Port.Out;

namespace Songdex.Backend.Application.Domain.Service;

/// <summary>
/// Bundles all use cases of the song aggregate.
/// </summary>
public class SongService(ISongRepository songRepository, ITagRepository tagRepository)
    : IGetAllSongsUseCase, IGetSongUseCase, ICreateSongUseCase, IUpdateSongUseCase, IDeleteSongUseCase
{
    public Task<IEnumerable<Song>> GetAllSongs()
    {
        return songRepository.GetAll();
    }

    public Task<Song?> GetSong(SongId id)
    {
        return songRepository.GetById(id);
    }

    public async Task<Song> CreateSong(Song song)
    {
        return await songRepository.Add(song.WithTags(await ResolveTags(song.Tags)));
    }

    public async Task<Song?> UpdateSong(Song song)
    {
        // Checked first so that an unknown song does not leave freshly created tags behind.
        if (await songRepository.GetById(song.Id) is null)
        {
            return null;
        }

        var resolved = song.WithTags(await ResolveTags(song.Tags));
        return await songRepository.Update(resolved) ? resolved : null;
    }

    public Task<bool> DeleteSong(SongId id)
    {
        return songRepository.Delete(id);
    }

    /// <summary>
    /// Turns the tags a caller asked for into stored ones: only their names count. A name that
    /// matches a stored tag, ignoring case, becomes that tag with its spelling; an unknown name
    /// creates a new tag. Blank names are dropped, and names that differ only in case count once.
    /// </summary>
    private async Task<IReadOnlyList<Tag>> ResolveTags(IEnumerable<Tag> requested)
    {
        var names = requested
            .Select(tag => tag.Name.Trim())
            .Where(name => name.Length > 0)
            .DistinctBy(Tag.Normalize)
            .ToList();
        if (names.Count == 0)
        {
            return [];
        }

        var stored = (await tagRepository.GetByNames(names))
            .ToDictionary(tag => Tag.Normalize(tag.Name));

        var resolved = new List<Tag>(names.Count);
        foreach (var name in names)
        {
            resolved.Add(stored.TryGetValue(Tag.Normalize(name), out var tag)
                ? tag
                : await tagRepository.Add(new Tag { Name = name }));
        }

        return resolved;
    }
}
