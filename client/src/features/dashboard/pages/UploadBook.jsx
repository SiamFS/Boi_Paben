import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { bookService } from '@/features/books/services/bookService';
import { bookCategories } from '@/lib/utils';
import cache from '@/lib/cache';
import { 
  createBookValidationSchema,
  sanitizeText,
  validateImageFile 
} from '@/lib/validation';
import BookForm from '../components/BookForm';
import toast from 'react-hot-toast';

const bookSchema = createBookValidationSchema();

const CACHED_ADDRESS_KEY = 'lastUsedAddress';

export default function UploadBook() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [useAutoFill, setUseAutoFill] = useState(false);
  const [hasCachedAddress, setHasCachedAddress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      category: bookCategories[0],
      authenticity: 'Original',
      productCondition: 'New',
    },
  });

  // Check if cached address exists on mount
  useEffect(() => {
    const cachedAddress = cache.get(CACHED_ADDRESS_KEY);
    if (cachedAddress) {
      setHasCachedAddress(true);
    }
  }, []);

  // Auto-fill address when toggle is enabled
  useEffect(() => {
    if (useAutoFill) {
      const cachedAddress = cache.get(CACHED_ADDRESS_KEY);
      if (cachedAddress) {
        setValue('streetAddress', cachedAddress.streetAddress || '');
        setValue('cityTown', cachedAddress.cityTown || '');
        setValue('district', cachedAddress.district || '');
        setValue('zipCode', cachedAddress.zipCode || '');
        toast.success('Address auto-filled from previous upload');
      }
    }
  }, [useAutoFill, setValue]);
  const onSubmit = async (data) => {
    if (!imageFile) {
      toast.error('Please select a book image');
      return;
    }

    // Validate image file
    const imageErrors = validateImageFile(imageFile);
    if (imageErrors.length > 0) {
      toast.error(imageErrors[0]);
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await bookService.uploadImage(imageFile);
      
      // Sanitize all text inputs
      const sanitizedData = {
        bookTitle: sanitizeText(data.bookTitle),
        authorName: sanitizeText(data.authorName),
        bookDescription: sanitizeText(data.bookDescription),
        publisher: data.publisher ? sanitizeText(data.publisher) : '',
        edition: data.edition ? sanitizeText(data.edition) : '',
        streetAddress: sanitizeText(data.streetAddress),
        cityTown: sanitizeText(data.cityTown),
        district: sanitizeText(data.district),
        zipCode: data.zipCode ? sanitizeText(data.zipCode) : '',
        contactNumber: sanitizeText(data.contactNumber),
        category: data.category,
        Price: data.Price,
        authenticity: data.authenticity,
        productCondition: data.productCondition,
      };
      
      const bookData = {
        ...sanitizedData,
        imageURL: imageUrl,
        email: user.email,
        seller: user.displayName || `${user.firstName} ${user.lastName}`,
        availability: 'available',
      };

      await bookService.uploadBook(bookData);
      
      // Cache the address for next upload
      cache.set(CACHED_ADDRESS_KEY, {
        streetAddress: data.streetAddress,
        cityTown: data.cityTown,
        district: data.district,
        zipCode: data.zipCode,
      }, 30 * 24 * 60 * 60); // Cache for 30 days
      
      toast.success('Book uploaded successfully!');
      navigate('/dashboard/manage');
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show validation errors if available
      if (error.response?.data?.details) {
        const details = error.response.data.details;
        const errorMessages = Object.entries(details)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to upload book');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Upload Book</h1>
        <div className="bg-muted rounded-lg px-4 py-2">
          <p className="text-sm text-muted-foreground">Seller</p>
          <p className="font-medium">{user?.displayName || user?.email}</p>
        </div>
      </div>

      {hasCachedAddress && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              💾 Cached address available
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Use the same pickup address from your last upload
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseAutoFill(!useAutoFill)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              useAutoFill
                ? 'bg-blue-600 text-white'
                : 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-700'
            }`}
          >
            {useAutoFill ? '✓ Auto-fill ON' : 'Auto-fill OFF'}
          </button>
        </div>
      )}

      <BookForm
        register={register}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        imageFile={imageFile}
        setImageFile={setImageFile}
        loading={loading}
        submitText="Upload Book"
        showAutoFillHint={useAutoFill}
      />
    </div>
  );
}