using SupermarketAPI.DTOs;

namespace SupermarketAPI.Interfaces;

public interface IPosService
{
    Task<PosReceiptDto> CheckoutAsync(int cashierUserId, PosCheckoutRequestDto dto);
    Task<PosReceiptDto> GetReceiptAsync(int orderId, int? cashierUserId, bool isAdmin);
    Task<IReadOnlyList<PosTransactionHistoryItemDto>> GetRecentTransactionsAsync(int cashierUserId, int limit);
}
