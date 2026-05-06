import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Box,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalRows?: number;
  emptyMessage?: string;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<T>(
  order: Order,
  orderBy: keyof T,
): (a: T, b: T) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  keyField,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  totalRows,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const theme = useTheme();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>(columns[0].id as keyof T);

  const handleRequestSort = (property: keyof T) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isClientPagination = onPageChange === undefined;
  
  const [clientPage, setClientPage] = useState(0);
  const [clientRowsPerPage, setClientRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    if (isClientPagination) {
      setClientPage(newPage);
    } else if (onPageChange) {
      onPageChange(event, newPage);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isClientPagination) {
      setClientRowsPerPage(+event.target.value);
      setClientPage(0);
    } else if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    }
  };

  const currentData = isClientPagination
    ? stableSort(data, getComparator(order, orderBy)).slice(
        clientPage * clientRowsPerPage,
        clientPage * clientRowsPerPage + clientRowsPerPage,
      )
    : stableSort(data, getComparator(order, orderBy)); // Assume server handles pagination if provided, but sort locally for now (might need refactoring if server sorting is needed)

  const displayPage = isClientPagination ? clientPage : page;
  const displayRowsPerPage = isClientPagination ? clientRowsPerPage : rowsPerPage;
  const displayTotal = totalRows !== undefined ? totalRows : data.length;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: theme.shadows[1], borderRadius: 2 }}>
      <TableContainer>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id as keyof T)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={String(row[keyField] || index)} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha(theme.palette.primary.main, 0.02) } }}>
                    {columns.map((column) => {
                      const value = row[column.id as keyof T];
                      return (
                        <TableCell key={String(column.id)} align={column.align}>
                          {column.format ? column.format(value, row) : (value as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={displayTotal}
        rowsPerPage={displayRowsPerPage}
        page={displayPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
