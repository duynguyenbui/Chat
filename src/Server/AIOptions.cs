namespace Chat.Server;

public class AIOptions
{
    /// <summary>Settings related to the use of OpenAI.</summary>
    public OpenAIOptions OpenAI { get; set; } = new();
}

public class OpenAIOptions
{
    /// <summary>AI Options for model you want to use.</summary>
    public string? BaseUrl { get; set; }

    public string? ApiKey { get; set; }
    public string? ModelName { get; set; }
}