using System.ComponentModel.DataAnnotations;

namespace Songdex.Backend.Infrastructure.Database.Entities;

public class SongEntity
{
    [MaxLength(8)]
    public string Id { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(200)]
    public string Artist { get; set; } = string.Empty;

    [MaxLength(4)]
    public string ReleaseYear { get; set; } = string.Empty;
}