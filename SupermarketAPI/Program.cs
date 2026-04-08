using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MySqlConnector;
using SupermarketAPI.Data;
using SupermarketAPI.Interfaces;
using SupermarketAPI.Repositories;
using SupermarketAPI.Services;
using SupermarketAPI.Settings;
using SupermarketAPI.Models.DTOs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Connection string is read from:
// - Azure App Service: ConnectionStrings__DefaultConnection environment variable
// - Local development: appsettings.json / appsettings.Development.json
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException(
            "DefaultConnection connection string was not found. " +
            "Set the 'ConnectionStrings__DefaultConnection' environment variable in Azure App Service, " +
            "or define it in appsettings.json for local development.");

    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddAutoMapper(typeof(Program));

var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt configuration section is missing.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters long.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var startupLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var autoMigrateOnStartup = builder.Configuration.GetValue<bool>("AutoMigrateOnStartup");

    try
    {
        if (!dbContext.Database.CanConnect())
        {
            startupLogger.LogError("Database connection check failed. Verify MySQL host, port, user, password, and authentication plugin settings.");
        }

        if (autoMigrateOnStartup)
        {
            dbContext.Database.Migrate();
            startupLogger.LogInformation("Database migrations applied successfully.");
        }
        else
        {
            startupLogger.LogInformation("Skipping automatic migrations in Development. Set AutoMigrateOnStartup=true to enable.");
        }
    }
    catch (MySqlException ex)
    {
        startupLogger.LogError(ex,
            "MySQL connection failed. Ensure user 'root' can authenticate with caching_sha2_password and connection string options include SslMode=None and AllowPublicKeyRetrieval=True.");
    }
    catch (Exception ex)
    {
        startupLogger.LogError(ex, "Database migration failed during startup.");
    }

    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsProduction())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var startupLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        startupLogger.LogInformation("Production environment detected. Applying EF Core migrations...");
        dbContext.Database.Migrate();
        startupLogger.LogInformation("EF Core migrations applied successfully.");
    }
    catch (Exception ex)
    {
        startupLogger.LogError(ex, "An error occurred while applying EF Core migrations on startup.");
        throw;
    }
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var startupLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        var supervisorEmail = builder.Configuration["Supervisor:Email"]?.Trim().ToLowerInvariant();
        var supervisorPassword = builder.Configuration["Supervisor:Password"];
        var supervisorName = builder.Configuration["Supervisor:Name"]?.Trim();

        if (string.IsNullOrWhiteSpace(supervisorEmail) || string.IsNullOrWhiteSpace(supervisorPassword))
        {
            startupLogger.LogInformation("Skipping supervisor seeding because Supervisor:Email or Supervisor:Password is missing.");
        }
        else
        {
            var supervisorUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == supervisorEmail);

            if (supervisorUser is null)
            {
                dbContext.Users.Add(new User
                {
                    Name = string.IsNullOrWhiteSpace(supervisorName) ? "Default Supervisor" : supervisorName,
                    Email = supervisorEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(supervisorPassword),
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });

                await dbContext.SaveChangesAsync();
                startupLogger.LogInformation("Supervisor user seeded successfully for {SupervisorEmail}.", supervisorEmail);
            }
            else
            {
                var updated = false;

                if (supervisorUser.Role != UserRole.Admin)
                {
                    supervisorUser.Role = UserRole.Admin;
                    updated = true;
                }

                if (!supervisorUser.IsActive)
                {
                    supervisorUser.IsActive = true;
                    updated = true;
                }

                if (!string.IsNullOrWhiteSpace(supervisorName) && supervisorUser.Name != supervisorName)
                {
                    supervisorUser.Name = supervisorName;
                    updated = true;
                }

                if (updated)
                {
                    supervisorUser.UpdatedAt = DateTime.UtcNow;
                    await dbContext.SaveChangesAsync();
                    startupLogger.LogInformation("Supervisor user updated for {SupervisorEmail}.", supervisorEmail);
                }
            }
        }
    }
    catch (Exception ex)
    {
        startupLogger.LogError(ex, "Supervisor seeding failed during startup.");
    }
}

// app.UseHttpsRedirection(); // Disabled to allow HTTP from React frontend
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


