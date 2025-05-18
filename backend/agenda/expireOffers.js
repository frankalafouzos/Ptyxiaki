const Agenda = require('agenda');
const Offer = require('../models/offers.model');

const agenda = new Agenda({
  db: { address: process.env.ATLAS_URI, collection: 'agendaJobs' }
});

// Define the job
agenda.define('expire offers', async (job) => {
  try {
    const result = await Offer.updateMany(
      { endDate: { $lt: new Date() }, isActive: true },
      { $set: { isActive: false } }
    );
    console.log(`[AGENDA] Offers expired: ${result.modifiedCount || result.nModified || 0}`);
  } catch (err) {
    console.error('[AGENDA] Error expiring offers:', err);
  }
});

// Start Agenda and schedule the job
(async function () {
  await agenda.start();
  // Run daily at midnight
  await agenda.every('0 0 * * *', 'expire offers', null, { timezone: 'Europe/Athens' }); // Change timezone if needed
})();

module.exports = agenda;