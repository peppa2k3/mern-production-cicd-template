import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatCurrency(value) {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

export function formatCommission(product) {
  if (!product) return '';
  return product.commissionType === 'percent'
    ? `${product.commissionValue}%`
    : formatCurrency(product.commissionValue);
}

export function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(date)
  );
}

export function slugParam(value) {
  return encodeURIComponent(value);
}
