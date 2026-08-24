using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SupermarketAPI.Data;
using SupermarketAPI.Interfaces;
using SupermarketAPI.Repositories;
using SupermarketAPI.Services;
using SupermarketAPI.Settings;
using SupermarketAPI.Models.DTOs;

var builder = WebApplication.CreateBuilder(args);

var frontendOrigins = builder.Configuration["FRONTEND_URLS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

if (frontendOrigins is null || frontendOrigins.Length == 0)
{
    frontendOrigins = new[] { "http://localhost:3000", "http://localhost:3001" };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(frontendOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// MongoDB settings are read from environment variables in Render or appsettings locally.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("MongoDb")
        ?? throw new InvalidOperationException(
            "MongoDB connection string was not found. Set ConnectionStrings__MongoDb.");
    var databaseName = builder.Configuration["MongoDb:DatabaseName"]
        ?? throw new InvalidOperationException("MongoDb:DatabaseName was not found.");

    options.UseMongoDB(connectionString, databaseName);
});

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IPosService, PosService>();
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
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Supermarket Management API",
        Version = "v1",
        Description = "Sprint 4 demo-ready API for customer shopping, staff management, inventory, cashier POS, and admin reporting."
    });

    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Description = "Paste a JWT access token here. Example: Bearer {token}",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    options.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [jwtSecurityScheme] = Array.Empty<string>()
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.DocumentTitle = "Supermarket Management API Docs";
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Supermarket Management API v1");
        options.DefaultModelsExpandDepth(-1);
    });
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
                var seededSupervisor = new User
                {
                    Name = string.IsNullOrWhiteSpace(supervisorName) ? "Default Supervisor" : supervisorName,
                    Email = supervisorEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(supervisorPassword),
                    Role = UserRole.Admin,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                seededSupervisor.Id = await MongoIdGenerator.NextAsync(dbContext.Users, u => u.Id);
                dbContext.Users.Add(seededSupervisor);

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


