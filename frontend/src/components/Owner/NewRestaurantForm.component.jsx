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
  // Filter out new images (those without proper ObjectId) from order comparison
  const validNewOrder = newOrder.filter(img => 
    img.id && 
    img.id.match(/^[0-9a-fA-F]{24}$/) // Valid MongoDB ObjectId pattern
  );
  
  const validOriginalOrder = originalOrder.filter(img => 
    img.id && 
    img.id.match(/^[0-9a-fA-F]{24}$/)
  );
  
  if (validOriginalOrder.length !== validNewOrder.length) return true;
  
  for (let i = 0; i < validOriginalOrder.length; i++) {
    if (validOriginalOrder[i].id !== validNewOrder[i].id || 
        validOriginalOrder[i].order !== validNewOrder[i].order) {
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
    if (!owner) {
      console.error("Owner ID is missing");
      throw new Error("Owner ID is required to submit edit");
    }

    console.log("Owner ID being sent:", owner);

    // FIRST: Upload new images to S3 and get their S3 keys
let newImageData = [];
if (uploadedImages.length > 0) {
  console.log("Uploading new images to S3...");
  
  for (const image of uploadedImages) {
    console.log("Uploading file:", image);
    console.log("File name:", image.name);
    console.log("File size:", image.size);
    console.log("File type:", image.type);
    
    // Check if image is a File object
    if (!(image instanceof File)) {
      console.error("Image is not a File object:", image);
      // Try to extract the actual file from the image object
      const actualFile = image.file || image.src || image;
      if (actualFile instanceof File) {
        console.log("Found actual file in image object");
        image = actualFile;
      } else {
        console.error("Cannot find valid File object, skipping image");
        continue;
      }
    }
    
    const imageFormData = new FormData();
    imageFormData.append("image", image);
    
    // Debug FormData contents
    for (let pair of imageFormData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    const order = image.order || 1;
    
    try {
      const imageResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/images/upload-for-edit/${restaurantId}?order=${order}`,
        {
          method: "POST",
          body: imageFormData,
        }
      );

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(`Failed to upload image: ${errorData.error || imageResponse.statusText}`);
      }

      const s3Data = await imageResponse.json();
      newImageData.push({
        s3Key: s3Data.s3Key,
        s3Url: s3Data.s3Url,
        fileName: s3Data.fileName,
        order: order,
        size: s3Data.size,
        type: s3Data.type,
        pending: true  // Mark as pending
      });
      console.log("Image uploaded to S3:", s3Data.s3Key);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
}
    

    // Detect changes
    const changes = detectChanges(originalData, formData);

    // Track image changes with S3 data
    const hasImageChanges = uploadedImages.length > 0 || deletedImages.length > 0;
    
    if (hasImageChanges) {
      const imageChanges = {
        added: newImageData,  // S3 data instead of MongoDB IDs
        deleted: deletedImages.map((img) => ({
          id: img._id || img.id,
          url: img.url || img.imageUrl || img.link,
          path: img.path || "",
        }))
      };
      
      changes.images_changes = imageChanges;
      console.log("Image changes with S3 data:", imageChanges);
    }

    // Add capacity changes if any
    if (capacityChanges) {
      changes.capacity = capacityChanges;
    }

    // Add closed days changes if any
    if (closedDaysChanges) {
      changes.closedDays = closedDaysChanges;
    }

    // For image order changes, only include existing images (not new ones yet)
    if (orderChanges) {
      // Only include existing images with valid MongoDB IDs in order changes
      const validOrderChanges = {
        old: orderChanges.old || [],
        new: orderChanges.new.filter(img => 
          img.id && img.id.match(/^[0-9a-fA-F]{24}$/)
        )
      };
      
      if (validOrderChanges.new.length > 0 || validOrderChanges.old.length > 0) {
        changes.images_order = validOrderChanges;
        console.log("Image order changes (existing images only):", validOrderChanges);
      }
    }

    // Check if there are any changes
    if (Object.keys(changes).length === 0) {
      toast.info("No changes detected");
      return null;
    }

    console.log("All detected changes:", changes);

    // Create request payload
    const requestPayload = {
      restaurantId,
      owner: owner.toString(),
      updatedData: formData,
      changes,
    };

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

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      throw new Error(`Failed to submit edit: ${responseText}`);
    }

    const result = JSON.parse(responseText);
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

    let hasClosedDaysChanges = false;
    if (!originalClosedDays?.length && !newClosedDays?.length) {
      hasClosedDaysChanges = false;
    } else if (
      (originalClosedDays?.length || 0) !== (newClosedDays?.length || 0)
    ) {
      hasClosedDaysChanges = true;
    } else {
      const sortedOriginal = [...(originalClosedDays || [])]
        .sort()
        .map(String);
      const sortedNew = [...(newClosedDays || [])].sort().map(String);
      hasClosedDaysChanges =
        JSON.stringify(sortedOriginal) !== JSON.stringify(sortedNew);
    }

    const closedDaysChanges = hasClosedDaysChanges
      ? {
        old: originalClosedDays,
        new: newClosedDays,
      }
      : null;

    // Get ordered images from the ImageUploader
    const orderedImageData = imageUploaderRef.current.getOrderedImages();
    const { allImages, newImages } = orderedImageData;

    console.log("=== DEBUG ImageUploader Output ===");
    console.log("orderedImageData:", orderedImageData);
    console.log("allImages:", allImages);
    console.log("newImages:", newImages);
    
    // Use uploadedImages state instead of newImages from getOrderedImages
    console.log("uploadedImages state:", uploadedImages);
    console.log("=== END DEBUG ===");

    // Only detect order changes for existing images (with valid ObjectIds)
    const existingImagesOnly = allImages.filter(img => 
      img.id && img.id.match(/^[0-9a-fA-F]{24}$/)
    );

    const orderChanged = detectOrderChanges(originalImageOrder, existingImagesOnly);

    const orderChanges = orderChanged
      ? {
        old: originalImageOrder,
        new: existingImagesOnly.map((img, index) => ({
          id: img.id,
          order: index + 1
        })),
      }
      : null;

    // Use the uploadedImages state instead of trying to extract from newImages
    const imagesToUpload = uploadedImages.map((image, index) => {
      // Attach order property to the file
      image.order = existingImagesOnly.length + index + 1;
      return image;
    });

    console.log("Final imagesToUpload array:", imagesToUpload);

    // Submit all changes - images will be uploaded first to get real IDs
    const result = await submitRestaurantEdit(
      restaurantData._id,
      updatedFormData,
      originalData,
      imagesToUpload, // Use uploadedImages state
      deletedImages,
      Owner._id,
      capacityChanges,
      closedDaysChanges,
      orderChanges
    );

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
