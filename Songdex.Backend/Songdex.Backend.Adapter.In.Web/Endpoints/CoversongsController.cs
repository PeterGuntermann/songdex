using Microsoft.AspNetCore.Mvc;
using Songdex.Backend.Application.Port.In;

namespace Songdex.Backend.Adapter.In.Web.Endpoints;

[Route("api/[controller]")]
public class CoversongsController(IGetAllSongsUseCase getAllSongs) : Controller
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(getAllSongs.GetAllSongs());
    }
}
