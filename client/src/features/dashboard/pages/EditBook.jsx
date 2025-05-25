import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { bookService } from '@/features/books/services/bookService';
import BookForm from '../components/BookForm';
import LoadingScreen from '@/components/ui/LoadingScreen';
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

export default function EditBook() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', id],
    queryFn: () => bookService.getBookById(id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: book || {},
    values: book,
  });

  if (isLoading) return <LoadingScreen />;

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">Book not found</p>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let imageURL = book.imageURL;
      
      if (imageFile) {
        imageURL = await bookService.uploadImage(imageFile);
      }

      const bookData = {
        ...data,
        imageURL,
        userEmail: user.email,
        seller: user.displayName || `${user.firstName} ${user.lastName}`,
      };

      await bookService.updateBook(id, bookData);
      toast.success('Book updated successfully!');
      navigate('/dashboard/manage');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Book</h1>
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
        submitText="Update Book"
        defaultImage={book.imageURL}
      />
    </div>
  );
}