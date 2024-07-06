import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchOwner } from '../../scripts/fetchUser'; 
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import ImageUploader from './ImageUploader.component';


const RestaurantForm = ({ restaurantData, handleSubmit, ownerId, Images }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    description: '',
    tablesForTwo: '',
    tablesForFour: '',
    tablesForSix: '',
    tablesForEight: '',
    Bookingduration: '',
    openHour: '',
    closeHour: '',
  });

  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [imageID, setImageID] = useState('');
  const authUser = useAuthUser();
  const email = authUser.email;
  const [loading, setLoading] = useState(true);
  const [Owner, setOwner] = useState(null);

  useEffect(() => {
    fetchOwner(email, setLoading, setOwner);
  }, [email]);

  useEffect(() => {
    const getRestaurantInfo = async () => {
      if (restaurantData) {
        setFormData({
          ...restaurantData,
          openHour: minutesToTime(restaurantData.openHour),
          closeHour: minutesToTime(restaurantData.closeHour),
        });
        const imagesResponse = await fetch(`http://localhost:5000/images/getRestaurantImages/${restaurantData.imageID}`, {
          method: 'GET'
        });
    
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json(); // Extract JSON data from response
    
          console.log('Fetched images:', imagesData); // Verify the fetched images in console
    
          // Assuming imagesData is an array of image objects
          setImages(imagesData); // Set the fetched images into state
        } else {
          console.error('Failed to fetch images:', imagesResponse.statusText);
        }
        setImageID(restaurantData.imageID || '');
      }
    };
    getRestaurantInfo();
  }, [restaurantData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages([...uploadedImages, ...files]);
    console.log('Uploaded files:', files);
  };

  const handleImageDelete = (imageId) => {
    console.log('Deleting image with ID:', imageId);
    setDeletedImages([...deletedImages, imageId]);
    setImages(images.map(image => {
      if (image._id === imageId) {
        return { ...image, isDeleted: true };
      }
      return image;
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting restaurant data...');
    let restaurantId;
    ownerId = Owner._id;

    try {
      const dataToSubmit = {
        ...formData,
        openHour: timeToMinutes(formData.openHour),
        closeHour: timeToMinutes(formData.closeHour),
        status: 'pending approval',
      };

      const restaurantResponse = await fetch('http://localhost:5000/restaurants/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...dataToSubmit, owner: ownerId }),
      });

      if (!restaurantResponse.ok) {
        throw new Error('Failed to add restaurant');
      }

      const restaurantData = await restaurantResponse.json();
      restaurantId = restaurantData._id;
      const newImageID = restaurantData.imageID;
      setImageID(newImageID);
      console.log('Restaurant added with ID:', restaurantId);

      const capacityData = {
        restaurantid: restaurantId,
        tablesForTwo: formData.tablesForTwo,
        tablesForFour: formData.tablesForFour,
        tablesForSix: formData.tablesForSix,
        tablesForEight: formData.tablesForEight,
      };

      const capacityResponse = await fetch('http://localhost:5000/restaurants/restaurant-capacities/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(capacityData),
      });

      if (!capacityResponse.ok) {
        throw new Error('Failed to add restaurant capacity');
      }

      console.log('Restaurant capacity added for restaurant ID:', restaurantId);

      const uploadedImageUrls = [];
      for (const image of uploadedImages) {
        const imageFormData = new FormData();
        imageFormData.append('image', image);
      
        console.log(`Calling => http://localhost:5000/images/upload/${restaurantData.imageID}`);
      
        try {
          const imageResponse = await fetch(`http://localhost:5000/images/upload/${restaurantData.imageID}`, {
            method: 'POST',
            body: imageFormData,
          });
      
          if (!imageResponse.ok) {
            throw new Error('Failed to upload image');
          }
      
          const imageData = await imageResponse.json();
          uploadedImageUrls.push(imageData.imageUrl);
          console.log('Image uploaded:', imageData.imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          // Handle error as needed
        }
      }
      

      console.log('Images uploaded for restaurant ID:', restaurantId);

      const updateResponse = await fetch(`http://localhost:5000/restaurants/edit/${restaurantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageID: newImageID, images: uploadedImageUrls }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update restaurant with image links');
      }

      console.log('Restaurant updated with images for restaurant ID:', restaurantId);
      console.log('Adding restaurant to owner with ID:', ownerId);

      const addRestaurantToOwnerResponse = await fetch('http://localhost:5000/owners/addRestaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: ownerId,
          restaurantId: restaurantId,
        }),
      });

      if (!addRestaurantToOwnerResponse.ok) {
        throw new Error('Failed to add restaurant to owner', ownerId);
      }

      console.log('Restaurant added to owner with ID:', ownerId);

      toast.success('Restaurant added successfully');
    } catch (error) {
      if (restaurantId) {
        await fetch("http://localhost:5000/restaurants/deleteAll/"+restaurantData._id, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerId: Owner._id,
          })
        });
        console.log('Rolled back changes for restaurant ID:', restaurantId);
      }
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h1 className="title">{restaurantData ? 'Edit Restaurant' : 'Add Restaurant'}</h1>
      <h3>Please add the information of your restaurant below:</h3>
      <div>
        <label>Restaurant Name:</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Restaurant Name"
          className="form-control"
          required
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="form-control"
          type="number"
          required
        />
      </div>
      <div>
        <label>Category:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">No category selected</option>
          <option value="Italian">Italian</option>
          <option value="Greek">Greek</option>
          <option value="French">French</option>
          <option value="Chinese">Chinese</option>
          <option value="Mexican">Mexican</option>
          <option value="American">American</option>
          <option value="Turkish">Turkish</option>
          <option value="Street food">Street food</option>
        </select>
      </div>

      <div>
        <label>Location:</label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="form-control"
          required
        />
      </div>
      <div>
        <label>Phone:</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="form-control"
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="form-control"
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="form-control"
          required
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }} className="table-capacity-row">
        <div className="table-capacity-input">
          <label>Tables for 2:</label>
          <input
            name="tablesForTwo"
            value={formData.tablesForTwo}
            onChange={handleChange}
            placeholder="Tables for 2"
            className="form-control"
            type="number"
            min="0"
            required
          />
          </div>
          <div className="table-capacity-input">
            <label>Tables for 4:</label>
            <input
              name="tablesForFour"
              value={formData.tablesForFour}
              onChange={handleChange}
              placeholder="Tables for 4"
              className="form-control"
              type="number"
              min="0"
              required
            />
          </div>
          <div className="table-capacity-input">
            <label>Tables for 6:</label>
            <input
              name="tablesForSix"
              value={formData.tablesForSix}
              onChange={handleChange}
              placeholder="Tables for 6"
              className="form-control"
              type="number"
              min="0"
              required
            />
          </div>
          <div className="table-capacity-input">
            <label>Tables for 8:</label>
            <input
              name="tablesForEight"
              value={formData.tablesForEight}
              onChange={handleChange}
              placeholder="Tables for 8"
              className="form-control"
              type="number"
              min="0"
              required
            />
          </div>
        </div>
  
        <div>
          <label>Booking Duration (minutes):</label>
          <input
            name="Bookingduration"
            value={formData.Bookingduration}
            onChange={handleChange}
            placeholder="Booking Duration (minutes)"
            className="form-control"
            required
          />
        </div>
        <div>
          <label>Open Hour (HH:MM):</label>
          <input
            name="openHour"
            value={formData.openHour}
            onChange={handleChange}
            placeholder="Open Hour"
            type="time"
            className="form-control"
            required
          />
        </div>
        <div>
          <label>Close Hour (HH:MM):</label>
          <input
            name="closeHour"
            value={formData.closeHour}
            onChange={handleChange}
            placeholder="Close Hour"
            type="time"
            className="form-control"
            required
          />
        </div>
        <ImageUploader initialImages={images}/>
        <button type="submit">{restaurantData ? 'Save Changes' : 'Add Restaurant'}</button>
      </form>
    );
  };
  
  // Utility functions for converting time formats
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };
  
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  export default RestaurantForm;
