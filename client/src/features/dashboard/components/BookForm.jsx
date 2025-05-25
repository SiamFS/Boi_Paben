import { Upload } from 'lucide-react';
import { bookCategories } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function BookForm({
  register,
  errors,
  onSubmit,
  imageFile,
  setImageFile,
  loading,
  submitText,
  defaultImage,
}) {
  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="label">Book Title</label>
          <input
            {...register('bookTitle')}
            className="input w-full"
            placeholder="Enter book title"
          />
          {errors.bookTitle && (
            <p className="text-sm text-destructive mt-1">{errors.bookTitle.message}</p>
          )}
        </div>

        <div>
          <label className="label">Author Name</label>
          <input
            {...register('authorName')}
            className="input w-full"
            placeholder="Enter author name"
          />
          {errors.authorName && (
            <p className="text-sm text-destructive mt-1">{errors.authorName.message}</p>
          )}
        </div>

        <div>
          <label className="label">Category</label>
          <select {...register('category')} className="input w-full">
            {bookCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="label">Price (BDT)</label>
          <input
            {...register('Price')}
            type="number"
            className="input w-full"
            placeholder="Enter price"
          />
          {errors.Price && (
            <p className="text-sm text-destructive mt-1">{errors.Price.message}</p>
          )}
        </div>

        <div>
          <label className="label">Book Image</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="input p-2 flex-1"
            />
            {(imageFile || defaultImage) && (
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : defaultImage}
                alt="Preview"
                className="h-20 w-16 object-cover rounded"
              />
            )}
          </div>
        </div>

        <div>
          <label className="label">Contact Number</label>
          <input
            {...register('contactNumber')}
            type="tel"
            className="input w-full"
            placeholder="Enter contact number"
          />
          {errors.contactNumber && (
            <p className="text-sm text-destructive mt-1">{errors.contactNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label">Book Description</label>
        <textarea
          {...register('bookDescription')}
          className="input w-full min-h-[120px] resize-y"
          placeholder="Enter book description"
        />
        {errors.bookDescription && (
          <p className="text-sm text-destructive mt-1">{errors.bookDescription.message}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="label">Authenticity</label>
          <select {...register('authenticity')} className="input w-full">
            <option value="Original">Original</option>
            <option value="Copy">Copy</option>
          </select>
        </div>

        <div>
          <label className="label">Condition</label>
          <select {...register('productCondition')} className="input w-full">
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>

        <div>
          <label className="label">Publisher (Optional)</label>
          <input
            {...register('publisher')}
            className="input w-full"
            placeholder="Enter publisher name"
          />
        </div>

        <div>
          <label className="label">Edition (Optional)</label>
          <input
            {...register('edition')}
            className="input w-full"
            placeholder="Enter edition"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Pickup Address</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">Street Address</label>
            <input
              {...register('streetAddress')}
              className="input w-full"
              placeholder="Enter street address"
            />
            {errors.streetAddress && (
              <p className="text-sm text-destructive mt-1">{errors.streetAddress.message}</p>
            )}
          </div>

          <div>
            <label className="label">City/Town</label>
            <input
              {...register('cityTown')}
              className="input w-full"
              placeholder="Enter city/town"
            />
            {errors.cityTown && (
              <p className="text-sm text-destructive mt-1">{errors.cityTown.message}</p>
            )}
          </div>

          <div>
            <label className="label">District</label>
            <input
              {...register('district')}
              className="input w-full"
              placeholder="Enter district"
            />
            {errors.district && (
              <p className="text-sm text-destructive mt-1">{errors.district.message}</p>
            )}
          </div>

          <div>
            <label className="label">Zip Code (Optional)</label>
            <input
              {...register('zipCode')}
              className="input w-full"
              placeholder="Enter zip code"
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-pulse" />
            Processing...
          </>
        ) : (
          submitText
        )}
      </Button>
    </form>
  );
}