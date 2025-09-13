using Coversongs.Backend.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace Coversongs.Backend.WebApi.Endpoints;

[Route("api/[controller]")]
public class CoversongsController(ICoversongsService coversongsService) : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(coversongsService.GetAllSongs());
    }
}