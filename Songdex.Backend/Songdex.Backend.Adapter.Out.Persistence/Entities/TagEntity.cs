using System.ComponentModel.DataAnnotations;

namespace Songdex.Backend.Adapter.Out.Persistence.Entities;

public class TagEntity
{
    [MaxLength(8)]
    public string Id { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// <see cref="Name"/> in the form produced by <c>Tag.Normalize</c>. Carries the unique index
    /// that makes tag names case-insensitively unique.
    /// </summary>
    [MaxLength(50)]
    public string NormalizedName { get; set; } = string.Empty;

    public List<SongEntity> Songs { get; set; } = [];
}
