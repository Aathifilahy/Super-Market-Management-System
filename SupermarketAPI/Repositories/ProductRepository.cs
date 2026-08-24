using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.Interfaces;
using SupermarketAPI.Models;

namespace SupermarketAPI.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProductRepository> _logger;

    public ProductRepository(ApplicationDbContext context, ILogger<ProductRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync()
    {
        try
        {
            return await _context.Products
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all products.");
            throw;
        }
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        try
        {
            return await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get product by id {ProductId}.", id);
            throw;
        }
    }

    public async Task<IReadOnlyList<Product>> GetByCategoryAsync(string category)
    {
        try
        {
            return await _context.Products
                .AsNoTracking()
                .Where(p => p.Category == category)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get products for category {Category}.", category);
            throw;
        }
    }

    public async Task<IReadOnlyList<Product>> GetLowStockProductsAsync(int threshold)
    {
        try
        {
            return await _context.Products
                .AsNoTracking()
                .Where(p => p.Quantity < threshold)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get low stock products with threshold {Threshold}.", threshold);
            throw;
        }
    }

    public async Task<Product> CreateAsync(Product product)
    {
        try
        {
            product.Id = await MongoIdGenerator.NextAsync(_context.Products, p => p.Id);
            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
            return product;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create product.");
            throw;
        }
    }

    public async Task<Product?> UpdateAsync(Product product)
    {
        try
        {
            var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == product.Id);
            if (existingProduct is null)
            {
                return null;
            }

            _context.Entry(existingProduct).CurrentValues.SetValues(product);
            await _context.SaveChangesAsync();
            return existingProduct;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update product {ProductId}.", product.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var existingProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (existingProduct is null)
            {
                return false;
            }

            _context.Products.Remove(existingProduct);
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete product {ProductId}.", id);
            throw;
        }
    }

    public async Task<bool> ExistsAsync(int id)
    {
        try
        {
            return await _context.Products
                .AsNoTracking()
                .AnyAsync(p => p.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check existence for product {ProductId}.", id);
            throw;
        }
    }
}
