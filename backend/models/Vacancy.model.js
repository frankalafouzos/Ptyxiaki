const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VacancySchema = new Schema({
    name: String,
    tables: Number,
    id: String
})



module.exports = mongoose.model('Vacancy', VacancySchema);