import { Upload, AlertCircle, FileImage } from 'lucide-react';
import { bookCategories } from '@/lib/utils';
import { VALIDATION_LIMITS, validateImageFile } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import PropTypes from 'prop-types';

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
  const [imageErrors, setImageErrors] = useState([]);
  const [dragActive, setDragActive] = useState(false);  const handleImageChange = (file) => {
    if (!file) return;
    
    const validationErrors = validateImageFile(file);
    setImageErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      setImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="bookTitle" className="label">Book Title *</label>
          <input
            id="bookTitle"
            {...register('bookTitle')}
            className="input w-full"
            placeholder="Enter book title"
            maxLength={VALIDATION_LIMITS.BOOK_TITLE.max}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bookTitle && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.bookTitle.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Max {VALIDATION_LIMITS.BOOK_TITLE.max} characters
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="authorName" className="label">Author Name *</label>
          <input
            id="authorName"
            {...register('authorName')}
            className="input w-full"
            placeholder="Enter author name"
            maxLength={VALIDATION_LIMITS.AUTHOR_NAME.max}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.authorName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.authorName.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Max {VALIDATION_LIMITS.AUTHOR_NAME.max} characters
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="label">Category *</label>
          <select 
            id="category"
            {...register('category')} 
            className="input w-full bg-background dark:bg-gray-800 border border-border dark:border-gray-600"
          >
            {bookCategories.map((category) => (
              <option key={category} value={category} className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-sm text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="label">Price (BDT) *</label>
          <input
            id="price"
            {...register('Price')}
            type="number"
            min={VALIDATION_LIMITS.PRICE.min}
            max={VALIDATION_LIMITS.PRICE.max}
            className="input w-full"
            placeholder="Enter price"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.Price && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.Price.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Range: {VALIDATION_LIMITS.PRICE.min} - {VALIDATION_LIMITS.PRICE.max} BDT
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="bookImage" className="label">Book Image *</label>
          <button 
            type="button"
            aria-label="Upload book image by clicking or dragging and dropping"
            className={`w-full border-2 border-dashed rounded-lg p-6 transition-all duration-200 text-left ${
              dragActive 
                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                : 'border-border dark:border-gray-600 hover:border-primary/50'
            } ${imageErrors.length > 0 ? 'border-destructive' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !imageFile && !defaultImage && document.getElementById('selectImage')?.click()}
          >
            {(imageFile || defaultImage) ? (
              <div className="flex items-center gap-4">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : defaultImage}
                  alt="Preview"
                  className="h-24 w-20 object-cover rounded-lg border border-border dark:border-gray-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {imageFile ? imageFile.name : 'Current image'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Uploaded'}
                  </p>                  <label htmlFor="changeImage" className="inline-block mt-2 cursor-pointer">
                    <input
                      id="changeImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleImageChange(e.target.files[0])}
                      className="hidden"
                    />
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">
                      <FileImage className="h-3 w-3 mr-1" />
                      Change Image
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Drop your image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Max size: {VALIDATION_LIMITS.IMAGE_SIZE / (1024 * 1024)}MB | Formats: JPEG, PNG, WebP
                </p>                <label htmlFor="selectImage" className="cursor-pointer">
                  <input
                    id="selectImage"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">
                    <Upload className="h-3 w-3 mr-1" />
                    Select Image
                  </div>
                </label>
              </div>
            )}
          </button>          {imageErrors.length > 0 && (
            <div className="mt-2 space-y-1">
              {imageErrors.map((error) => (
                <p key={error} className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="contactNumber" className="label">Contact Number *</label>
          <input
            id="contactNumber"
            {...register('contactNumber')}
            type="tel"
            className="input w-full"
            placeholder="Enter contact number (e.g., +880XXXXXXXXX)"
            maxLength={VALIDATION_LIMITS.CONTACT_NUMBER.max}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.contactNumber && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.contactNumber.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Bangladesh: +880XXXXXXXXX or International format
            </span>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="bookDescription" className="label">Book Description *</label>
        <textarea
          id="bookDescription"
          {...register('bookDescription')}
          className="input w-full min-h-[120px] resize-y"
          placeholder="Describe your book: condition, edition, special features, etc."
          maxLength={VALIDATION_LIMITS.DESCRIPTION.max}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bookDescription && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.bookDescription.message}
            </p>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {VALIDATION_LIMITS.DESCRIPTION.min} - {VALIDATION_LIMITS.DESCRIPTION.max} characters
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="authenticity" className="label">Authenticity *</label>
          <select 
            id="authenticity"
            {...register('authenticity')} 
            className="input w-full bg-background dark:bg-gray-800 border border-border dark:border-gray-600"
          >
            <option value="Original" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">Original</option>
            <option value="Copy" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">Copy</option>
          </select>
        </div>

        <div>
          <label htmlFor="productCondition" className="label">Condition *</label>
          <select 
            id="productCondition"
            {...register('productCondition')} 
            className="input w-full bg-background dark:bg-gray-800 border border-border dark:border-gray-600"
          >
            <option value="New" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">New</option>
            <option value="Like New" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">Like New</option>
            <option value="Very Good" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">Very Good</option>
            <option value="Good" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">Good</option>
            <option value="Fair" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">Fair</option>
            <option value="Poor" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">Poor</option>
          </select>
        </div>

        <div>
          <label htmlFor="publisher" className="label">Publisher (Optional)</label>
          <input
            id="publisher"
            {...register('publisher')}
            className="input w-full"
            placeholder="Enter publisher name"
            maxLength={VALIDATION_LIMITS.PUBLISHER.max}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.publisher && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.publisher.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Max {VALIDATION_LIMITS.PUBLISHER.max} characters
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="edition" className="label">Edition (Optional)</label>
          <input
            id="edition"
            {...register('edition')}
            className="input w-full"
            placeholder="Enter edition (e.g., 2nd Edition, Revised)"
            maxLength={VALIDATION_LIMITS.EDITION.max}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.edition && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.edition.message}
              </p>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              Max {VALIDATION_LIMITS.EDITION.max} characters
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Pickup Address</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="streetAddress" className="label">Street Address *</label>
            <input
              id="streetAddress"
              {...register('streetAddress')}
              className="input w-full"              placeholder="Enter street address"
              maxLength={VALIDATION_LIMITS.ADDRESS.max}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.streetAddress && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.streetAddress.message}
                </p>
              )}              <span className="text-xs text-muted-foreground ml-auto">
                Max {VALIDATION_LIMITS.ADDRESS.max} characters
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="cityTown" className="label">City/Town *</label>
            <input
              id="cityTown"
              {...register('cityTown')}
              className="input w-full"
              placeholder="Enter city/town"
              maxLength={VALIDATION_LIMITS.CITY.max}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.cityTown && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cityTown.message}
                </p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Max {VALIDATION_LIMITS.CITY.max} characters
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="district" className="label">District *</label>
            <input
              id="district"
              {...register('district')}
              className="input w-full"
              placeholder="Enter district"
              maxLength={VALIDATION_LIMITS.DISTRICT.max}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.district && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.district.message}
                </p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Max {VALIDATION_LIMITS.DISTRICT.max} characters
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="zipCode" className="label">Zip Code (Optional)</label>
            <input
              id="zipCode"
              {...register('zipCode')}
              className="input w-full"
              placeholder="Enter zip code"
              maxLength={VALIDATION_LIMITS.ZIP_CODE.max}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.zipCode && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.zipCode.message}
                </p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Max {VALIDATION_LIMITS.ZIP_CODE.max} characters
              </span>
            </div>
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

BookForm.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  imageFile: PropTypes.object,
  setImageFile: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  submitText: PropTypes.string.isRequired,
  defaultImage: PropTypes.string,
};