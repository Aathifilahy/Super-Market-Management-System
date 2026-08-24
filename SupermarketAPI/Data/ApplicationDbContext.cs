using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Models;
using SupermarketAPI.Models.DTOs;

namespace SupermarketAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<StockPurchase> StockPurchases => Set<StockPurchase>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(p => p.Category)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(p => p.Price)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(p => p.Quantity)
                .IsRequired();

            entity.Property(p => p.LowStockThreshold)
                .IsRequired(false);

            entity.Property(p => p.ExpiryDate)
                .IsRequired();

            entity.Property(p => p.ImageUrl)
                .HasMaxLength(2048);

            entity.Property(p => p.CreatedAt)
                .IsRequired();

            entity.HasIndex(p => p.Name);
            entity.HasIndex(p => p.Category);
            entity.HasIndex(p => p.ExpiryDate);
            entity.HasIndex(p => p.Quantity);
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.HasKey(s => s.Id);

            entity.Property(s => s.CompanyName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(s => s.ContactPerson)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(s => s.Email)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(s => s.Phone)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(s => s.Address)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(s => s.TaxIdOrVatNumber)
                .HasMaxLength(50);

            entity.Property(s => s.CreatedAt)
                .IsRequired();

            entity.HasIndex(s => s.CompanyName);
            entity.HasIndex(s => s.Email);
            entity.HasIndex(s => s.IsActive);
        });

        modelBuilder.Entity<StockPurchase>(entity =>
        {
            entity.HasKey(sp => sp.Id);

            entity.Property(sp => sp.Quantity)
                .IsRequired();

            entity.Property(sp => sp.PurchasePrice)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(sp => sp.PurchaseDate)
                .IsRequired();

            entity.Property(sp => sp.CreatedAt)
                .IsRequired();

            entity.HasIndex(sp => sp.SupplierId);
            entity.HasIndex(sp => sp.ProductId);
            entity.HasIndex(sp => sp.PurchaseDate);

            entity.HasOne(sp => sp.Supplier)
                .WithMany(s => s.StockPurchases)
                .HasForeignKey(sp => sp.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(sp => sp.Product)
                .WithMany()
                .HasForeignKey(sp => sp.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(u => u.Address)
                .HasMaxLength(500);

            entity.Property(u => u.Phone)
                .HasMaxLength(20);

            entity.Property(u => u.CreatedAt)
                .IsRequired();
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(c => c.Id);

            entity.Property(c => c.CreatedAt)
                .IsRequired();

            entity.Property(c => c.UpdatedAt)
                .IsRequired();

            entity.HasIndex(c => new { c.UserId, c.IsActive });

            entity.HasMany(c => c.Items)
                .WithOne(ci => ci.Cart)
                .HasForeignKey(ci => ci.CartId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(ci => ci.Id);

            entity.Property(ci => ci.Quantity)
                .IsRequired();

            entity.Property(ci => ci.Price)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(ci => ci.AddedAt)
                .IsRequired();

            entity.HasIndex(ci => new { ci.CartId, ci.ProductId })
                .IsUnique();

            entity.HasOne(ci => ci.Product)
                .WithMany()
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(o => o.Id);

            entity.Property(o => o.OrderDate)
                .IsRequired();

            entity.Property(o => o.TotalAmount)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(o => o.Status)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(o => o.ShippingAddress)
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(o => o.PaymentMethod)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(o => o.PaymentStatus)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(o => o.CreatedAt)
                .IsRequired();

            entity.HasIndex(o => o.UserId);
            entity.HasIndex(o => o.Status);
            entity.HasIndex(o => o.PaymentStatus);

            entity.HasMany(o => o.Items)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(oi => oi.Id);

            entity.Property(oi => oi.Quantity)
                .IsRequired();

            entity.Property(oi => oi.Price)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(oi => oi.ProductName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(oi => oi.ProductCategory)
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(oi => oi.OrderId);
            entity.HasIndex(oi => oi.ProductId);

            entity.HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
