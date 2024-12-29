import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

const InputField = ({ label, name, type, required, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      required={required}
      placeholder={placeholder}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ label, name, required, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows={4}
      required={required}
      placeholder={placeholder}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>
);

const UploadBook = () => {
  const bookCategories = [
    "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery",
    "Horror", "Romance", "Thriller", "Adventure", "Children",
    "Education", "Biography",
  ];

  const { user } = useContext(AuthContext);
  const [selectedBookCategory, setSelectedBookCategory] = useState(bookCategories[10]);
  const [imageFile, setImageFile] = useState(null);
  const [authenticity, setAuthenticity] = useState('Original');
  const [productCondition, setProductCondition] = useState('New');

  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleBookSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;

    // Extract form data
    const bookTitle = form.bookTitle.value;
    const authorName = form.authorName.value;
    const category = form.category.value;
    const Price = form.Price.value;
    const bookDescription = form.bookDescription.value;
    const publisher = form.publisher.value;
    const edition = form.edition.value;
    const streetAddress = form.streetAddress.value;
    const cityTown = form.cityTown.value;
    const district = form.district.value;
    const zipCode = form.zipCode.value;
    const contactNumber = form.contactNumber.value;

    // Upload image to imgbb
    const formData = new FormData();
    formData.append('image', imageFile);
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=47bd3a08478085812d1960523ecd71ba', {
      method: 'POST',
      body: formData
    }).then(res => res.json());

    const imageURL = imgbbResponse.data.url;

    const sellerName = `${user.firstName} ${user.lastName}`;

    const bookObj = {
      bookTitle,
      authorName,
      imageURL,
      category,
      Price,
      bookDescription,
      email: user.email,
      publisher,
      edition,
      streetAddress,
      cityTown,
      district,
      zipCode,
      contactNumber,
      authenticity,
      productCondition,
      availability: 'available',
      seller: sellerName
    };

    console.log(bookObj);

    // Send data to backend
    fetch('https://cse471-project-backend.onrender.com/upload-book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookObj)
    }).then(res => res.json()).then(data => {
      alert("Book Uploaded Successfully");
      window.location.reload();
    });
  };

  if (!user) {
    return <h2 className="text-3xl font-bold text-center mt-8">Please login to upload book</h2>;  
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className='flex justify-between items-center'>
      <h2 className="text-3xl font-bold mb-2">Upload Book</h2>
      <p className="text-lg font-semibold bg-gray-100 p-4 mb-4">Seller: {user.firstName} {user.lastName}</p>
      </div>
      <form onSubmit={handleBookSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Book Title" name="bookTitle" type="text" required placeholder="Enter book title" />
          <InputField label="Author Name" name="authorName" type="text" required placeholder="Enter author name" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="imageURL" className="block text-sm font-medium text-gray-700 mb-1">
              Book Image
            </label>
            <input
              id="imageURL"
              name="imageURL"
              type="file"
              required
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>
          <SelectField
            label="Book Category"
            name="category"
            options={bookCategories}
            value={selectedBookCategory}
            onChange={(e) => setSelectedBookCategory(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <InputField label="Book Price" name="Price" type="number" required placeholder="Enter book price" />
            <InputField label="Contact Number" name="contactNumber" type="tel" required placeholder="Enter contact number" className="mt-6" />
          </div>
          <TextAreaField label="Book Description" name="bookDescription" required placeholder="Enter book description" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Authenticity"
            name="authenticity"
            options={["Original", "Copy"]}
            value={authenticity}
            onChange={(e) => setAuthenticity(e.target.value)}
          />
          <SelectField
            label="Product Condition"
            name="productCondition"
            options={["New", "Used"]}
            value={productCondition}
            onChange={(e) => setProductCondition(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Book Publisher (Optional)" name="publisher" type="text" placeholder="Enter publisher name" />
          <InputField label="Book Edition (Optional)" name="edition" type="text" placeholder="Enter book edition" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Street Address" name="streetAddress" type="text" required placeholder="Enter street address" />
          <InputField label="City/Town" name="cityTown" type="text" required placeholder="Enter city/town" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="District" name="district" type="text" required placeholder="Enter district" />
          <InputField label="Zip Code (Optional)" name="zipCode" type="text" placeholder="Enter zip code" />
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Upload Book
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadBook;