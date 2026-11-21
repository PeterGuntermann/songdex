using Microsoft.EntityFrameworkCore;
using Songdex.Backend.Adapter.Out.Persistence.Entities;
using Songdex.Backend.Application.Domain.Model;

namespace Songdex.Backend.Adapter.Out.Persistence.Test;

/// <summary>
/// Runs the tag repository against a real, migrated SQLite database: counting, the unique name
/// index and the cascades are database behaviour that an in-memory fake cannot show.
/// </summary>
public class TagRepositoryTest : IAsyncLifetime
{
    private SqliteTestDatabase database = null!;

    private static readonly TagEntity Acoustic = Tag("tag00001", "Akustik");
    private static readonly TagEntity Rehearsed = Tag("tag00002", "einstudiert");
    private static readonly TagEntity Unused = Tag("tag00003", "Sommerfest");

    public async Task InitializeAsync()
    {
        database = await SqliteTestDatabase.Create();

        // Fresh entity instances per test; the static ones only carry ids and names.
        await using var context = database.NewContext();
        var acoustic = Copy(Acoustic);
        var rehearsed = Copy(Rehearsed);
        context.Tags.AddRange(acoustic, rehearsed, Copy(Unused));
        context.Songs.AddRange(
            Song("song0001", "Angels", acoustic),
            Song("song0002", "Hurra", acoustic, rehearsed),
            Song("song0003", "Runaway", rehearsed));
        await context.SaveChangesAsync();
    }

    public async Task DisposeAsync() => await database.DisposeAsync();

    [Fact]
    public async Task CountsTheSongsOfEveryTagIncludingUnusedOnes()
    {
        var usage = await Repository().GetAllWithUsage();

        Assert.Equal(
            new Dictionary<string, int> { ["Akustik"] = 2, ["einstudiert"] = 2, ["Sommerfest"] = 0 },
            usage.ToDictionary(u => u.Tag.Name, u => u.SongCount));
    }

    [Fact]
    public async Task RenamingUpdatesTheNameUsedForCaseInsensitiveLookups()
    {
        Assert.True(await Repository().Rename(new TagId(Acoustic.Id), "Unplugged"));

        var repository = Repository();
        Assert.Equal("Unplugged", Assert.Single(await repository.GetByNames(["UNPLUGGED"])).Name);
        Assert.Empty(await repository.GetByNames(["akustik"]));
        Assert.Equal(2, (await repository.GetById(new TagId(Acoustic.Id)))?.SongCount);
    }

    [Fact]
    public async Task TheUniqueIndexRejectsANameThatDiffersOnlyInCase()
    {
        await using var context = database.NewContext();
        context.Tags.Add(Tag("tag00009", "AKUSTIK"));

        await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
    }

    [Fact]
    public async Task DeletingRemovesTheTagFromEverySongButKeepsTheSongs()
    {
        Assert.True(await Repository().Delete(new TagId(Acoustic.Id)));

        Assert.Equal(["einstudiert"], await TagsOf("song0002"));
        Assert.Empty(await TagsOf("song0001"));
        await using var context = database.NewContext();
        Assert.Equal(3, await context.Songs.CountAsync());
        Assert.Equal(2, await context.Tags.CountAsync());
    }

    [Fact]
    public async Task DeletingAnUnknownTagReportsFailure()
    {
        Assert.False(await Repository().Delete(new TagId("unknown1")));
    }

    [Fact]
    public async Task MergingMovesEverySongToTheTargetWithoutDuplicatesAndRemovesTheSource()
    {
        Assert.True(await Repository().Merge(new TagId(Acoustic.Id), new TagId(Rehearsed.Id)));

        Assert.Equal(["einstudiert"], await TagsOf("song0001"));
        Assert.Equal(["einstudiert"], await TagsOf("song0002"));
        Assert.Equal(["einstudiert"], await TagsOf("song0003"));
        var repository = Repository();
        Assert.Null(await repository.GetById(new TagId(Acoustic.Id)));
        Assert.Equal(3, (await repository.GetById(new TagId(Rehearsed.Id)))?.SongCount);
    }

    [Fact]
    public async Task MergingWithAnUnknownTagChangesNothing()
    {
        Assert.False(await Repository().Merge(new TagId(Acoustic.Id), new TagId("unknown1")));
        Assert.False(await Repository().Merge(new TagId("unknown1"), new TagId(Acoustic.Id)));

        Assert.Equal(2, (await Repository().GetById(new TagId(Acoustic.Id)))?.SongCount);
    }

    private TagRepository Repository() => new(database.NewContext());

    private async Task<IEnumerable<string>> TagsOf(string songId)
    {
        var song = await new SongRepository(database.NewContext()).GetById(new SongId(songId));
        return song!.Tags.Select(tag => tag.Name).Order();
    }

    private static TagEntity Tag(string id, string name)
        => new() { Id = id, Name = name, NormalizedName = Application.Domain.Model.Tag.Normalize(name) };

    private static TagEntity Copy(TagEntity tag) => Tag(tag.Id, tag.Name);

    private static SongEntity Song(string id, string title, params TagEntity[] tags)
        => new() { Id = id, Title = title, Tags = [.. tags] };
}
