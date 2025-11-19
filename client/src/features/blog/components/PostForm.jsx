import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { bookService } from '@/features/books/services/bookService';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
});

export default function PostForm({ initialData, onSubmit, onCancel, loading }) {
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: initialData || {},
  });

  const handleFormSubmit = async (data) => {
    let imageUrl = initialData?.imageUrl;

    if (imageFile) {
      setUploadingImage(true);
      try {
        imageUrl = await bookService.uploadImage(imageFile);
      } catch (error) {
        // Image upload failed silently
      } finally {
        setUploadingImage(false);
      }
    }

    onSubmit({ ...data, imageUrl });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="card p-6 space-y-4">
      <div>
        <label className="label">Title</label>
        <input
          {...register('title')}
          className="input w-full"
          placeholder="Enter post title"
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="label">Content</label>
        <textarea
          {...register('content')}
          className="input w-full min-h-[200px] resize-y"
          placeholder="Share your thoughts..."
        />
        {errors.content && (
          <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="label flex items-center gap-2">
          <Image className="h-4 w-4" />
          Image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="input p-2"
        />
        {imageFile && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{imageFile.name}</span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="text-destructive hover:text-destructive/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || uploadingImage}>
          {loading || uploadingImage
            ? 'Processing...'
            : initialData
            ? 'Update Post'
            : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}