namespace Songdex.Backend.Application.Domain.Model;

/// <summary>
/// A free label on a song. Names are unique regardless of case: "Akustik" and "akustik" are the
/// same tag.
/// </summary>
public class Tag
{
    public TagId Id { get; init; } = new();
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The form two tag names are compared in. Uses invariant upper case rather than SQLite's
    /// NOCASE, which only folds ASCII and would tell "Ärzte" and "ärzte" apart.
    /// </summary>
    public static string Normalize(string name) => name.Trim().ToUpperInvariant();
}
