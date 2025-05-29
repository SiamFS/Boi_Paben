import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Maximum length constraints
export const VALIDATION_LIMITS = {
  BOOK_TITLE: { min: 2, max: 150 },
  AUTHOR_NAME: { min: 2, max: 100 },
  DESCRIPTION: { min: 10, max: 2000 },
  PUBLISHER: { min: 2, max: 100 },
  EDITION: { min: 1, max: 50 },
  CONTACT_NUMBER: { min: 10, max: 15 },
  ADDRESS: { min: 5, max: 200 },
  CITY: { min: 2, max: 100 },
  DISTRICT: { min: 2, max: 100 },
  ZIP_CODE: { min: 4, max: 10 },
  PRICE: { min: 1, max: 50000 },
  IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
};

// Sanitize text input to prevent XSS and SQL injection
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Remove potential SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
  ];
  
  let sanitized = text;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Sanitize HTML/XSS
  sanitized = DOMPurify.sanitize(sanitized, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Trim and normalize whitespace
  return sanitized.trim().replace(/\s+/g, ' ');
};

// Sanitize numeric input
export const sanitizeNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
};

// Validate phone number format
export const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  const bangladeshPhoneRegex = /^(\+?880)?[01][3-9]\d{8}$/;
  const internationalRegex = /^\+?[\d\s-()]{10,15}$/;
  
  return bangladeshPhoneRegex.test(cleaned) || internationalRegex.test(phone);
};

// Validate image file
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('Image file is required');
    return errors;
  }
  
  // Check file size
  if (file.size > VALIDATION_LIMITS.IMAGE_SIZE) {
    errors.push(`Image size must be less than ${VALIDATION_LIMITS.IMAGE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }
  
  // Check file name for malicious patterns
  const filename = file.name.toLowerCase();
  const dangerousPatterns = ['.php', '.js', '.html', '.exe', '.bat', '.cmd'];
  if (dangerousPatterns.some(pattern => filename.includes(pattern))) {
    errors.push('Invalid file type detected');
  }
  
  return errors;
};

// Helper function to validate text field with length constraints
const validateTextField = (value, fieldName, limits, isRequired = true) => {
  const sanitized = sanitizeText(value);
  
  if (!sanitized && isRequired) {
    return { error: `${fieldName} is required`, sanitized };
  }
  
  if (!sanitized) {
    return { sanitized };
  }
  
  if (sanitized.length < limits.min) {
    return { 
      error: `${fieldName} must be at least ${limits.min} characters`, 
      sanitized 
    };
  }
  
  if (sanitized.length > limits.max) {
    return { 
      error: `${fieldName} must not exceed ${limits.max} characters`, 
      sanitized 
    };
  }
  
  return { sanitized };
};

// Helper function to validate price
const validatePrice = (value) => {
  const price = sanitizeNumber(value, VALIDATION_LIMITS.PRICE.min, VALIDATION_LIMITS.PRICE.max);
  
  if (price < VALIDATION_LIMITS.PRICE.min) {
    return { 
      error: `Price must be at least ${VALIDATION_LIMITS.PRICE.min} BDT`, 
      price 
    };
  }
  
  if (price > VALIDATION_LIMITS.PRICE.max) {
    return { 
      error: `Price must not exceed ${VALIDATION_LIMITS.PRICE.max} BDT`, 
      price 
    };
  }
  
  return { price };
};

// Helper function to validate contact number
const validateContact = (value) => {
  const contactNumber = sanitizeText(value);
  
  if (!contactNumber) {
    return { error: 'Contact number is required', contactNumber };
  }
  
  if (!validatePhoneNumber(contactNumber)) {
    return { error: 'Please enter a valid phone number', contactNumber };
  }
  
  return { contactNumber };
};

// Helper function to validate optional fields
const validateOptionalFields = (data) => {
  const errors = {};
  const sanitizedData = {};
  
  if (data.publisher) {
    const publisher = sanitizeText(data.publisher);
    if (publisher.length > VALIDATION_LIMITS.PUBLISHER.max) {
      errors.publisher = `Publisher name must not exceed ${VALIDATION_LIMITS.PUBLISHER.max} characters`;
    }
    sanitizedData.publisher = publisher;
  } else {
    sanitizedData.publisher = '';
  }
  
  if (data.edition) {
    const edition = sanitizeText(data.edition);
    if (edition.length > VALIDATION_LIMITS.EDITION.max) {
      errors.edition = `Edition must not exceed ${VALIDATION_LIMITS.EDITION.max} characters`;
    }
    sanitizedData.edition = edition;
  } else {
    sanitizedData.edition = '';
  }
  
  if (data.zipCode) {
    const zipCode = sanitizeText(data.zipCode);
    if (zipCode.length < VALIDATION_LIMITS.ZIP_CODE.min || zipCode.length > VALIDATION_LIMITS.ZIP_CODE.max) {
      errors.zipCode = `Zip code must be between ${VALIDATION_LIMITS.ZIP_CODE.min} and ${VALIDATION_LIMITS.ZIP_CODE.max} characters`;
    }
    sanitizedData.zipCode = zipCode;
  } else {
    sanitizedData.zipCode = '';
  }
  
  return { errors, sanitizedData };
};

// Comprehensive book data validation
export const validateBookData = (data) => {
  const errors = {};
  
  // Validate required text fields
  const bookTitleResult = validateTextField(data.bookTitle, 'Book title', VALIDATION_LIMITS.BOOK_TITLE);
  const authorNameResult = validateTextField(data.authorName, 'Author name', VALIDATION_LIMITS.AUTHOR_NAME);
  const descriptionResult = validateTextField(data.bookDescription, 'Book description', VALIDATION_LIMITS.DESCRIPTION);
  const streetAddressResult = validateTextField(data.streetAddress, 'Street address', VALIDATION_LIMITS.ADDRESS);
  const cityTownResult = validateTextField(data.cityTown, 'City/Town', VALIDATION_LIMITS.CITY);
  const districtResult = validateTextField(data.district, 'District', VALIDATION_LIMITS.DISTRICT);
  
  // Validate price and contact
  const priceResult = validatePrice(data.Price);
  const contactResult = validateContact(data.contactNumber);
  
  // Validate optional fields
  const optionalResult = validateOptionalFields(data);
  
  // Collect errors
  if (bookTitleResult.error) errors.bookTitle = bookTitleResult.error;
  if (authorNameResult.error) errors.authorName = authorNameResult.error;
  if (descriptionResult.error) errors.bookDescription = descriptionResult.error;
  if (streetAddressResult.error) errors.streetAddress = streetAddressResult.error;
  if (cityTownResult.error) errors.cityTown = cityTownResult.error;
  if (districtResult.error) errors.district = districtResult.error;
  if (priceResult.error) errors.Price = priceResult.error;
  if (contactResult.error) errors.contactNumber = contactResult.error;
  
  Object.assign(errors, optionalResult.errors);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      bookTitle: bookTitleResult.sanitized,
      authorName: authorNameResult.sanitized,
      bookDescription: descriptionResult.sanitized,
      Price: priceResult.price,
      contactNumber: contactResult.contactNumber,
      streetAddress: streetAddressResult.sanitized,
      cityTown: cityTownResult.sanitized,
      district: districtResult.sanitized,
      ...optionalResult.sanitizedData,
      category: data.category,
      authenticity: data.authenticity,
      productCondition: data.productCondition,
    }
  };
};

// Create Zod validation schema for books
export const createBookValidationSchema = () => z.object({
  bookTitle: z.string()
    .min(VALIDATION_LIMITS.BOOK_TITLE.min, `Title must be at least ${VALIDATION_LIMITS.BOOK_TITLE.min} characters`)
    .max(VALIDATION_LIMITS.BOOK_TITLE.max, `Title must not exceed ${VALIDATION_LIMITS.BOOK_TITLE.max} characters`)
    .transform(sanitizeText),
  
  authorName: z.string()
    .min(VALIDATION_LIMITS.AUTHOR_NAME.min, `Author name must be at least ${VALIDATION_LIMITS.AUTHOR_NAME.min} characters`)
    .max(VALIDATION_LIMITS.AUTHOR_NAME.max, `Author name must not exceed ${VALIDATION_LIMITS.AUTHOR_NAME.max} characters`)
    .transform(sanitizeText),
  
  category: z.string().min(1, 'Please select a category'),
  
  Price: z.string()
    .min(1, 'Price is required')
    .transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < VALIDATION_LIMITS.PRICE.min || num > VALIDATION_LIMITS.PRICE.max) {
        throw new Error(`Price must be between ${VALIDATION_LIMITS.PRICE.min} and ${VALIDATION_LIMITS.PRICE.max} BDT`);
      }
      return val;
    }),
  
  bookDescription: z.string()
    .min(VALIDATION_LIMITS.DESCRIPTION.min, `Description must be at least ${VALIDATION_LIMITS.DESCRIPTION.min} characters`)
    .max(VALIDATION_LIMITS.DESCRIPTION.max, `Description must not exceed ${VALIDATION_LIMITS.DESCRIPTION.max} characters`)
    .transform(sanitizeText),
  
  authenticity: z.string().min(1, 'Please select authenticity'),
  productCondition: z.string().min(1, 'Please select condition'),
  
  publisher: z.string()
    .max(VALIDATION_LIMITS.PUBLISHER.max, `Publisher name must not exceed ${VALIDATION_LIMITS.PUBLISHER.max} characters`)
    .optional()
    .transform((val) => val ? sanitizeText(val) : ''),
  
  edition: z.string()
    .max(VALIDATION_LIMITS.EDITION.max, `Edition must not exceed ${VALIDATION_LIMITS.EDITION.max} characters`)
    .optional()
    .transform((val) => val ? sanitizeText(val) : ''),
    streetAddress: z.string()
    .min(VALIDATION_LIMITS.ADDRESS.min, `Street address must be at least ${VALIDATION_LIMITS.ADDRESS.min} characters`)
    .max(VALIDATION_LIMITS.ADDRESS.max, `Street address must not exceed ${VALIDATION_LIMITS.ADDRESS.max} characters`)
    .transform(sanitizeText),
  
  cityTown: z.string()
    .min(VALIDATION_LIMITS.CITY.min, `City/Town must be at least ${VALIDATION_LIMITS.CITY.min} characters`)
    .max(VALIDATION_LIMITS.CITY.max, `City/Town must not exceed ${VALIDATION_LIMITS.CITY.max} characters`)
    .transform(sanitizeText),
  
  district: z.string()
    .min(VALIDATION_LIMITS.DISTRICT.min, `District must be at least ${VALIDATION_LIMITS.DISTRICT.min} characters`)
    .max(VALIDATION_LIMITS.DISTRICT.max, `District must not exceed ${VALIDATION_LIMITS.DISTRICT.max} characters`)
    .transform(sanitizeText),
  
  zipCode: z.string()
    .max(VALIDATION_LIMITS.ZIP_CODE.max, `Zip code must not exceed ${VALIDATION_LIMITS.ZIP_CODE.max} characters`)
    .optional()
    .transform((val) => val ? sanitizeText(val) : ''),
  
  contactNumber: z.string()
    .min(VALIDATION_LIMITS.CONTACT_NUMBER.min, 'Valid contact number is required')
    .max(VALIDATION_LIMITS.CONTACT_NUMBER.max, 'Contact number is too long')
    .refine(validatePhoneNumber, 'Please enter a valid phone number')
    .transform(sanitizeText),
});

// Rate limiting for submissions
export const checkRateLimit = (userId, submissions = new Map()) => {
  const now = Date.now();
  const userSubmissions = submissions.get(userId) || [];
  
  // Clean old submissions (older than 1 hour)
  const recentSubmissions = userSubmissions.filter(time => now - time < 60 * 60 * 1000);
  
  // Allow max 5 submissions per hour
  if (recentSubmissions.length >= 5) {
    return {
      allowed: false,
      message: 'Too many submissions. Please wait before uploading another book.',
      resetTime: Math.min(...recentSubmissions) + 60 * 60 * 1000
    };
  }
  
  recentSubmissions.push(now);
  submissions.set(userId, recentSubmissions);
  
  return { allowed: true };
};
