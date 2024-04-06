namespace Chat.Server.Infrastructure;

/// <remarks>
/// Add migrations using the following command inside the 'Server' project directory:
///
/// dotnet ef migrations add --context ChatContext [migration-name]
/// </remarks>
public class ChatContext(DbContextOptions<ChatContext> options) : IdentityDbContext<User>(options)
{
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Customize the ASP.NET Identity model and override the defaults if needed.
        // For example, you can rename the ASP.NET Identity table names and more.
        // Add your customizations after calling base.OnModelCreating(builder);
        base.OnModelCreating(builder);
        builder.ApplyConfiguration(new UserEntityTypeConfiguration());
        builder.ApplyConfiguration(new ConversationEntityTypeConfiguration());
        builder.ApplyConfiguration(new MessageEntityTypeConfiguration());
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            var tableName = entityType.GetTableName();
            if (tableName != null && tableName.StartsWith("AspNet"))
            {
                entityType.SetTableName(tableName[6..]);
            }
        }
    }
}