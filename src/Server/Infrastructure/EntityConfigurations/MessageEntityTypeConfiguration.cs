using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Chat.Server.Infrastructure.EntityConfigurations;

public class MessageEntityTypeConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("Messages");

        builder.Property(m => m.Content)
            .HasMaxLength(300);

        builder.HasOne(m => m.Sender)
            .WithMany(u => u.Messages)
            .HasForeignKey(m => m.SenderId);

        builder.HasMany(m => m.Seen)
            .WithMany(u => u.SeenMessages);

    }
}