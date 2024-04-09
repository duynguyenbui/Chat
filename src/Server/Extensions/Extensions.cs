using OpenAI.Net;

namespace Chat.Server.Extensions;

public static partial class Extensions
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddDbContext<ChatContext>(
            options => options.UseNpgsql(builder.Configuration.GetConnectionString("ChatDB")));

        // NOTE: This is done for development ease but shouldn't be here in production
        builder.Services.AddMigration<ChatContext, ChatContextSeed>();

        builder.Services.AddAuthorization();

        builder.Services.AddIdentityApiEndpoints<User>(options => { options.User.RequireUniqueEmail = true; })
            .AddEntityFrameworkStores<ChatContext>();

        // options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddTransient<IIdentityService, IdentityService>();

        // Just setting the name of XSRF token
        // builder.Services.AddAntiforgery(options => { options.HeaderName = "X-XSRF-TOKEN" });

        builder.Services.AddCors(options => options.AddPolicy("client", pb =>
            pb.WithOrigins(builder.Configuration.GetSection("Client").GetRequiredValue("BaseUrl"))
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials()));

        builder.Services.AddSignalR();
        builder.Services.AddOptions<ChatOptions>()
            .BindConfiguration(nameof(ChatOptions));

        // AI Options Binding
        builder.Services.AddOptions<AIOptions>()
            .BindConfiguration(nameof(AIOptions));

        if (builder.Configuration.GetSection("AI") != null)
        {
            builder.Services.AddOpenAIServices(options =>
            {
                options.ApiUrl = builder.Configuration["AI:OpenAI:BaseUrl"]!;
                options.ApiKey = builder.Configuration["AI:OpenAI:ApiKey"]!;
            });
        }

        builder.Services.AddScoped<IChatAI, ChatAI>();
    }
}