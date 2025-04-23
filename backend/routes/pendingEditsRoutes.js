const express = require('express');
const router = express.Router();
const PendingEdits = require('../models/pendingEdits.model');
const Restaurant = require('../models/restaurant.model');
const Image = require('../models/images.model');
const Owner = require('../models/restaurantOwner.model');
const { deleteImage } = require('../functions/s3-utils');

// Submit a new edit request
router.post('/submit-edit', async (req, res) => {
  try {
    // Log full request body for debugging
    console.log("Received edit request:", JSON.stringify(req.body, null, 2));
    
    const { restaurantId, owner, ownerId, updatedData, images_changes, changes, capacityChanges, closedDaysChanges } = req.body;
    
    // Use the correct owner ID field (check both possible field names)
    const actualOwnerId = ownerId || owner;
    console.log("Owner ID being used:", actualOwnerId);

    if (!actualOwnerId) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Create new pending edit with explicit field mapping
    const pendingEdit = new PendingEdits({
      restaurantId: restaurantId,
      ownerId: actualOwnerId,  // Use the correct field name expected by your model
      changes: changes || {}, // Use provided changes or initialize empty
      status: 'pending approval',
      submittedAt: new Date()
    });

    // If no changes were provided but updatedData exists, generate them
    if (!changes && updatedData) {
      // Convert updates to change format (comparing with current values)
      for (const [field, newValue] of Object.entries(updatedData)) {
        if (restaurant[field] !== undefined && 
            String(restaurant[field]) !== String(newValue)) {
          pendingEdit.changes[field] = {
            old: restaurant[field],
            new: newValue
          };
        }
      }
    }

    // Include image changes if any
    if (images_changes) {
      pendingEdit.changes.images_changes = images_changes;
      console.log("Added image changes to pending edit:", images_changes);
    }

    // Include capacity changes if any
    if (capacityChanges) {
      pendingEdit.changes.capacity = capacityChanges;
      console.log("Added capacity changes to pending edit:", capacityChanges);
    }

    // Include closed days changes if any
    if (closedDaysChanges) {
      pendingEdit.changes.closedDays = closedDaysChanges;
      console.log("Added closed days changes to pending edit:", closedDaysChanges);
    }

    // Save only if there are actual changes
    if (Object.keys(pendingEdit.changes).length === 0) {
      return res.status(400).json({ error: 'No changes detected' });
    }

    console.log("About to save pending edit:", JSON.stringify(pendingEdit, null, 2));
    await pendingEdit.save();
    console.log("Pending edit saved successfully");
    
    res.status(201).json({ pendingEdit });
  } catch (error) {
    console.error('Error submitting edit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending edits for a specific owner
router.get('/owner/:ownerId', async (req, res) => {
  try {
    console.log("Searching for pending edits with ownerId:", req.params.ownerId);
    
    const pendingEdits = await PendingEdits.find({ ownerId: req.params.ownerId })
      .sort({ submittedAt: -1 }); 
    
    console.log(`Found ${pendingEdits.length} pending edits`);

    // Populate with restaurant info
    const result = await Promise.all(pendingEdits.map(async edit => {
      const restaurant = await Restaurant.findById(edit.restaurantId);
      
      // Extract image changes for easier frontend handling
      const imageChanges = edit.changes.images_changes || null;
      const capacityChanges = edit.changes.capacity || null;
      const closedDaysChanges = edit.changes.closedDays || null;
      
      // Count deleted and added images for UI summary display
      let deletedImagesCount = 0;
      let addedImagesCount = 0;
      
      if (imageChanges) {
        deletedImagesCount = imageChanges.deleted ? imageChanges.deleted.length : 0;
        addedImagesCount = imageChanges.added ? imageChanges.added.length : 0;
      }
      
      return {
        ...edit._doc,
        restaurant: restaurant ? {
          name: restaurant.name,
          location: restaurant.location,
          category: restaurant.category,
          imageID: restaurant.imageID
        } : { name: 'Restaurant not found' },
        imageChangesSummary: imageChanges ? 
          `${addedImagesCount} added, ${deletedImagesCount} removed` : 
          'No image changes',
        hasCapacityChanges: !!capacityChanges,
        hasClosedDaysChanges: !!closedDaysChanges
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Error getting pending edits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all pending edits (for admin)
router.get('/admin', async (req, res) => {
  try {
    const pendingEdits = await PendingEdits.find({ status: 'pending approval' })
      .sort({ submittedAt: -1 }); // Newest first

    // Populate with restaurant and owner info
    const result = await Promise.all(pendingEdits.map(async edit => {
      const restaurant = await Restaurant.findById(edit.restaurantId);
      // Use ownerId instead of owner to match the field name used in the model
      const owner = await Owner.findById(edit.ownerId);
      
      return {
        ...edit._doc,
        restaurant: restaurant ? {
          name: restaurant.name,
          location: restaurant.location,
          category: restaurant.category
        } : { name: 'Restaurant not found' },
        ownerDetails: owner ? {
          firstname: owner.firstname,
          lastname: owner.lastname,
          email: owner.email
        } : { name: 'Owner not found' }
      };
    }));

    res.json(result);
  } catch (error) {
    console.error('Error getting admin pending edits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get details of a specific edit
router.get('/:id', async (req, res) => {
  try {
    const pendingEdit = await PendingEdits.findById(req.params.id);
    if (!pendingEdit) {
      return res.status(404).json({ error: 'Pending edit not found' });
    }

    // Get restaurant details
    const restaurant = await Restaurant.findById(pendingEdit.restaurantId);
    
    res.json({
      pendingEdit,
      restaurant: restaurant ? {
        name: restaurant.name,
        location: restaurant.location,
        category: restaurant.category,
        // Include other fields as needed
        ...restaurant._doc
      } : null
    });
  } catch (error) {
    console.error('Error getting pending edit details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add capacity and closed days changes to an existing pending edit
router.post('/:id/update-related', async (req, res) => {
  try {
    const { capacityChanges, closedDaysChanges } = req.body;
    const pendingEditId = req.params.id;
    
    console.log(`Updating pending edit ${pendingEditId} with related changes:`, req.body);
    
    const pendingEdit = await PendingEdits.findById(pendingEditId);
    if (!pendingEdit) {
      return res.status(404).json({ error: 'Pending edit not found' });
    }
    
    // Update with capacity changes if provided
    if (capacityChanges) {
      pendingEdit.changes.capacity = capacityChanges;
      console.log("Added capacity changes to pending edit");
    }
    
    // Update with closed days changes if provided
    if (closedDaysChanges) {
      pendingEdit.changes.closedDays = closedDaysChanges;
      console.log("Added closed days changes to pending edit");
    }
    
    await pendingEdit.save();
    console.log("Pending edit updated with related changes");
    
    res.json({ success: true, message: 'Related changes added to pending edit' });
  } catch (error) {
    console.error('Error updating pending edit with related changes:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;