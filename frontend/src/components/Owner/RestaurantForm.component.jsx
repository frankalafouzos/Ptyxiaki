import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchOwner } from "../../scripts/fetchUser";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import ImageUploader from "./ImageUploader.component";
import listOfCities from "../../listOfCities";

// Helper function to detect changes between original and updated data
const detectChanges = (originalData, newData) => {
  const changes = {};

  // Fields to compare
  const fieldsToCompare = [
    "name",
    "price",
    "category",
    "location",
    "phone",
    "email",
    "description",
    "Bookingduration",
    "openHour",
    "closeHour",
  ];

  fieldsToCompare.forEach((field) => {
    if (
      newData[field] !== undefined &&
      newData[field] !== null &&
      String(newData[field]) !== String(originalData[field])
    ) {
      changes[field] = {
        old: originalData[field],
        new: newData[field],
      };
    }
  });

  return changes;
};

// Function to track image changes
const trackImageChanges = (originalImages, uploadedImages, deletedImages) => {
  const changes = {
    added: [],
    deleted: [],
  };

  // Track added images
  if (uploadedImages && uploadedImages.length > 0) {
    changes.added = uploadedImages.map((img) => ({
      id: img.id || null,
      file: img, // The actual file object for upload
    }));
  }

  // Track deleted images
  if (deletedImages && deletedImages.length > 0) {
    changes.deleted = deletedImages.map((img) => ({
      id: img._id || img.id,
      url: img.url || img.imageUrl,
    }));
  }

  return changes.added.length > 0 || changes.deleted.length > 0
    ? changes
    : null;
};

// Submit restaurant edit function
const submitRestaurantEdit = async (
  restaurantId,
  formData,
  originalData,
  uploadedImages,
  deletedImages,
  owner
) => {
  try {
    // Detect changes - using the function defined above
    const changes = detectChanges(originalData, formData);

    // Track image changes - using the function defined above
    const imageChanges = trackImageChanges(
      originalData.images,
      uploadedImages,
      deletedImages
    );
    if (imageChanges) {
      changes.images_changes = imageChanges;
    }

    // Check if there are any changes
    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected");
      return null;
    }

    // Submit the edit request
    const response = await fetch(
      process.env.REACT_APP_API_URL + "/api/pending-edits/submit-edit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          owner,
          updatedData: formData,
          images_changes: imageChanges, // Send image changes separately if needed
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit edit: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting edit:", error);
    throw error;
  }
};

const RestaurantForm = ({
  restaurantData,
  capacities,
  DefaultClosedDays,
  handleSubmit,
  ownerId,
  screenType,
}) => {
  const [formData, setFormData] = useState({
    name: "Test Restaurant",
    price: "10",
    category: "Greek",
    location: "Elliniko",
    phone: "6944885589",
    email: "frankyaek@gmail.com",
    description: "Test teest",
    tablesForTwo: "2",
    tablesForFour: "4",
    tablesForSix: "6",
    tablesForEight: "8",
    Bookingduration: "90",
    openHour: "09:00",
    closeHour: "22:00",
    closedDays: [],
  });

  const sortedCities = listOfCities.sort((a, b) => a.localeCompare(b));
  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [imageID, setImageID] = useState("");
  const [originalData, setOriginalData] = useState(null); // Store original data for comparison
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
        const formattedData = {
          ...restaurantData,
          tablesForTwo: capacities?.tablesForTwo || "",
          tablesForFour: capacities?.tablesForFour || "",
          tablesForSix: capacities?.tablesForSix || "",
          tablesForEight: capacities?.tablesForEight || "",
          openHour: minutesToTime(restaurantData.openHour),
          closeHour: minutesToTime(restaurantData.closeHour),
          closedDays: restaurantData.closedDays || [],
        };

        setFormData(formattedData);

        // Store original data for comparison when submitting edits
        setOriginalData({
          ...restaurantData,
          openHour: restaurantData.openHour, // Keep original format for comparison
          closeHour: restaurantData.closeHour,
          images: [], // Will be filled below
        });

        console.log("Capacities: ", capacities);
        const imagesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/images/getRestaurantImages/${restaurantData.imageID}`,
          {
            method: "GET",
          }
        );

        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          console.log("Fetched images:", imagesData);
          setImages(imagesData);
          // Add images to original data
          setOriginalData((prev) => ({ ...prev, images: imagesData }));
        } else {
          console.error("Failed to fetch images:", imagesResponse.statusText);
        }
        setImageID(restaurantData.imageID || "");
      }
    };
    getRestaurantInfo();
  }, [restaurantData, capacities]); // Added capacities to dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const uploadImages = async (uploadedImages, restaurantData) => {
    if (!Array.isArray(uploadedImages) || uploadedImages.length === 0) {
      console.log("No images to upload");
      return;
    }

    if (!restaurantData || !restaurantData.imageID) {
      console.log("Invalid restaurant data");
      return;
    }

    console.log("Starting image upload process");
    const uploadedImageUrls = [];
    let i = 1; // Initialize order value here

    for (const image of uploadedImages) {
      const imageFormData = new FormData();
      imageFormData.append("image", image);

      // Assigning order if not present
      const order = image.order || i;
      console.log(
        `Calling => http://localhost:5000/images/upload/${restaurantData.imageID}?order=${order}`
      );

      try {
        const imageResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/images/upload/${restaurantData.imageID}?order=${order}`,
          {
            method: "POST",
            body: imageFormData,
          }
        );

        if (!imageResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const imageData = await imageResponse.json();
        uploadedImageUrls.push(imageData.imageUrl);
        console.log("Image uploaded:", imageData.imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle error as needed
      }

      i++; // Increment the order for the next image
    }
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
    console.log("Submitting restaurant data...");
    let restaurantId;
    ownerId = Owner._id;

    try {
      const dataToSubmit = {
        ...formData,
        openHour: timeToMinutes(formData.openHour),
        closeHour: timeToMinutes(formData.closeHour),
        status: "pending approval",
      };

      const restaurantResponse = await fetch(
        process.env.REACT_APP_API_URL + "/restaurants/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...dataToSubmit, owner: ownerId }),
        }
      );

      if (!restaurantResponse.ok) {
        throw new Error("Failed to add restaurant");
      }

      const restaurantData = await restaurantResponse.json();
      restaurantId = restaurantData._id;
      const newImageID = restaurantData.imageID;
      setImageID(newImageID);
      console.log("Restaurant added with ID:", restaurantId);

      const capacityData = {
        restaurantid: restaurantId,
        tablesForTwo: formData.tablesForTwo,
        tablesForFour: formData.tablesForFour,
        tablesForSix: formData.tablesForSix,
        tablesForEight: formData.tablesForEight,
      };

      const capacityResponse = await fetch(
        process.env.REACT_APP_API_URL +
          "/restaurants/restaurant-capacities/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(capacityData),
        }
      );

      if (!capacityResponse.ok) {
        throw new Error("Failed to add restaurant capacity");
      }

      console.log("Restaurant capacity added for restaurant ID:", restaurantId);

      await uploadImages(uploadedImages, restaurantData);

      console.log("Images uploaded for restaurant ID:", restaurantId);

      const addRestaurantToOwnerResponse = await fetch(
        process.env.REACT_APP_API_URL + "/owners/addRestaurant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: ownerId,
            restaurantId: restaurantId,
          }),
        }
      );

      if (!addRestaurantToOwnerResponse.ok) {
        throw new Error("Failed to add restaurant to owner", ownerId);
      }

      console.log("Restaurant added to owner with ID:", ownerId);

      await fetch(
        process.env.REACT_APP_API_URL + "/restaurants/default-closed-days/set",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurantId, // or pendingApprovalData._id
            closedDays: formData.closedDays,
          }),
        }
      );
      console.log("Closed days set for restaurant ID:", restaurantId);

      toast.success("Restaurant added successfully");
    } catch (error) {
      if (restaurantId) {
        await fetch(
          process.env.REACT_APP_API_URL +
            "/restaurants/deleteAll/" +
            restaurantData._id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ownerId: Owner._id,
            }),
          }
        );
        console.log("Rolled back changes for restaurant ID:", restaurantId);
      }
      toast.error(error.message);
    }
  };

  const onSubmitEdit = async (e) => {
    e.preventDefault();
    console.log("Edit form submitted");

    if (!restaurantData || !originalData) {
      toast.error("Missing restaurant data");
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        openHour: timeToMinutes(formData.openHour),
        closeHour: timeToMinutes(formData.closeHour),
      };

      // Submit only the changes using our new function
      const result = await submitRestaurantEdit(
        restaurantData._id,
        updatedFormData,
        originalData,
        uploadedImages,
        deletedImages,
        Owner._id
      );

      // If no changes or submission failed
      if (!result) {
        return;
      }

      // Handle capacity changes if needed
      if (
        formData.tablesForTwo !== capacities.tablesForTwo ||
        formData.tablesForFour !== capacities.tablesForFour ||
        formData.tablesForSix !== capacities.tablesForSix ||
        formData.tablesForEight !== capacities.tablesForEight
      ) {
        const capacityData = {
          restaurantid: result.pendingEdit._id, // Use the pending edit ID
          tablesForTwo: formData.tablesForTwo,
          tablesForFour: formData.tablesForFour,
          tablesForSix: formData.tablesForSix,
          tablesForEight: formData.tablesForEight,
        };

        await fetch(
          process.env.REACT_APP_API_URL +
            "/restaurants/restaurant-capacities/add",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(capacityData),
          }
        );
      }

      // Upload any new images if needed
      if (uploadedImages && uploadedImages.length > 0) {
        await uploadImages(uploadedImages, result.pendingEdit);
      }

      // Set closed days if they've changed
      const originalClosedDays = DefaultClosedDays || [];
      const newClosedDays = formData.closedDays || [];

      if (
        JSON.stringify(originalClosedDays) !== JSON.stringify(newClosedDays)
      ) {
        await fetch(
          process.env.REACT_APP_API_URL +
            "/restaurants/default-closed-days/set",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              restaurantId: result.pendingEdit._id,
              closedDays: formData.closedDays,
            }),
          }
        );
      }

      toast.success("Restaurant edit submitted for approval");
    } catch (error) {
      console.error("Error during edit submission:", error);
      toast.error(error.message || "Failed to submit edit");
    }
  };

  return (
    <form
      onSubmit={screenType === "add" ? onSubmitAdd : onSubmitEdit}
      className="form"
    >
      <h1 className="title">
        {restaurantData ? "Edit Restaurant" : "Add Restaurant"}
      </h1>
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
          style={{ height: "40px" }}
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
          style={{ height: "40px" }}
          required
        >
          <option value="" disabled>
            Select a city
          </option>
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
      <div
        style={{ display: "flex", flexDirection: "row", gap: "10px" }}
        className="table-capacity-row"
      >
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
      <div className="form-group">
        <label
          style={{
            display: "block",
            marginBottom: "12px",
            fontWeight: "600",
            fontSize: "18px",
            textAlign: "center",
          }}
        >
          Default Closed Days:
        </label>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            gap: "10px",
            flexWrap: "wrap", // ✅ allows it to break into rows on small screens
            maxWidth: "100%",
          }}
        >
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => {
            const isChecked = formData.closedDays.includes(day);
            return (
              <label
                key={day}
                style={{
                  cursor: "pointer",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  border: isChecked ? "2px solid #4caf50" : "1px solid #ccc",
                  backgroundColor: isChecked ? "#e8f5e9" : "#f9f9f9",
                  color: isChecked ? "#2e7d32" : "#555",
                  fontWeight: isChecked ? "600" : "400",
                  fontSize: "14px",
                  transition: "all 0.2s ease-in-out",
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "nowrap", // ✅ keeps label text on one line
                }}
              >
                <input
                  type="checkbox"
                  value={day}
                  checked={isChecked}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      closedDays: checked
                        ? [...prev.closedDays, day]
                        : prev.closedDays.filter((d) => d !== day),
                    }));
                  }}
                  style={{ display: "none" }}
                />
                {day}
              </label>
            );
          })}
        </div>
      </div>

      <ImageUploader
        setImages={setUploadedImages}
        initialImages={images.map((image, index) => ({ ...image, key: index }))}
      />
      <button type="submit">
        {restaurantData ? "Save Changes" : "Add Restaurant"}
      </button>
    </form>
  );
};

// Utility functions for converting time formats
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default RestaurantForm;
