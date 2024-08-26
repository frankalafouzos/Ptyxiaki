import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fetchOwner } from '../../scripts/fetchUser'; 
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import ImageUploader from './ImageUploader.component';
import listOfCities from '../../listOfCities';


const RestaurantForm = ({ restaurantData, capacities,  handleSubmit, ownerId, screenType }) => {
  const [formData, setFormData] = useState({
    // name: '',
    // price: '',
    // category: '',
    // location: '',
    // phone: '',
    // email: '',
    // description: '',
    // tablesForTwo: '',
    // tablesForFour: '',
    // tablesForSix: '',
    // tablesForEight: '',
    // Bookingduration: '',
    // openHour: '',
    // closeHour: '',
    name: 'Test Restaurant',
    price: '10',
    category: 'Greek',
    location: 'Elliniko',
    phone: '6944885589',
    email: 'frankyaek@gmail.com',
    description: 'Test teest',
    tablesForTwo: '2',
    tablesForFour: '4',
    tablesForSix: '6',
    tablesForEight: '8',
    Bookingduration: '90',
    openHour: '09:00',
    closeHour: '22:00',
  });

  const sortedCities = listOfCities.sort((a, b) => a.localeCompare(b));
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
        tablesForTwo: capacities.tablesForTwo,
        tablesForFour: capacities.tablesForFour,
        tablesForSix: capacities.tablesForSix,
        tablesForEight: capacities.tablesForEight,
          openHour: minutesToTime(restaurantData.openHour),
          closeHour: minutesToTime(restaurantData.closeHour),
        });
        console.log("Capacities: ", capacities);
        const imagesResponse = await fetch(`http://localhost:5000/images/getRestaurantImages/${restaurantData.imageID}`, {
          method: 'GET'
        });
    
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json(); // Extract JSON data from response
    
          console.log('Fetched images:', imagesData); // Verify the fetched images in console
    
          // Assuming imagesData is an array of image objects
          setImages(imagesData); // Set the fetched images into state
          console.log('Images:', images);
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
  
  const onSubmitAdd = async (e) => {
    e.preventDefault();
    if (restaurantData) {
      const updatedRestaurantData = {
        ...formData,
        openHour: timeToMinutes(formData.openHour),
        closeHour: timeToMinutes(formData.closeHour),
        imageID,
        _id: restaurantData._id,
      };

      
    }
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

      const uploadImages = async (uploadedImages, restaurantData) => {
        if (!Array.isArray(uploadedImages) || uploadedImages.length === 0) {
          console.log('No images to upload');
          return;
        }
      
        if (!restaurantData || !restaurantData.imageID) {
          console.log('Invalid restaurant data');
          return;
        }
      
        console.log('Starting image upload process');
        const uploadedImageUrls = [];
        let i = 1;  // Initialize order value here
      
        for (const image of uploadedImages) {
          const imageFormData = new FormData();
          imageFormData.append('image', image);
      
          // Assigning order if not present
          const order = image.order || i;
          console.log(`Calling => http://localhost:5000/images/upload/${restaurantData.imageID}?order=${order}`);
      
          try {
            const imageResponse = await fetch(`http://localhost:5000/images/upload/${restaurantData.imageID}?order=${order}`, {
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
      
          i++;  // Increment the order for the next image
        }
      };
      

      await uploadImages(uploadedImages, restaurantData);

      console.log('Images uploaded for restaurant ID:', restaurantId);

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

  const onSubmitEdit = async (e) => {
    e.preventDefault();
    if (restaurantData) {
      const updatedRestaurantData = {
        name: formData.name,
        price: formData.price,
        category: formData.category,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        description: formData.description,
        Bookingduration: formData.Bookingduration,
        openHour: timeToMinutes(formData.openHour),
        closeHour: timeToMinutes(formData.closeHour),
        ApplicationCategory: 'Edit',
        ExistingRestaurantId: restaurantData._id,
        status: 'pending approval',
        owner: Owner._id,
      };

      const response = await fetch('http://localhost:5000/pendingRestaurants/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRestaurantData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit restaurant for approval');
      }

      const pendingApprovalData = await response.json();
      const newImageID = pendingApprovalData.imageID;
      setImageID(newImageID);
      console.log('Restaurant data submitted for approval');

      const capacityData = {
        restaurantid: pendingApprovalData._id,
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

      console.log('Restaurant capacity added for pending restaurant ID:', pendingApprovalData._id);

      const uploadImages = async (uploadedImages, pendingApprovalData) => {
        if (!Array.isArray(uploadedImages) || uploadedImages.length === 0) {
          console.log('No images to upload');
          return;
        }

        if (!pendingApprovalData || !pendingApprovalData.imageID) {
          console.log('Invalid pending approval data');
          return;
        }

        console.log('Starting image upload process for pending approval');
        let i = 1;
        const uploadedImageUrls = [];
        for (const image of uploadedImages) {
          const imageFormData = new FormData();
          imageFormData.append('image', image);
          imageFormData.append('order', i);
          i++;
          console.log(`Calling => http://localhost:5000/images/upload/${pendingApprovalData.imageID}?order=`+i);

          try {
            const imageResponse = await fetch(`http://localhost:5000/images/upload/${pendingApprovalData.imageID}?order=${i}`, {
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
      };

      await uploadImages(uploadedImages, pendingApprovalData);

      console.log('Images uploaded for pending approval restaurant ID:', pendingApprovalData._id);

      toast.success('Restaurant edit submitted for approval');
    }
  };

  return (
    <form  onSubmit={screenType === 'add' ? onSubmitAdd : onSubmitEdit} className="form">
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
          style={{ height: '40px' }}
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
      <label htmlFor="location">Location:</label>
      <select
        name="location"
        value={formData.location}
        onChange={handleChange}
        className="form-control"
        style={{ height: '40px' }}
        required
      >
        <option value="" disabled>Select a city</option>
        {sortedCities.map((city, index) => (
          <option key={index} value={city}>
            {city}
          </option>
        ))}
      </select>
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
      <ImageUploader setImages={setUploadedImages} initialImages={images} />
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
