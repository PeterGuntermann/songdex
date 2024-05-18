using Microsoft.AspNetCore.Mvc;

namespace backend.Coversongs;

[Route("api/[controller]")]
public class CoversongsController : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        var song = new Coversong
        {
            Title = "I just wanna live"
        };
        return Ok(song);
    }
}