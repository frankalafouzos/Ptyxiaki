// functions/isDayClosed.js
const DefaultClosedDay = require('../models/DefaultClosedDays.model');
const ClosedDate = require('../models/ClosedDates.model');

async function isDayClosed(restaurantId, date) {
  const requestedDate = new Date(date);
  // Get day name, e.g. "Monday"


  const forcedOpenDate = await ForcedOpenDate.findOne({
    restaurant: restaurantId,
    date: requestedDate
  });

  if (forcedOpenDate) {
    // This date is forced to be open, regardless of other settings
    return false;
  }

  const dayOfWeek = requestedDate.toLocaleString('en', { weekday: 'long' });
  // Check default-closed
  const defaultClosed = await DefaultClosedDay.findOne({
    restaurant: restaurantId,
    dayOfWeek,
    isClosed: true
  });
  if (defaultClosed) {
    return true;
  }

  // Check one-off closed
  const oneOffClosed = await ClosedDate.findOne({
    restaurant: restaurantId,
    date: requestedDate
  });
  if (oneOffClosed) {
    return true;
  }

  return false;
}

module.exports = isDayClosed;
