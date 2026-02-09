import { useState, useCallback, useMemo } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  reset: () => void;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(options: PaginationOptions = {}): [PaginationState, PaginationActions] {
  const { initialPage = 1, initialPageSize = 20 } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const setPage = useCallback((newPage: number) => {
    console.log('📄 usePagination.setPage chamado:', { newPage, currentPage: page });
    setPageState(Math.max(1, newPage));
  }, [page]);

  const nextPage = useCallback(() => {
    setPageState(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageState(prev => Math.max(1, prev - 1));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPageState(1); // Reset to first page when page size changes
  }, []);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItems(0);
  }, [initialPage, initialPageSize]);

  const state: PaginationState = useMemo(() => ({
    page,
    pageSize,
    totalItems,
    totalPages,
  }), [page, pageSize, totalItems, totalPages]);

  const actions: PaginationActions = useMemo(() => ({
    setPage,
    nextPage,
    prevPage,
    setPageSize,
    setTotalItems,
    reset,
  }), [setPage, nextPage, prevPage, setPageSize, reset]);

  return [state, actions];
}
