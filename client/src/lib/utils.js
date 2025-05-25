import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function getImageUrl(url) {
  if (!url) return '/placeholder-book.jpg';
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL}/${url}`;
}

export const bookCategories = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Horror',
  'Romance',
  'Thriller',
  'Adventure',
  'Children',
  'Education',
  'Biography',
];

export const reportReasons = [
  'Unauthorized sales',
  'False Information',
  'Spam',
  'Hate Speech',
  'Terrorism',
  'Violence',
  'Harassment',
  'Something Else',
];