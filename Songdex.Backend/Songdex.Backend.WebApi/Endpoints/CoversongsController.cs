using Microsoft.AspNetCore.Mvc;
using Songdex.Backend.Domain.Services;

namespace Songdex.Backend.WebApi.Endpoints;

[Route("api/[controller]")]
public class CoversongsController(ISongsService songsService) : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(songsService.GetAllSongs());
    }
}