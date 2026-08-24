using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace SupermarketAPI.Data;

public static class MongoIdGenerator
{
    public static async Task<int> NextAsync<TEntity>(
        IQueryable<TEntity> query,
        Expression<Func<TEntity, int>> idSelector)
        where TEntity : class
    {
        var highestId = await query
            .AsNoTracking()
            .OrderByDescending(idSelector)
            .Select(idSelector)
            .FirstOrDefaultAsync();

        return highestId + 1;
    }
}
