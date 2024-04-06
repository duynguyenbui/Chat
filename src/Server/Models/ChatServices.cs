namespace Chat.Server.Services;

public class ChatServices(
    ChatContext context,
    ILogger<ChatServices> logger,
    IOptions<ChatOptions> options,
    IHubContext<ChatHub> hubContext,
    IIdentityService identityService,
    UserManager<User> userManager)
{
    public ChatContext Context { get; } = context;
    public ILogger<ChatServices> Logger { get; } = logger;
    public IOptions<ChatOptions> Options { get; } = options;
    public IHubContext<ChatHub> HubContext { get; } = hubContext;
    public IIdentityService IdentityService { get; } = identityService;
    public UserManager<User> UserManager { get; } = userManager;
}