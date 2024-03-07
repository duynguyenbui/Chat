namespace Chat.Server.Services;

public class IdentityService(IHttpContextAccessor context, UserManager<User>? userManager) : IIdentityService
{
    public string GetUserIdentity()
        => context.HttpContext?.User.FindFirst(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;

    public string GetUserName()
        => context.HttpContext?.User.Identity?.Name;

    public async Task<User?> GetCurrentUser()
    {
        var userId = GetUserIdentity();
        if (string.IsNullOrEmpty(userId)) return null;
        var user = await userManager.FindByIdAsync(userId);
        return user ?? null;
    }
}