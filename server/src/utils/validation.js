// Backend validation utilities
import DOMPurify from 'isomorphic-dompurify';

// Validation limits matching frontend
export const VALIDATION_LIMITS = {
  BOOK_TITLE: { min: 3, max: 150 },
  AUTHOR_NAME: { min: 2, max: 100 },
  DESCRIPTION: { min: 10, max: 2000 },
  CONTACT_NUMBER: { min: 10, max: 15 },
  PUBLISHER: { min: 2, max: 100 },
  EDITION: { min: 1, max: 50 },
  ADDRESS: { min: 5, max: 200 },
  CITY: { min: 2, max: 100 },
  DISTRICT: { min: 2, max: 100 },
  ZIP_CODE: { min: 4, max: 10 },
  PRICE: { min: 1, max: 50000 },
  IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Sanitize text input to prevent XSS
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return DOMPurify.sanitize(text.trim(), { ALLOWED_TAGS: [] });
};

// Validate book title
export const validateBookTitle = (title) => {
  const errors = [];
  const sanitized = sanitizeText(title);
  
  if (!sanitized || sanitized.length < VALIDATION_LIMITS.BOOK_TITLE.min) {
    errors.push(`Book title must be at least ${VALIDATION_LIMITS.BOOK_TITLE.min} characters`);
  }
  
  if (sanitized.length > VALIDATION_LIMITS.BOOK_TITLE.max) {
    errors.push(`Book title cannot exceed ${VALIDATION_LIMITS.BOOK_TITLE.max} characters`);
  }
  
  // Check for suspicious patterns that might indicate SQL injection attempts
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i;
  if (sqlPatterns.test(sanitized)) {
    errors.push('Invalid characters detected in book title');
  }
  
  return { isValid: errors.length === 0, errors, sanitized };
};

// Validate author name
export const validateAuthorName = (name) => {
  const errors = [];
  const sanitized = sanitizeText(name);
  
  if (!sanitized || sanitized.length < VALIDATION_LIMITS.AUTHOR_NAME.min) {
    errors.push(`Author name must be at least ${VALIDATION_LIMITS.AUTHOR_NAME.min} characters`);
  }
  
  if (sanitized.length > VALIDATION_LIMITS.AUTHOR_NAME.max) {
    errors.push(`Author name cannot exceed ${VALIDATION_LIMITS.AUTHOR_NAME.max} characters`);
  }
  
  // Basic name validation - allow letters, spaces, dots, apostrophes
  const namePattern = /^[a-zA-Z\s.'-]+$/;
  if (sanitized && !namePattern.test(sanitized)) {
    errors.push('Author name contains invalid characters');
  }
  
  return { isValid: errors.length === 0, errors, sanitized };
};

// Validate description
export const validateDescription = (description) => {
  const errors = [];
  const sanitized = sanitizeText(description);
  
  if (!sanitized || sanitized.length < VALIDATION_LIMITS.DESCRIPTION.min) {
    errors.push(`Description must be at least ${VALIDATION_LIMITS.DESCRIPTION.min} characters`);
  }
  
  if (sanitized.length > VALIDATION_LIMITS.DESCRIPTION.max) {
    errors.push(`Description cannot exceed ${VALIDATION_LIMITS.DESCRIPTION.max} characters`);
  }
  
  // Check for suspicious SQL patterns
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/i;
  if (sqlPatterns.test(sanitized)) {
    errors.push('Invalid characters detected in description');
  }
  
  return { isValid: errors.length === 0, errors, sanitized };
};

// Validate price
export const validatePrice = (price) => {
  const errors = [];
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice) || numPrice < VALIDATION_LIMITS.PRICE.min) {
    errors.push(`Price must be at least ${VALIDATION_LIMITS.PRICE.min} BDT`);
  }
  
  if (numPrice > VALIDATION_LIMITS.PRICE.max) {
    errors.push(`Price cannot exceed ${VALIDATION_LIMITS.PRICE.max} BDT`);
  }
  
  return { isValid: errors.length === 0, errors, sanitized: numPrice };
};

// Validate contact number
export const validateContactNumber = (contactNumber) => {
  const errors = [];
  const sanitized = sanitizeText(contactNumber);
  
  if (!sanitized || sanitized.length < VALIDATION_LIMITS.CONTACT_NUMBER.min) {
    errors.push('Contact number is required');
  }
  
  if (sanitized.length > VALIDATION_LIMITS.CONTACT_NUMBER.max) {
    errors.push('Contact number is too long');
  }
  
  // Bangladesh phone number validation
  const bdPhonePattern = /^(\+880|880|0)?[13-9]\d{8,9}$/;
  const intlPhonePattern = /^\+[1-9]\d{1,14}$/;
  
  if (sanitized && !bdPhonePattern.test(sanitized) && !intlPhonePattern.test(sanitized)) {
    errors.push('Invalid phone number format');
  }
  
  return { isValid: errors.length === 0, errors, sanitized };
};

// Validate category
export const validateCategory = (category) => {
  const errors = [];
  const sanitized = sanitizeText(category);
  
  const validCategories = [
    'Fiction', 'Non-Fiction', 'Academic', 'Textbook', 'Religious',
    'Biography', 'History', 'Science', 'Technology', 'Children',
    'Poetry', 'Drama', 'Mystery', 'Romance', 'Self-Help', 'Other'
  ];
  
  if (!validCategories.includes(sanitized)) {
    errors.push('Invalid category selected');
  }
  
  return { isValid: errors.length === 0, errors, sanitized };
};

// Validate address fields
export const validateAddress = (address, fieldName, required = true) => {
  const errors = [];
  const sanitized = sanitizeText(address);
  
  if (required && (!sanitized || sanitized.length === 0)) {
    errors.push(`${fieldName} is required`);
  }
  
  const maxLength = VALIDATION_LIMITS[fieldName.toUpperCase().replace(/\s/g, '_')] || 
                    VALIDATION_LIMITS.ADDRESS;
  
  if (sanitized.length > maxLength.max || sanitized.length > maxLength) {
    const limit = maxLength.max || maxLength;
    errors.push(`${fieldName} cannot exceed ${limit} characters`);
  }
  
  return { isValid: errors.length === 0, errors, sanitized };
};

// Validate optional text fields
export const validateOptionalText = (text, fieldName, maxLength) => {
  const errors = [];
  const sanitized = sanitizeText(text);
  
  if (sanitized && sanitized.length > maxLength) {
    errors.push(`${fieldName} cannot exceed ${maxLength} characters`);
  }
  
  return { isValid: errors.length === 0, errors, sanitized };
};

// Helper function to validate required book fields
const validateRequiredBookFields = (bookData) => {
  const errors = {};
  const sanitizedData = {};
  
  const titleValidation = validateBookTitle(bookData.bookTitle);
  if (!titleValidation.isValid) errors.bookTitle = titleValidation.errors;
  sanitizedData.bookTitle = titleValidation.sanitized;
  
  const authorValidation = validateAuthorName(bookData.authorName);
  if (!authorValidation.isValid) errors.authorName = authorValidation.errors;
  sanitizedData.authorName = authorValidation.sanitized;
  
  const descriptionValidation = validateDescription(bookData.bookDescription);
  if (!descriptionValidation.isValid) errors.bookDescription = descriptionValidation.errors;
  sanitizedData.bookDescription = descriptionValidation.sanitized;
  
  const priceValidation = validatePrice(bookData.Price);
  if (!priceValidation.isValid) errors.Price = priceValidation.errors;
  sanitizedData.Price = priceValidation.sanitized;
  
  const contactValidation = validateContactNumber(bookData.contactNumber);
  if (!contactValidation.isValid) errors.contactNumber = contactValidation.errors;
  sanitizedData.contactNumber = contactValidation.sanitized;
  
  const categoryValidation = validateCategory(bookData.category);
  if (!categoryValidation.isValid) errors.category = categoryValidation.errors;
  sanitizedData.category = categoryValidation.sanitized;
  
  return { errors, sanitizedData };
};

// Helper function to validate address fields
const validateAddressFields = (bookData) => {
  const errors = {};
  const sanitizedData = {};
  
  const streetValidation = validateAddress(bookData.streetAddress, 'Street Address', true);
  if (!streetValidation.isValid) errors.streetAddress = streetValidation.errors;
  sanitizedData.streetAddress = streetValidation.sanitized;
  
  const cityValidation = validateAddress(bookData.cityTown, 'City', true);
  if (!cityValidation.isValid) errors.cityTown = cityValidation.errors;
  sanitizedData.cityTown = cityValidation.sanitized;
  
  const districtValidation = validateAddress(bookData.district, 'District', true);
  if (!districtValidation.isValid) errors.district = districtValidation.errors;
  sanitizedData.district = districtValidation.sanitized;
  
  return { errors, sanitizedData };
};

// Helper function to validate optional fields
const validateOptionalFields = (bookData) => {
  const errors = {};
  const sanitizedData = {};
  
  if (bookData.publisher) {
    const publisherValidation = validateOptionalText(bookData.publisher, 'Publisher', VALIDATION_LIMITS.PUBLISHER.max);
    if (!publisherValidation.isValid) errors.publisher = publisherValidation.errors;
    sanitizedData.publisher = publisherValidation.sanitized;
  }
  
  if (bookData.edition) {
    const editionValidation = validateOptionalText(bookData.edition, 'Edition', VALIDATION_LIMITS.EDITION.max);
    if (!editionValidation.isValid) errors.edition = editionValidation.errors;
    sanitizedData.edition = editionValidation.sanitized;
  }
  
  if (bookData.zipCode) {
    const zipValidation = validateOptionalText(bookData.zipCode, 'Zip Code', VALIDATION_LIMITS.ZIP_CODE.max);
    if (!zipValidation.isValid) errors.zipCode = zipValidation.errors;
    sanitizedData.zipCode = zipValidation.sanitized;
  }
  
  return { errors, sanitizedData };
};

// Helper function to validate enum fields
const validateEnumFields = (bookData) => {
  const errors = {};
  const sanitizedData = {};
  
  const validAuthenticities = ['Original', 'Copy'];
  const validConditions = ['New', 'Like New', 'Very Good', 'Good', 'Fair', 'Poor'];
  
  if (!validAuthenticities.includes(bookData.authenticity)) {
    errors.authenticity = ['Invalid authenticity value'];
  } else {
    sanitizedData.authenticity = bookData.authenticity;
  }
  
  if (!validConditions.includes(bookData.productCondition)) {
    errors.productCondition = ['Invalid condition value'];
  } else {
    sanitizedData.productCondition = bookData.productCondition;
  }
  
  return { errors, sanitizedData };
};

// Comprehensive book data validation
export const validateBookData = (bookData) => {
  const errors = {};
  const sanitizedData = {};
  
  // Validate required fields
  const requiredFields = validateRequiredBookFields(bookData);
  Object.assign(errors, requiredFields.errors);
  Object.assign(sanitizedData, requiredFields.sanitizedData);
  
  // Validate address fields
  const addressFields = validateAddressFields(bookData);
  Object.assign(errors, addressFields.errors);
  Object.assign(sanitizedData, addressFields.sanitizedData);
  
  // Validate optional fields
  const optionalFields = validateOptionalFields(bookData);
  Object.assign(errors, optionalFields.errors);
  Object.assign(sanitizedData, optionalFields.sanitizedData);
  
  // Validate enum fields
  const enumFields = validateEnumFields(bookData);
  Object.assign(errors, enumFields.errors);
  Object.assign(sanitizedData, enumFields.sanitizedData);
  
  // Add other required fields after validation
  if (!bookData.imageURL) {
    errors.imageURL = ['Image URL is required'];
  } else {
    sanitizedData.imageURL = sanitizeText(bookData.imageURL);
  }
  
  if (bookData.email) {
    sanitizedData.email = sanitizeText(bookData.email);
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Rate limiting check (simple in-memory implementation)
const submissionCounts = new Map();

export const checkRateLimit = (email, maxSubmissions = 5, windowMs = 60 * 60 * 1000) => {
  const now = Date.now();
  const userSubmissions = submissionCounts.get(email) || [];
  
  // Remove old submissions outside the window
  const recentSubmissions = userSubmissions.filter(time => now - time < windowMs);
  
  if (recentSubmissions.length >= maxSubmissions) {
    return {
      allowed: false,
      error: `Too many submissions. Maximum ${maxSubmissions} submissions per hour allowed.`,
      resetTime: Math.ceil((recentSubmissions[0] + windowMs - now) / 1000 / 60) // minutes until reset
    };
  }
  
  // Add current submission
  recentSubmissions.push(now);
  submissionCounts.set(email, recentSubmissions);
  
  return { allowed: true };
};

// Clean up old rate limit data periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  for (const [email, submissions] of submissionCounts.entries()) {
    const recentSubmissions = submissions.filter(time => now - time < windowMs);
    if (recentSubmissions.length === 0) {
      submissionCounts.delete(email);
    } else {
      submissionCounts.set(email, recentSubmissions);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes
