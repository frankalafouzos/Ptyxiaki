import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const RestaurantForm = ({ restaurantData, handleSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    location: '',
    imageID: '',
    phone: '',
    email: '',
    description: '',
    tables: '',
    seatsPerTable: '',
    Bookingduration: '',
    openHour: '',
    closeHour: '',
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    if (restaurantData) {
      setFormData(restaurantData);
      setImages(restaurantData.images || []);
    }
  }, [restaurantData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const imageFormData = new FormData();
    imageFormData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/images/upload', {
        method: 'POST',
        body: imageFormData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      const data = await response.json();
      setImages([...images, data.imageUrl]);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleImageDelete = (imageUrl) => {
    setImages(images.filter(image => image !== imageUrl));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit({ ...formData, images });
  };

  return (
    <form onSubmit={onSubmit} className="form">
      <h1 className="title">{restaurantData ? 'Edit Restaurant' : 'Add Restaurant'}</h1>
      <h3>Please add the information of your restaurant below: </h3>
      <div>
      <label>Restaurant Name:</label>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Restaurant Name"
        className='form-control'
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
        className='form-control'
        required
      />
      </div>
      <div>
      <label>Category:</label>
      <input
        name="category"
        value={formData.category}
        onChange={handleChange}
        placeholder="Category"
        className='form-control'
        required
      />
      </div>
      <div>
      <label>Location:</label>
      <input
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        className='form-control'
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
        className='form-control'
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
        className='form-control'
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
        className='form-control'
        required
      />
      </div>
      <div>
      <label>Number of Tables:</label>
      <input
        name="tables"
        value={formData.tables}
        onChange={handleChange}
        placeholder="Number of Tables"
        className='form-control'
        required
      />
      </div>
      <div>
      <label>Seats Per Table:</label>
      <input
        name="seatsPerTable"
        value={formData.seatsPerTable}
        onChange={handleChange}
        placeholder="Seats Per Table"
        className='form-control'
        required
      />
      </div>
      <div>
      <label>Booking Duration (minutes):</label>
      <input
        name="Bookingduration"
        value={formData.Bookingduration}
        onChange={handleChange}
        placeholder="Booking Duration (minutes)"
        className='form-control'
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
        type='time'
        className='form-control'
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
        type='time'
        className='form-control'
        required
      />
      </div>
      <div>
      <label>Images:</label>
      <input type="file" onChange={handleImageUpload} className='form-control form-control-lg'/>
      </div>
      <div>
      {images.map((image, index) => (
        <div key={index}>
        <img src={image} alt={`restaurant-${index}`} width="100" />
        <button type="button" onClick={() => handleImageDelete(image)}>Delete</button>
        </div>
      ))}
      </div>
      <button type="submit">{restaurantData ? 'Save Changes' : 'Add Restaurant'}</button>
    </form>
    );
};

export default RestaurantForm;
