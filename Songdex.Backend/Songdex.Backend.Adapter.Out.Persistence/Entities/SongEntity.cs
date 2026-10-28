using System.ComponentModel.DataAnnotations;

namespace Songdex.Backend.Adapter.Out.Persistence.Entities;

public class SongEntity
{
    [MaxLength(8)]
    public string Id { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Artist { get; set; } = string.Empty;

    public int? ReleaseYear { get; set; }

    [MaxLength(500)]
    public string? ReferenceLink { get; set; }
}
