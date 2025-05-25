import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { bookService } from '@/features/books/services/bookService';
import { bookCategories } from '@/lib/utils';
import BookForm from '../components/BookForm';
import toast from 'react-hot-toast';

const bookSchema = z.object({
  bookTitle: z.string().min(3, 'Title must be at least 3 characters'),
  authorName: z.string().min(2, 'Author name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  Price: z.string().min(1, 'Price is required'),
  bookDescription: z.string().min(20, 'Description must be at least 20 characters'),
  authenticity: z.string(),
  productCondition: z.string(),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  streetAddress: z.string().min(5, 'Street address is required'),
  cityTown: z.string().min(2, 'City/Town is required'),
  district: z.string().min(2, 'District is required'),
  zipCode: z.string().optional(),
  contactNumber: z.string().min(10, 'Valid contact number is required'),
});

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

    setLoading(true);
    try {
      const imageUrl = await bookService.uploadImage(imageFile);
      
      const bookData = {
        ...data,
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
      toast.error('Failed to upload book');
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