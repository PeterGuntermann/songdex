using Microsoft.AspNetCore.Mvc;

namespace backend.Coversongs;

[Route("api/[controller]")]
public class CoversongsController : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok("blabla");
    }
}