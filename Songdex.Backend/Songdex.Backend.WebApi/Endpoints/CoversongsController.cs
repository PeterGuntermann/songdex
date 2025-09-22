using Microsoft.AspNetCore.Mvc;
using Songdex.Backend.Domain.Services;

namespace Songdex.Backend.WebApi.Endpoints;

[Route("api/[controller]")]
public class CoversongsController(ICoversongsService coversongsService) : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(coversongsService.GetAllSongs());
    }
}