using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Chat.Server.Infrastructure.EntityConfigurations;

public class ConversationEntityTypeConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("Conversations");

        builder.Property(c => c.Name)
            .HasMaxLength(100);

        builder.HasMany(c => c.Messages)
            .WithOne(m => m.Conversation)
            .HasForeignKey(m => m.ConversationId);

        builder.HasMany(c => c.Users)
            .WithMany(u => u.Conversations);
    }
}