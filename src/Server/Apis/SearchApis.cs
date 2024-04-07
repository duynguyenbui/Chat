using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Chat.Server.Models;

[Route("api/[controller]")]
[ApiController]
public class SearchApis : ControllerBase
{
    private readonly ChatContext _context;

    public SearchApis(ChatContext context)
    {
        _context = context;
    }

    // POST: api/Search
    [HttpPost]
    public async Task<ActionResult<IEnumerable<Message>>> SearchMess([FromBody] SearchRequest request)
    {
        var messages = await _context.Messages
            .Where(m => string.Equals(m.ConversationId, request.ConversationId))
            .Where(m => m.MessageText.Contains(request.Key))
            .OrderByDescending(m => m.CreatedAt)
            .Take(request.Limit)
            .ToListAsync();

        return Ok(messages);
    }
}

public class SearchRequest
{
    public int ConversationId { get; set; }
    public string Key { get; set; }
    public int Limit { get; set; }
}
