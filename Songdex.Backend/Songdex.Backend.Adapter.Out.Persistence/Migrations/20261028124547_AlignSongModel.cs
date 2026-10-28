using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Songdex.Backend.Adapter.Out.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlignSongModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ReleaseYear",
                table: "Songs",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldMaxLength: 4);

            // The old column was NOT NULL DEFAULT ''. SQLite keeps '' as a text value in a column
            // with INTEGER affinity, which would fail to materialise as int?. Runs after the
            // AlterColumn because only then does the column accept NULL.
            migrationBuilder.Sql("UPDATE Songs SET ReleaseYear = NULL WHERE ReleaseYear = '';");

            migrationBuilder.AddColumn<string>(
                name: "ReferenceLink",
                table: "Songs",
                type: "TEXT",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReferenceLink",
                table: "Songs");

            migrationBuilder.AlterColumn<string>(
                name: "ReleaseYear",
                table: "Songs",
                type: "TEXT",
                maxLength: 4,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);
        }
    }
}
