using Microsoft.AspNetCore.Mvc;

namespace Coversongs.Backend;

[Route("api/[controller]")]
public class CoversongsController(ICoversongsService coversongsService) : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(coversongsService.GetAllSongs());
    }
}