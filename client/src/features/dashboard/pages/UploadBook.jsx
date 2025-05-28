import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { bookService } from '@/features/books/services/bookService';
import { bookCategories } from '@/lib/utils';
import { 
  createBookValidationSchema,
  sanitizeText,
  validateImageFile 
} from '@/lib/validation';
import BookForm from '../components/BookForm';
import toast from 'react-hot-toast';

const bookSchema = createBookValidationSchema();

export default function UploadBook() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      category: bookCategories[0],
      authenticity: 'Original',
      productCondition: 'New',
    },
  });
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
      toast.success('Book uploaded successfully!');
      navigate('/dashboard/manage');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload book');
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

      <BookForm
        register={register}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        imageFile={imageFile}
        setImageFile={setImageFile}
        loading={loading}
        submitText="Upload Book"
      />
    </div>
  );
}