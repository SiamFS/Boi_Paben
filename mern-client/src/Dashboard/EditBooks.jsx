import React, { useState, useEffect, useContext } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';

const InputField = ({ label, name, type, required, placeholder, defaultValue }) => (
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
      defaultValue={defaultValue}
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

const TextAreaField = ({ label, name, required, placeholder, defaultValue }) => (
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
      defaultValue={defaultValue}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
  </div>
);

const EditBooks = () => {
  const { id } = useParams();
  const { bookTitle, authorName, category, Price, imageURL, bookDescription, publisher, edition, streetAddress, cityTown, district, zipCode, contactNumber, authenticity, productCondition } = useLoaderData();
  const { user } = useContext(AuthContext);

  const bookCategories = [
    "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Mystery",
    "Horror", "Romance", "Thriller", "Adventure", "Children",
    "Education", "Biography",
  ];

  const [selectedBookCategory, setSelectedBookCategory] = useState(category);
  const [imageFile, setImageFile] = useState(null);
  const [authenticityState, setAuthenticity] = useState(authenticity);
  const [productConditionState, setProductCondition] = useState(productCondition);

  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const form = event.target;

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

    let updatedImageURL = imageURL;

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=47bd3a08478085812d1960523ecd71ba', {
        method: 'POST',
        body: formData
      }).then(res => res.json());

      updatedImageURL = imgbbResponse.data.url;
    }

    const updateBookObj = {
      bookTitle,
      authorName,
      imageURL: updatedImageURL,
      category,
      Price,
      bookDescription,
      publisher,
      edition,
      streetAddress,
      cityTown,
      district,
      zipCode,
      contactNumber,
      authenticity: authenticityState,
      productCondition: productConditionState,
      seller: `${user.firstName} ${user.lastName}`
    };

    fetch(`https://cse471-project-backend.onrender.com/book/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateBookObj)
    }).then(res => res.json()).then(data => {
      alert("Book Updated Successfully");
    });
  };

  if (!user) {
    return <p>Loading...</p>; 
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className="flex items-center justify-between">
      <h2 className="mb-8 text-3xl font-bold">Update the Book data</h2>
      <p className="text-lg font-semibold bg-gray-100 p-4 mb-4">Seller: {user.firstName} {user.lastName}</p>
      </div>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Book Title" name="bookTitle" type="text" required placeholder="Enter book title" defaultValue={bookTitle} />
          <InputField label="Author Name" name="authorName" type="text" required placeholder="Enter author name" defaultValue={authorName} />
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
          <InputField label="Book Price" name="Price" type="number" required placeholder="Enter book price" defaultValue={Price} />
          <InputField label="Contact Number" name="contactNumber" type="tel" required placeholder="Enter contact number" defaultValue={contactNumber} />
        </div>
        <TextAreaField label="Book Description" name="bookDescription" required placeholder="Enter book description" defaultValue={bookDescription} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Authenticity"
            name="authenticity"
            options={["Original", "Copy"]}
            value={authenticityState}
            onChange={(e) => setAuthenticity(e.target.value)}
          />
          <SelectField
            label="Product Condition"
            name="productCondition"
            options={["New", "Used"]}
            value={productConditionState}
            onChange={(e) => setProductCondition(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Book Publisher (Optional)" name="publisher" type="text" placeholder="Enter publisher name" defaultValue={publisher} />
          <InputField label="Book Edition (Optional)" name="edition" type="text" placeholder="Enter book edition" defaultValue={edition} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Street Address" name="streetAddress" type="text" required placeholder="Enter street address" defaultValue={streetAddress} />
          <InputField label="City/Town" name="cityTown" type="text" required placeholder="Enter city/town" defaultValue={cityTown} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="District" name="district" type="text" required placeholder="Enter district" defaultValue={district} />
          <InputField label="Zip Code (Optional)" name="zipCode" type="text" placeholder="Enter zip code" defaultValue={zipCode} />
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Book
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBooks;