require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const Restaurants = require('./models/restaurant.model')
const Image = require('./models/images.model')
const cities = require('./listOfCities')
const { categories, descriptions, names } = require('./names')
const crypto = require('crypto');


const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true});
const connection = mongoose.connection;
connection.once('open', () => {
console.log("MongoDB database connection established successfully");
}) 

const seedDB = async() => {
        try{
        await Restaurants.deleteMany({});
        await Image.deleteMany({});

        for (let name of names) {
            let randomCity = Math.floor(Math.random() * 141)
            let id = crypto.randomUUID()
            let randomCategory = Math.floor(Math.random() * 9)
            let AveragePrice = Math.floor(Math.random() * 100) + 1

            let phoneNumber = Math.floor(Math.random() * 9999999);
            let emailString = name.split(" ").join("");
            emailString = emailString.toLowerCase()
            const restaurants = new Restaurants({
                name: `${name}`,
                price: `${AveragePrice}`,
                category: `${categories[randomCategory]}`,
                location: `${cities[randomCity]}`,
                imageID: id,
                phone: `210${phoneNumber}`,
                email: `${emailString}@gmail.com`,
                description: `${descriptions[randomCategory]}`
            })

            let numberofphotos = Math.floor(Math.random() * 6)
            for (let number = 0; number <= numberofphotos; number++) {
                let photo = Math.floor(Math.random() * 31) + 1

                const image = new Image({
                    ImageID: id,
                    link: `../imgs/photo${photo}.avif`
                })
                await image.save()
            }


            await restaurants.save()
        }
        console.log("Data added!!")
    } catch (error) {
        console.error("Error adding data:", error);
    }
}




seedDB();