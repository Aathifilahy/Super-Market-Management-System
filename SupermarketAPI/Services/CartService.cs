using Microsoft.EntityFrameworkCore;
using SupermarketAPI.Data;
using SupermarketAPI.Interfaces;
using SupermarketAPI.Models;
using SupermarketAPI.Models.DTOs;

namespace SupermarketAPI.Services;

public class CartService : ICartService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<CartService> _logger;

    public CartService(ApplicationDbContext dbContext, ILogger<CartService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<CartResponseDto> GetCart(int userId)
    {
        try
        {
            await EnsureActiveUserExists(userId);
            var cart = await GetOrCreateActiveCart(userId);
            return await BuildCartResponse(cart.Id);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Error occurred while getting cart for user {UserId}.", userId);
            throw;
        }
    }

    public async Task<CartResponseDto> AddToCart(int userId, AddToCartDto dto)
    {
        try
        {
            await EnsureActiveUserExists(userId);

            if (dto.Quantity <= 0)
            {
                throw new ArgumentException("Quantity must be greater than zero.");
            }

            var product = await _dbContext.Products
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

            if (product is null)
            {
                throw new KeyNotFoundException("Product not found.");
            }

            var cart = await GetOrCreateActiveCart(userId);

            var existingItem = await _dbContext.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == dto.ProductId);

            var requestedQuantity = dto.Quantity + (existingItem?.Quantity ?? 0);
            if (requestedQuantity > product.Quantity)
            {
                throw new InvalidOperationException("Requested quantity exceeds available stock.");
            }

            if (existingItem is null)
            {
                existingItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = product.Id,
                    Quantity = dto.Quantity,
                    Price = product.Price,
                    AddedAt = DateTime.UtcNow
                };

                existingItem.Id = await MongoIdGenerator.NextAsync(_dbContext.CartItems, ci => ci.Id);

                _dbContext.CartItems.Add(existingItem);
            }
            else
            {
                existingItem.Quantity = requestedQuantity;
                existingItem.Price = product.Price;
                existingItem.AddedAt = DateTime.UtcNow;
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return await BuildCartResponse(cart.Id);
        }
        catch (Exception ex) when (ex is not ArgumentException && ex is not KeyNotFoundException && ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "Error occurred while adding product {ProductId} to cart for user {UserId}.", dto.ProductId, userId);
            throw;
        }
    }

    public async Task<CartResponseDto> UpdateCartItem(int userId, int cartItemId, UpdateCartItemDto dto)
    {
        try
        {
            await EnsureActiveUserExists(userId);

            if (dto.Quantity < 0)
            {
                throw new ArgumentException("Quantity cannot be negative.");
            }

            var cart = await GetActiveCart(userId)
                ?? throw new KeyNotFoundException("Active cart not found.");

            var cartItem = await _dbContext.CartItems
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.CartId == cart.Id);

            if (cartItem is null)
            {
                throw new KeyNotFoundException("Cart item not found.");
            }

            if (dto.ProductId != cartItem.ProductId)
            {
                throw new ArgumentException("ProductId does not match the cart item.");
            }

            if (dto.Quantity == 0)
            {
                _dbContext.CartItems.Remove(cartItem);
            }
            else
            {
                var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == cartItem.ProductId)
                    ?? throw new KeyNotFoundException("Product not found.");

                if (dto.Quantity > product.Quantity)
                {
                    throw new InvalidOperationException("Requested quantity exceeds available stock.");
                }

                cartItem.Quantity = dto.Quantity;
                cartItem.Price = product.Price;
                cartItem.AddedAt = DateTime.UtcNow;
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return await BuildCartResponse(cart.Id);
        }
        catch (Exception ex) when (ex is not ArgumentException && ex is not KeyNotFoundException && ex is not InvalidOperationException)
        {
            _logger.LogError(ex, "Error occurred while updating cart item {CartItemId} for user {UserId}.", cartItemId, userId);
            throw;
        }
    }

    public async Task<CartResponseDto> RemoveFromCart(int userId, int cartItemId)
    {
        try
        {
            await EnsureActiveUserExists(userId);

            var cart = await GetActiveCart(userId)
                ?? throw new KeyNotFoundException("Active cart not found.");

            var cartItem = await _dbContext.CartItems
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.CartId == cart.Id);

            if (cartItem is null)
            {
                throw new KeyNotFoundException("Cart item not found.");
            }

            _dbContext.CartItems.Remove(cartItem);
            cart.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return await BuildCartResponse(cart.Id);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Error occurred while removing cart item {CartItemId} for user {UserId}.", cartItemId, userId);
            throw;
        }
    }

    public async Task<CartResponseDto> ClearCart(int userId)
    {
        try
        {
            await EnsureActiveUserExists(userId);

            var cart = await GetActiveCart(userId)
                ?? throw new KeyNotFoundException("Active cart not found.");

            var cartItems = await _dbContext.CartItems
                .Where(ci => ci.CartId == cart.Id)
                .ToListAsync();

            if (cartItems.Count > 0)
            {
                _dbContext.CartItems.RemoveRange(cartItems);
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return await BuildCartResponse(cart.Id);
        }
        catch (Exception ex) when (ex is not KeyNotFoundException)
        {
            _logger.LogError(ex, "Error occurred while clearing cart for user {UserId}.", userId);
            throw;
        }
    }

    private async Task EnsureActiveUserExists(int userId)
    {
        var userExists = await _dbContext.Users
            .AnyAsync(u => u.Id == userId && u.IsActive);

        if (!userExists)
        {
            throw new KeyNotFoundException("User not found or inactive.");
        }
    }

    private async Task<Cart?> GetActiveCart(int userId)
    {
        var cart = await _dbContext.Carts
            .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);

        if (cart is not null)
        {
            cart.Items = await _dbContext.CartItems
                .Where(ci => ci.CartId == cart.Id)
                .ToListAsync();
        }

        return cart;
    }

    private async Task<Cart> GetOrCreateActiveCart(int userId)
    {
        var cart = await GetActiveCart(userId);
        if (cart is not null)
        {
            return cart;
        }

        cart = new Cart
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        cart.Id = await MongoIdGenerator.NextAsync(_dbContext.Carts, c => c.Id);

        _dbContext.Carts.Add(cart);
        await _dbContext.SaveChangesAsync();

        return cart;
    }

    private async Task<CartResponseDto> BuildCartResponse(int cartId)
    {
        var cart = await _dbContext.Carts
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == cartId)
            ?? throw new KeyNotFoundException("Cart not found.");

        var cartItems = await _dbContext.CartItems
            .AsNoTracking()
            .Where(ci => ci.CartId == cartId)
            .ToListAsync();

        var products = new Dictionary<int, Product>();
        foreach (var productId in cartItems.Select(ci => ci.ProductId).Distinct())
        {
            var product = await _dbContext.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product is not null)
            {
                products[productId] = product;
            }
        }

        var items = cartItems
            .OrderByDescending(ci => ci.AddedAt)
            .Select(ci => new CartItemDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = products.TryGetValue(ci.ProductId, out var product) ? product.Name : string.Empty,
                Quantity = ci.Quantity,
                Price = ci.Price,
                LineTotal = ci.Quantity * ci.Price,
                AddedAt = ci.AddedAt
            })
            .ToList();

        return new CartResponseDto
        {
            CartId = cart.Id,
            UserId = cart.UserId,
            TotalItems = items.Sum(i => i.Quantity),
            TotalAmount = items.Sum(i => i.LineTotal),
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            Items = items
        };
    }
}
