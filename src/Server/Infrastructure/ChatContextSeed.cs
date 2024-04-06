using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace Chat.Server.Infrastructure;

public partial class ChatContextSeed(
    IHostEnvironment env,
    IServiceProvider sp,
    ILogger<ChatContextSeed> logger) : IDbSeeder<ChatContext>
{
    public async Task SeedAsync(ChatContext context)
    {
        var contentRootPath = env.ContentRootPath;
        EmailAddressAttribute _emailAddressAttribute = new();
        // Workaround from https://github.com/npgsql/efcore.pg/issues/292#issuecomment-388608426
        context.Database.OpenConnection();
        ((NpgsqlConnection)context.Database.GetDbConnection()).ReloadTypes();

        if (!context.Users.Any())
        {
            var sourcePath = Path.Combine(contentRootPath, "Setup", "user.json");
            var sourceJson = File.ReadAllText(sourcePath);
            var sourceItems = JsonSerializer.Deserialize<UserSourceEntry[]>(sourceJson);

            context.Users.RemoveRange(context.Users);

            var userManager = sp.GetRequiredService<UserManager<User>>();

            if (!userManager.SupportsUserEmail)
            {
                throw new NotSupportedException($"{nameof(SeedAsync)} requires a user store with email support.");
            }

            foreach (var userSourceEntry in sourceItems)
            {
                var userStore = sp.GetRequiredService<IUserStore<User>>();
                var emailStore = (IUserEmailStore<User>)userStore;
                var email = userSourceEntry.Email;

                if (string.IsNullOrEmpty(email) || !_emailAddressAttribute.IsValid(email))
                {
                    throw new ChatException("Email is not valid");
                }

                var user = new User { Id = userSourceEntry.Id };
                await userStore.SetUserNameAsync(user, email, CancellationToken.None);
                await emailStore.SetEmailAsync(user, email, CancellationToken.None);
                var result = await userManager.CreateAsync(user, userSourceEntry.Password);

                if (!result.Succeeded)
                {
                    throw new ChatException("Seed user failed");
                }
            }

            logger.LogInformation("Seeded user with {NumTypes} types", context.Users.Count());
        }
    }

    private class UserSourceEntry
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}