import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import {
  PosReceipt,
  PosSearchProduct,
  PosSearchResponse,
  PosTransactionHistoryItem,
} from '../services/posApi';
import posApi from '../services/posApi';

const SEARCH_DEBOUNCE_MS = 250;
const MAX_SESSIONS = 4;

const initialSearchState: PosSearchResponse = {
  includeOutOfStock: false,
  totalResults: 0,
  categories: [],
  items: [],
};

type CartItem = PosSearchProduct & {
  quantity: number;
};

type PosSession = {
  id: string;
  name: string;
  items: CartItem[];
};

function createSessionName(index: number): string {
  return `Sale ${index}`;
}

function createEmptySession(index: number): PosSession {
  return {
    id: `session-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    name: createSessionName(index),
    items: [],
  };
}

export default function CashierDashboard() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [includeOutOfStock, setIncludeOutOfStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<PosSearchResponse>(initialSearchState);
  const [sessions, setSessions] = useState<PosSession[]>(() => {
    const initialSession = createEmptySession(1);
    return [initialSession];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
  const [amountTenderedInput, setAmountTenderedInput] = useState('');
  const [simulateCardApproval, setSimulateCardApproval] = useState(true);
  const [receipt, setReceipt] = useState<PosReceipt | null>(null);
  const [historyItems, setHistoryItems] = useState<PosTransactionHistoryItem[]>([]);

  useEffect(() => {
    setActiveSessionId((prev) => prev || sessions[0].id);
  }, [sessions]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0],
    [activeSessionId, sessions]
  );

  const cartItems = useMemo(() => activeSession?.items ?? [], [activeSession]);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await posApi.searchProducts({
        q: searchText.trim() || undefined,
        category: category || undefined,
        barcode: barcode.trim() || undefined,
        includeOutOfStock,
      });

      setSearchResult(response);
      setSessions((prev) =>
        prev.map((session) => ({
          ...session,
          items: session.items
            .map((item) => {
              const latest = response.items.find((candidate) => candidate.id === item.id);
              if (!latest) {
                return item;
              }

              return {
                ...item,
                ...latest,
                quantity: Math.min(item.quantity, latest.availableStock),
              };
            })
            .filter((item) => item.quantity > 0),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load POS products.');
    } finally {
      setIsLoading(false);
    }
  }, [barcode, category, includeOutOfStock, searchText]);

  const loadHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      setHistoryError(null);
      const items = await posApi.getRecentTransactions(10);
      setHistoryItems(items);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load recent transactions.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProducts();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProducts]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const activeSellableItems = useMemo(
    () => searchResult.items.filter((item) => !item.isOutOfStock && !item.isExpired).length,
    [searchResult.items]
  );

  const unavailableItems = useMemo(
    () => searchResult.items.filter((item) => item.isOutOfStock || item.isExpired).length,
    [searchResult.items]
  );

  const hasActiveFilters = Boolean(searchText.trim() || category || barcode.trim());

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const totalItemsInCart = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const amountTendered = useMemo(() => {
    const parsed = Number(amountTenderedInput);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountTenderedInput]);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'Cash') {
      return 0;
    }

    return amountTendered - cartSubtotal;
  }, [amountTendered, cartSubtotal, paymentMethod]);

  const handleResetSearch = () => {
    setSearchText('');
    setCategory('');
    setBarcode('');
    setIncludeOutOfStock(false);
  };

  const updateSessionItems = useCallback((sessionId: string, updater: (items: CartItem[]) => CartItem[]) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              items: updater(session.items),
            }
          : session
      )
    );
  }, []);

  const clearActiveSession = useCallback(
    (showMessage: boolean) => {
      if (!activeSession) {
        return;
      }

      updateSessionItems(activeSession.id, () => []);
      setCheckoutError(null);
      setAmountTenderedInput('');
      setSimulateCardApproval(true);
      setIsPaymentOpen(false);

      if (showMessage) {
        setCartMessage(`${activeSession.name} cleared. Ready for a new customer.`);
      }
    },
    [activeSession, updateSessionItems]
  );

  const handleAddSession = () => {
    if (sessions.length >= MAX_SESSIONS) {
      setCartMessage(`Up to ${MAX_SESSIONS} billing sessions are supported in this demo.`);
      return;
    }

    const nextSession = createEmptySession(sessions.length + 1);
    setSessions((prev) => [...prev, nextSession]);
    setActiveSessionId(nextSession.id);
    setCheckoutError(null);
    setCartMessage(`${nextSession.name} opened.`);
  };

  const handleNewTransaction = () => {
    clearActiveSession(true);
    setReceipt(null);
  };

  const handleAddToCart = (item: PosSearchProduct) => {
    if (!activeSession || item.isOutOfStock || item.isExpired) {
      return;
    }

    updateSessionItems(activeSession.id, (prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (!existing) {
        return [...prev, { ...item, quantity: 1 }];
      }

      return prev.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              ...item,
              quantity: Math.min(cartItem.quantity + 1, item.availableStock),
            }
          : cartItem
      );
    });

    setCartMessage(`${item.name} added to ${activeSession.name}.`);
  };

  const updateCartQuantity = (productId: number, nextQuantity: number) => {
    if (!activeSession) {
      return;
    }

    setCartMessage(null);
    setCheckoutError(null);

    updateSessionItems(activeSession.id, (prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          const safeQuantity = Math.min(Math.max(nextQuantity, 0), item.availableStock);
          return {
            ...item,
            quantity: safeQuantity,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (productId: number) => {
    if (!activeSession) {
      return;
    }

    updateSessionItems(activeSession.id, (prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCheckout = async () => {
    if (!activeSession || cartItems.length === 0) {
      return;
    }

    try {
      setIsCheckoutLoading(true);
      setCheckoutError(null);

      const saleReceipt = await posApi.checkout({
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod,
        amountTendered: paymentMethod === 'Cash' ? amountTendered : undefined,
        simulateCardApproval,
      });

      setReceipt(saleReceipt);
      updateSessionItems(activeSession.id, () => []);
      setIsPaymentOpen(false);
      setCartMessage(`Transaction ${saleReceipt.receiptNumber} completed successfully. ${activeSession.name} is ready for the next customer.`);
      setAmountTenderedInput('');
      setSimulateCardApproval(true);
      await Promise.all([loadProducts(), loadHistory()]);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to complete the transaction.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleOpenHistoryReceipt = async (orderId: number) => {
    try {
      setHistoryError(null);
      const receiptData = await posApi.getReceipt(orderId);
      setReceipt(receiptData);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load receipt.');
    }
  };

  const handlePrintReceipt = () => {
    if (!receipt) {
      return;
    }

    const receiptWindow = window.open('', 'pos-receipt-print', 'width=720,height=900');
    if (!receiptWindow) {
      return;
    }

    const itemsMarkup = receipt.items
      .map(
        (item) => `
          <tr>
            <td>${item.productName}</td>
            <td style="text-align:right;">${item.quantity}</td>
            <td style="text-align:right;">$${item.unitPrice.toFixed(2)}</td>
            <td style="text-align:right;">$${item.lineTotal.toFixed(2)}</td>
          </tr>
        `
      )
      .join('');

    receiptWindow.document.write(`
      <html>
        <head>
          <title>${receipt.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1, p { margin: 0 0 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border-bottom: 1px solid #ddd; padding: 8px 4px; }
            .summary { margin-top: 16px; }
            .summary p { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h1>${receipt.storeName}</h1>
          <p>Receipt: ${receipt.receiptNumber}</p>
          <p>Date: ${new Date(receipt.transactionDateUtc).toLocaleString()}</p>
          <p>Cashier: ${receipt.cashierName}</p>
          <p>Payment: ${receipt.paymentMethod} (${receipt.paymentStatus})</p>
          <table>
            <thead>
              <tr>
                <th style="text-align:left;">Item</th>
                <th style="text-align:right;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsMarkup}</tbody>
          </table>
          <div class="summary">
            <p><span>Subtotal</span><span>$${receipt.subtotal.toFixed(2)}</span></p>
            <p><span>Total</span><span>$${receipt.total.toFixed(2)}</span></p>
            ${
              typeof receipt.amountTendered === 'number'
                ? `<p><span>Tendered</span><span>$${receipt.amountTendered.toFixed(2)}</span></p>`
                : ''
            }
            ${
              typeof receipt.changeGiven === 'number'
                ? `<p><span>Change</span><span>$${receipt.changeGiven.toFixed(2)}</span></p>`
                : ''
            }
            ${receipt.cardAuthorizationCode ? `<p><span>Auth Code</span><span>${receipt.cardAuthorizationCode}</span></p>` : ''}
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
  };

  const renderResultCard = (item: PosSearchProduct) => {
    const disabled = item.isOutOfStock || item.isExpired;

    return (
      <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={item.id}>
        <Card
          sx={{
            height: '100%',
            borderRadius: 3,
            border: '1px solid',
            borderColor: disabled ? 'divider' : 'primary.light',
            opacity: disabled ? 0.72 : 1,
          }}
        >
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {item.name}
                  </Typography>
                  <Typography color="text.secondary">{item.category}</Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                  {item.isOutOfStock ? <Chip size="small" color="error" label="Out of stock" /> : null}
                  {item.isExpired ? <Chip size="small" color="warning" label="Expired" /> : null}
                  {!item.isOutOfStock && !item.isExpired ? <Chip size="small" color="success" label="Ready" /> : null}
                </Stack>
              </Stack>

              <Typography variant="h4" fontWeight={700} color="primary.main">
                ${item.price.toFixed(2)}
              </Typography>

              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Available stock
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {item.availableStock}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Simulated barcode
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {item.simulatedBarcode}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={disabled || !activeSession}
                onClick={() => handleAddToCart(item)}
              >
                {disabled ? 'Unavailable' : `Add to ${activeSession?.name ?? 'Bill'}`}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary">Visible results</Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {searchResult.totalResults}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary">Ready to sell</Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {activeSellableItems}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary">Unavailable shown</Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {unavailableItems}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Product Search
                    </Typography>
                    <Typography color="text.secondary">
                      Search by product name, category, product ID, or simulated barcode like <strong>POS-000123</strong>.
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <TextField
                        fullWidth
                        label="Search name or category"
                        placeholder="Milk, Bakery, POS-000005, or product ID"
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel id="cashier-category-label">Category</InputLabel>
                        <Select
                          labelId="cashier-category-label"
                          label="Category"
                          value={category}
                          onChange={(event) => setCategory(event.target.value)}
                        >
                          <MenuItem value="">All categories</MenuItem>
                          {searchResult.categories.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Barcode"
                        placeholder="POS-000001 or 1"
                        value={barcode}
                        onChange={(event) => setBarcode(event.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch
                        checked={includeOutOfStock}
                        onChange={(event) => setIncludeOutOfStock(event.target.checked)}
                      />
                      <Typography>Show out-of-stock items</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                      <Button variant="outlined" onClick={handleResetSearch}>
                        Clear
                      </Button>
                      <Button variant="contained" size="large" onClick={() => void loadProducts()}>
                        Search Now
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {cartMessage ? <Alert severity="success">{cartMessage}</Alert> : null}

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : searchResult.items.length === 0 ? (
              <Alert severity="info">
                {hasActiveFilters
                  ? 'No matching products were found for the current search.'
                  : 'No sellable products are currently available for POS search.'}
              </Alert>
            ) : (
              <Grid container spacing={2.5}>
                {searchResult.items.map((item) => renderResultCard(item))}
              </Grid>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3, position: { xl: 'sticky' }, top: { xl: 24 } }}>
              <CardContent>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Billing Sessions
                    </Typography>
                    <Typography color="text.secondary">
                      Cashier: {user?.name ?? 'Cashier'}
                    </Typography>
                  </Box>

                  <Tabs
                    value={activeSession?.id ?? false}
                    variant="scrollable"
                    scrollButtons="auto"
                    onChange={(_, value) => setActiveSessionId(value)}
                  >
                    {sessions.map((session) => (
                      <Tab
                        key={session.id}
                        value={session.id}
                        label={`${session.name} (${session.items.reduce((sum, item) => sum + item.quantity, 0)})`}
                      />
                    ))}
                  </Tabs>

                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Button variant="contained" onClick={handleAddSession} disabled={sessions.length >= MAX_SESSIONS}>
                      Add Session
                    </Button>
                    <Button variant="outlined" onClick={handleNewTransaction} disabled={cartItems.length === 0}>
                      New Transaction
                    </Button>
                  </Stack>

                  <Divider />

                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {activeSession?.name ?? 'Current Sale'}
                    </Typography>
                    <Typography color="text.secondary">
                      Resetting this session clears only the active bill.
                    </Typography>
                  </Box>

                  {cartItems.length === 0 ? (
                    <Alert severity="info">Add products from the POS search results to start this bill.</Alert>
                  ) : (
                    <Stack spacing={2}>
                      {cartItems.map((item) => (
                        <Card key={item.id} variant="outlined" sx={{ borderRadius: 3 }}>
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Box>
                                  <Typography fontWeight={700}>{item.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ${item.price.toFixed(2)} each
                                  </Typography>
                                </Box>
                                <Button color="error" onClick={() => removeCartItem(item.id)}>
                                  Remove
                                </Button>
                              </Stack>

                              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Button variant="outlined" onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
                                    -
                                  </Button>
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={item.quantity}
                                    inputProps={{ min: 1, max: item.availableStock }}
                                    onChange={(event) => {
                                      const nextValue = Number(event.target.value);
                                      updateCartQuantity(item.id, Number.isFinite(nextValue) ? nextValue : item.quantity);
                                    }}
                                    sx={{ width: 88 }}
                                  />
                                  <Button
                                    variant="outlined"
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.availableStock}
                                  >
                                    +
                                  </Button>
                                </Stack>

                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Line total
                                  </Typography>
                                  <Typography fontWeight={700}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Typography variant="body2" color="text.secondary">
                                Stock limit: {item.availableStock}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}

                  <Divider />

                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Items</Typography>
                      <Typography fontWeight={700}>{totalItemsInCart}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography fontWeight={700}>${cartSubtotal.toFixed(2)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={700}>
                        Total
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        ${cartSubtotal.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={cartItems.length === 0}
                    onClick={() => {
                      setCheckoutError(null);
                      setIsPaymentOpen(true);
                    }}
                  >
                    Take Payment
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Recent Transactions
                      </Typography>
                      <Typography color="text.secondary">
                        Latest completed POS sales for this cashier.
                      </Typography>
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => void loadHistory()}>
                      Refresh
                    </Button>
                  </Stack>

                  {historyError ? <Alert severity="error">{historyError}</Alert> : null}

                  {isHistoryLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : historyItems.length === 0 ? (
                    <Alert severity="info">No completed POS transactions yet.</Alert>
                  ) : (
                    <Stack spacing={1.5}>
                      {historyItems.map((item) => (
                        <Card key={item.orderId} variant="outlined" sx={{ borderRadius: 3 }}>
                          <CardContent>
                            <Stack spacing={1}>
                              <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Box>
                                  <Typography fontWeight={700}>{item.receiptNumber}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {new Date(item.transactionDateUtc).toLocaleString()}
                                  </Typography>
                                </Box>
                                <Typography fontWeight={700}>${item.total.toFixed(2)}</Typography>
                              </Stack>

                              <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography variant="body2" color="text.secondary">
                                  {item.totalItems} items | {item.paymentMethod}
                                </Typography>
                                <Button size="small" onClick={() => void handleOpenHistoryReceipt(item.orderId)}>
                                  View Receipt
                                </Button>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={isPaymentOpen} onClose={() => (!isCheckoutLoading ? setIsPaymentOpen(false) : undefined)} fullWidth maxWidth="sm">
        <DialogTitle>Payment Simulation</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              {activeSession?.name ?? 'Sale'} total due: <strong>${cartSubtotal.toFixed(2)}</strong>
            </Typography>

            <FormControl fullWidth>
              <InputLabel id="payment-method-label">Payment Method</InputLabel>
              <Select
                labelId="payment-method-label"
                label="Payment Method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as 'Cash' | 'Card')}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
              </Select>
            </FormControl>

            {paymentMethod === 'Cash' ? (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount Tendered"
                  value={amountTenderedInput}
                  onChange={(event) => setAmountTenderedInput(event.target.value)}
                  inputProps={{ min: cartSubtotal, step: '0.01' }}
                />
                <Alert severity={changeDue >= 0 ? 'success' : 'warning'}>
                  {changeDue >= 0
                    ? `Change due: $${changeDue.toFixed(2)}`
                    : `Insufficient cash. Need $${Math.abs(changeDue).toFixed(2)} more.`}
                </Alert>
              </>
            ) : (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Switch
                    checked={simulateCardApproval}
                    onChange={(event) => setSimulateCardApproval(event.target.checked)}
                  />
                  <Typography>{simulateCardApproval ? 'Simulate card approval' : 'Simulate card decline'}</Typography>
                </Stack>
                <Alert severity={simulateCardApproval ? 'info' : 'warning'}>
                  {simulateCardApproval
                    ? 'Card payment will complete successfully.'
                    : 'Card payment will return a controlled authorization failure.'}
                </Alert>
              </>
            )}

            {checkoutError ? <Alert severity="error">{checkoutError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPaymentOpen(false)} disabled={isCheckoutLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleCheckout()}
            disabled={isCheckoutLoading || (paymentMethod === 'Cash' && changeDue < 0)}
          >
            {isCheckoutLoading ? <CircularProgress size={20} color="inherit" /> : 'Complete Sale'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(receipt)} onClose={() => setReceipt(null)} fullWidth maxWidth="md">
        <DialogTitle>Digital Receipt</DialogTitle>
        <DialogContent>
          {receipt ? (
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {receipt.storeName}
                </Typography>
                <Typography color="text.secondary">Receipt #{receipt.receiptNumber}</Typography>
                <Typography color="text.secondary">
                  {new Date(receipt.transactionDateUtc).toLocaleString()}
                </Typography>
                <Typography color="text.secondary">Cashier: {receipt.cashierName}</Typography>
              </Box>

              <Divider />

              <Stack spacing={1.25}>
                {receipt.items.map((item) => (
                  <Stack key={`${receipt.orderId}-${item.productId}`} direction="row" justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography fontWeight={600}>{item.productName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography fontWeight={700}>${item.lineTotal.toFixed(2)}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={700}>${receipt.subtotal.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Total</Typography>
                  <Typography fontWeight={700}>${receipt.total.toFixed(2)}</Typography>
                </Stack>
                {typeof receipt.amountTendered === 'number' ? (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Tendered</Typography>
                    <Typography fontWeight={700}>${receipt.amountTendered.toFixed(2)}</Typography>
                  </Stack>
                ) : null}
                {typeof receipt.changeGiven === 'number' ? (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Change</Typography>
                    <Typography fontWeight={700}>${receipt.changeGiven.toFixed(2)}</Typography>
                  </Stack>
                ) : null}
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Payment</Typography>
                  <Typography fontWeight={700}>
                    {receipt.paymentMethod} ({receipt.paymentStatus})
                  </Typography>
                </Stack>
                {receipt.cardAuthorizationCode ? (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Auth Code</Typography>
                    <Typography fontWeight={700}>{receipt.cardAuthorizationCode}</Typography>
                  </Stack>
                ) : null}
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceipt(null)}>Close</Button>
          <Button variant="outlined" onClick={handlePrintReceipt} disabled={!receipt}>
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
