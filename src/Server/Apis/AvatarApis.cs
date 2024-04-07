[Route("api/[controller]")]
[ApiController]
public class AvatarApis : ControllerBase
{
    private readonly DbContext _context;

    public AvatarApis(DbContext context)
    {
        _context = context;
    }

    [HttpPost("{userId:int}")]
    public async Task<IActionResult> UpdateAvatar(int userId, [FromForm] IFormFile avatar)
    {
        if (avatar == null || avatar.Length == 0)
        {
            return BadRequest("Vui lòng chọn ảnh đại diện.");
        }

        // Kiểm tra định dạng ảnh
        

        // Lưu trữ ảnh
        var avatarFileName = await SaveAvatarAsync(avatar);

        // Cập nhật avatar cho user
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        user.Image = avatarFileName;
        await _context.SaveChangesAsync();

        return Ok(new { avatar = user.Image });
    }

    private async Task<string> SaveAvatarAsync(IFormFile avatar)
    {
        // Tạo thư mục lưu trữ ảnh
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        // Tạo tên file duy nhất
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(avatar.FileName);
        var filePath = Path.Combine(uploadsPath, fileName);

        // Lưu trữ file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await avatar.CopyToAsync(stream);
        }

        return fileName;
    }
}