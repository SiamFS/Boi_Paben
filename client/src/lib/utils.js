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
  // Handle null, undefined, or invalid dates
  if (!date) return 'Unknown date';
  
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    return 'Invalid date';
  }
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

// Filter out books that have been sold for more than 12 hours (for public listings)
export function filterPublicBooks(books, userEmail = null) {
  return books.filter(book => {
    // If user is the owner, show all their books (for dashboard)
    if (userEmail && book.email === userEmail) {
      return true;
    }
    
    // For public listings, hide books sold more than 12 hours ago
    if (book.availability === 'sold' && book.soldAt) {
      const hoursSinceSold = (new Date() - new Date(book.soldAt)) / (1000 * 60 * 60);
      return hoursSinceSold <= 12;
    }
    
    // Ensure book.Price is a number (not a string)
    if (book.Price && typeof book.Price === 'string') {
      book.Price = parseFloat(book.Price);
    }
    
    return true;
  });
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