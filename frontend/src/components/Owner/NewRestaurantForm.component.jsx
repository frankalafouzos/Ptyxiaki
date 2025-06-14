import React, { useState, useEffect, useRef } from "react";
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
    "closedDays",
  ];

  fieldsToCompare.forEach((field) => {
    if (newData[field] !== undefined && newData[field] !== null) {
      // Special handling for array comparison (closedDays)
      if (Array.isArray(newData[field])) {
        // If arrays are different lengths or content is different
        if (
          !originalData[field] ||
          JSON.stringify(newData[field].sort()) !==
          JSON.stringify(originalData[field].sort())
        ) {
          changes[field] = {
            old: originalData[field] || [],
            new: newData[field],
          };
        }
      } else if (String(newData[field]) !== String(originalData[field])) {
        // Standard comparison for non-array fields
        changes[field] = {
          old: originalData[field],
          new: newData[field],
        };
      }
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

  console.log("Original images:", originalImages);
  console.log("Uploaded images:", uploadedImages);
  console.log("Deleted images:", deletedImages);

  // Track added images - files can't be serialized in JSON
  if (uploadedImages && uploadedImages.length > 0) {
    // We need to strip out the actual File objects as they can't be serialized
    changes.added = uploadedImages.map((img) => {
      // Just record that we have new images - actual upload will happen separately
      return {
        name: img.name || "new-image",
        size: img.size || 0,
        type: img.type || "image/jpeg",
        pending: true,
      };
    });
  }

  // Track deleted images - make sure we have the image ID
  if (deletedImages && deletedImages.length > 0) {
    changes.deleted = deletedImages.map((img) => {
      return {
        id: img._id || img.id,
        url: img.url || img.imageUrl || img.link,
        path: img.path || "",
      };
    });
  }

  console.log("Original images:", originalImages?.length || 0);
  console.log("Uploaded images count:", uploadedImages?.length || 0);
  console.log("Deleted images count:", deletedImages?.length || 0);

  // Return non-null even if only metadata with no actual files
  // This ensures the backend knows we have image changes
  if (uploadedImages?.length > 0 || deletedImages?.length > 0) {
    console.log("Image changes detected");
    return changes;
  }

  return null;
};

// Helper function to detect order changes between original and new images
const detectOrderChanges = (originalOrder, newOrder) => {
  if (originalOrder.length !== newOrder.length) return true;
  for (let i = 0; i < originalOrder.length; i++) {
    if (originalOrder[i].id !== newOrder[i].id || originalOrder[i].order !== newOrder[i].order) {
      return true;
    }
  }
  return false;
};

// Move uploadImages function outside of component so it can be accessed by submitRestaurantEdit
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

  return uploadedImageUrls;
};

// Submit restaurant edit function
const submitRestaurantEdit = async (
  restaurantId,
  formData,
  originalData,
  uploadedImages,
  deletedImages,
  owner,
  capacityChanges,
  closedDaysChanges,
  orderChanges
) => {
  try {
    // Make sure owner is defined
    if (!owner) {
      console.error("Owner ID is missing");
      throw new Error("Owner ID is required to submit edit");
    }

    // Debug owner ID
    console.log("Owner ID being sent:", owner);
    console.log("Owner ID type:", typeof owner);

    // Detect changes
    const changes = detectChanges(originalData, formData);

    // Track image changes - ensure we always record if there are uploads/deletions
    const hasImageChanges =
      uploadedImages.length > 0 || deletedImages.length > 0;
    const imageChanges = trackImageChanges(
      originalData.images,
      uploadedImages,
      deletedImages
    );

    if (imageChanges || hasImageChanges) {
      changes.images_changes = imageChanges || {
        added: uploadedImages.length > 0 ? [{ pending: true }] : [],
        deleted:
          deletedImages.length > 0
            ? deletedImages.map((img) => ({
              id: img._id || img.id || "unknown",
            }))
            : [],
      };
      console.log("Image changes detected and added to request");
    }

    // Add capacity changes if any
    if (capacityChanges) {
      changes.capacity = capacityChanges;
      console.log("Capacity changes added to request:", capacityChanges);
    }

    // Add closed days changes if any
    if (closedDaysChanges) {
      changes.closedDays = closedDaysChanges;
      console.log("Closed days changes added to request:", closedDaysChanges);
    }

        // Add image order changes if any
    if (orderChanges) {
      changes.images_order = orderChanges;
      console.log("Image order changes added to request:", orderChanges);
    }

    // Check if there are any changes
    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected");
      return null;
    }

    // Log detected changes for debugging
    console.log("All detected changes:", changes);

    // Create request payload with string ownerId
    const requestPayload = {
      restaurantId,
      owner: owner.toString(),
      updatedData: formData,
      changes, // This now includes all changes: basic fields, images, capacity, closed days
    };

    console.log(
      "Full request payload:",
      JSON.stringify(requestPayload, null, 2)
    );

    // Submit the edit request
    const response = await fetch(
      process.env.REACT_APP_API_URL + "/api/pending-edits/submit-edit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      }
    );

    // Log raw response for debugging
    console.log("Response status:", response.status, response.statusText);
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      throw new Error(`Failed to submit edit: ${responseText}`);
    }

    const result = JSON.parse(responseText);

    // After successful submission, upload any new images if needed
    if (result && result.pendingEdit && uploadedImages.length > 0) {
      console.log("Uploading images for pending edit:", result.pendingEdit._id);
      // We need to upload the images separately since they can't be sent as JSON
      await uploadImages(uploadedImages, {
        imageID: originalData.imageID,
        _id: result.pendingEdit._id,
      });
    }

    return result;
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
  const [originalImageOrder, setOriginalImageOrder] = useState([]); // Store original image order
  const authUser = useAuthUser();
  const email = authUser.email;
  const [loading, setLoading] = useState(true);
  const [Owner, setOwner] = useState(null);
  const imageUploaderRef = useRef();

  // Track image changes for deletion
  const handleImageDelete = (deletedImage) => {
    console.log("Deleting image:", deletedImage);

    // Add to deletedImages for tracking
    setDeletedImages((prev) => [...prev, deletedImage]);

    // Update the images array using a more robust approach
    setImages((prevImages) => {
      console.log("Current images before filter:", prevImages);

      // Try to match by multiple possible ID fields
      return prevImages.filter((img) => {
        // Check against various possible ID fields
        const deletedId = deletedImage.id || deletedImage._id;
        const imgId = img.id || img._id;

        // Also try matching on URL if IDs don't match
        const urlMatches =
          img.link === deletedImage.src ||
          img.link === deletedImage.link ||
          img.url === deletedImage.src;

        // Keep the image if its ID doesn't match the deleted image's ID
        // and its URL doesn't match either
        return imgId !== deletedId && !urlMatches;
      });
    });
  };

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
          // Use DefaultClosedDays directly if available
          closedDays: DefaultClosedDays || restaurantData.closedDays || [],
        };

        setFormData(formattedData);

        // Store original data for comparison when submitting edits
        setOriginalData({
          ...restaurantData,
          openHour: restaurantData.openHour, // Keep original format for comparison
          closeHour: restaurantData.closeHour,
          closedDays: DefaultClosedDays || restaurantData.closedDays || [], // Use same source
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
          setOriginalImageOrder(imagesData.map(img => ({ id: img._id || img.id, order: img.order })));
          setOriginalData((prev) => ({ ...prev, images: imagesData }));
        } else {
          console.error("Failed to fetch images:", imagesResponse.statusText);
        }
        setImageID(restaurantData.imageID || "");
      }
    };
    getRestaurantInfo();
  }, [restaurantData, capacities, DefaultClosedDays]); // Add DefaultClosedDays to dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmitAdd = async (e) => {
    e.preventDefault();

    console.log("Submitting restaurant data...");
    let restaurantId;
    ownerId = Owner._id;

    const orderedImageData = imageUploaderRef.current.getOrderedImages();
    const orderedNewImages = orderedImageData.newImages;

    const imagesToUpload = orderedNewImages.map((image, index) => {
      // Attach order property to the image
      image.order = index + 1;
      return image;
    });

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

      // Use the ordered images for upload
      await uploadImages(imagesToUpload, restaurantData);

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
            restaurantId,
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
          restaurantId,
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

      // Track capacity changes
      const capacityChanges =
        formData.tablesForTwo !== capacities?.tablesForTwo ||
          formData.tablesForFour !== capacities?.tablesForFour ||
          formData.tablesForSix !== capacities?.tablesForSix ||
          formData.tablesForEight !== capacities?.tablesForEight
          ? {
            old: {
              tablesForTwo: capacities?.tablesForTwo,
              tablesForFour: capacities?.tablesForFour,
              tablesForSix: capacities?.tablesForSix,
              tablesForEight: capacities?.tablesForEight,
            },
            new: {
              tablesForTwo: formData.tablesForTwo,
              tablesForFour: formData.tablesForFour,
              tablesForSix: formData.tablesForSix,
              tablesForEight: formData.tablesForEight,
            },
          }
          : null;

      // Track closed days changes
      const originalClosedDays = DefaultClosedDays || [];
      const newClosedDays = formData.closedDays || [];

      // Add debugging to see actual values
      console.log("DefaultClosedDays:", DefaultClosedDays);
      console.log("formData.closedDays:", formData.closedDays);

      // Better comparison of arrays - normalize to strings for comparison
      let hasClosedDaysChanges = false;
      if (!originalClosedDays?.length && !newClosedDays?.length) {
        // Both empty - no change
        hasClosedDaysChanges = false;
      } else if (
        (originalClosedDays?.length || 0) !== (newClosedDays?.length || 0)
      ) {
        // Different lengths - definitely changed
        hasClosedDaysChanges = true;
      } else {
        // Same length - ensure string comparison
        const sortedOriginal = [...(originalClosedDays || [])]
          .sort()
          .map(String);
        const sortedNew = [...(newClosedDays || [])].sort().map(String);
        hasClosedDaysChanges =
          JSON.stringify(sortedOriginal) !== JSON.stringify(sortedNew);
      }

      // Add extra debugging to see exact values being compared
      console.log(
        "Sorted Original:",
        JSON.stringify([...(originalClosedDays || [])].sort())
      );
      console.log(
        "Sorted New:",
        JSON.stringify([...(newClosedDays || [])].sort())
      );

      const closedDaysChanges = hasClosedDaysChanges
        ? {
          old: originalClosedDays,
          new: newClosedDays,
        }
        : null;

      // Verify the result
      console.log("Has closed days changes:", hasClosedDaysChanges);
      console.log("Closed days changes:", closedDaysChanges);

      console.log("Capacity changes:", capacityChanges);
      console.log("Closed days changes:", closedDaysChanges);
      console.log("Image changes - Deleted:", deletedImages);
      console.log("Image changes - Uploaded:", uploadedImages);

      // Get ordered images from the ImageUploader
      const orderedImageData = imageUploaderRef.current.getOrderedImages();
      const { allImages, existingImages, newImages } = orderedImageData;

      const orderChanged = detectOrderChanges(originalImageOrder, allImages);

      const orderChanges = orderChanged
        ? {
          old: originalImageOrder,
          new: allImages,
        }
        : null;

      // Add order property to each image before upload
      const imagesToUpload = newImages.map((image, index) => {
        // Attach order property to the image
        image.order = index + 1;
        return image;
      });

      // Submit all changes in a single request - pass capacity and closed days directly
      const result = await submitRestaurantEdit(
        restaurantData._id,
        updatedFormData,
        originalData,
        imagesToUpload,
        deletedImages,
        Owner._id,
        capacityChanges,
        closedDaysChanges,
        orderChanges
      );

      // If no changes or submission failed
      if (!result) {
        return;
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
            flexWrap: "wrap",
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
                  whiteSpace: "nowrap",
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
        ref={imageUploaderRef} // Add the ref here
        setImages={setUploadedImages}
        initialImages={images}
        onExistingImageRemoved={handleImageDelete}
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
