const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantCapacitySchema = new Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    tablesForTwo: {
        type: Number,
        default: 0,
        min: 0 
    },
    tablesForFour: {
        type: Number,
        default: 0,
        min: 0 
    },
    tablesForSix: {
        type: Number,
        default: 0,
        min: 0 
    },
    tablesForEight: {
        type: Number,
        default: 0,
        min: 0 
    }
}, { timestamps: true });

restaurantCapacitySchema.methods.totalCapacity = function() {
    return (this.tablesForTwo * 2) + (this.tablesForFour * 4) +
           (this.tablesForSix * 6) + (this.tablesForEight * 8);
};


module.exports = mongoose.model('RestaurantCapacity', restaurantCapacitySchema);
