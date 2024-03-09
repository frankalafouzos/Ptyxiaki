
router.route("/checkAvailability/:id").get(async (req, res) => {
    const restaurantId = req.params.id;
    const { date, partySize } = req.query; // Assuming partySize and date are passed as query parameters
  
    if (!date || !partySize) {
      return res.status(400).json("Missing date or partySize query parameters");
    }
  
    try {
      const capacity = await RestaurantCapacity.findOne({ restaurant: restaurantId });
      if (!capacity) {
        return res.status(404).json("Restaurant capacity information not found.");
      }
  
      const bookingsOnDate = await Booking.find({
        restaurantid: restaurantId,
        date: new Date(date),
      });
  
      const availability = calculateAvailability(capacity, bookingsOnDate, parseInt(partySize));
  
      res.json(availability);
    } catch (err) {
      res.status(500).json("Error: " + err);
    }
  });
  
  function calculateAvailability(capacity, bookings, partySize) {
    // Initialize available tables based on restaurant capacity
    let tablesAvailable = {
      2: capacity.tablesForTwo,
      4: capacity.tablesForFour,
      6: capacity.tablesForSix,
      8: capacity.tablesForEight,
    };
  
    // Deduct tables already booked
    bookings.forEach(booking => {
      if (tablesAvailable[booking.tableCapacity] > 0) {
        tablesAvailable[booking.tableCapacity]--;
      }
    });
  
    // Check for direct availability or the need to combine tables
    const requiredTables = findRequiredTables(tablesAvailable, partySize);
    
    return {
      canAccommodate: requiredTables.canAccommodate,
      details: requiredTables.details
    };
  }
  
  function findRequiredTables(tablesAvailable, partySize) {
    let tempPartySize = partySize;
    let details = [];
    let canAccommodate = false;
  
    // Attempt to find direct table matches or combinations
    Object.keys(tablesAvailable).sort((a, b) => b - a).forEach(size => {
      while (tempPartySize > 0 && tablesAvailable[size] > 0) {
        tempPartySize -= size;
        tablesAvailable[size]--;
        details.push(`Used table for ${size}`);
        if (tempPartySize <= 0) {
          canAccommodate = true;
          break;
        }
      }
    });
  
    return {
      canAccommodate,
      details
    };
  }