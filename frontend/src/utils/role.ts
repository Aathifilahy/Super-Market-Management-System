export function normalizeRole(role: unknown): string {
  if (typeof role === 'number') {
    switch (role) {
      case 0:
        return 'Customer';
      case 1:
        return 'Admin';
      case 2:
        return 'InventoryManager';
      case 3:
        return 'Cashier';
      default:
        return String(role);
    }
  }

  if (typeof role === 'string') {
    const normalized = role.trim().toLowerCase();

    switch (normalized) {
      case 'customer':
        return 'Customer';
      case 'admin':
        return 'Admin';
      case 'inventorymanager':
      case 'inventory_manager':
      case 'inventory manager':
        return 'InventoryManager';
      case 'cashier':
        return 'Cashier';
      default:
        return role.trim();
    }
  }

  return '';
}

export function isAdminOrInventoryRole(role: unknown): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'Admin' || normalizedRole === 'InventoryManager';
}

export function isCustomerRole(role: unknown): boolean {
  return normalizeRole(role) === 'Customer';
}
