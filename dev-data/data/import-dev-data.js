const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");


require('dotenv').config({ path: './config.env' });



// Encode the password
const username = encodeURIComponent(process.env.DATABASE_USER);
const password = encodeURIComponent(process.env.DATABASE_PASSWORD);
const cluster = process.env.DATABASE_CLUSTER;
const dbName = process.env.DATABASE_NAME;


const DB = `mongodb://${username}:${password}@${cluster}/${dbName}?authSource=admin&replicaSet=atlas-11s9w4-shard-0&retryWrites=true&w=majority&appName=Cluster0&ssl=true`;

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('Connected to MongoDB...');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
  });

// Read JSON file
const tour =JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const user =JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const review =JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

//import data
const importData = async()=>{
    try {
      await Tour.create(tour);
      await Review.create(review);
      await User.create(user, { validateBeforeSave: false });

      console.log("Data Imported");
    } catch (error) {
        console.error("Error importing data", error);
    }
    process.exit();
}

//delete data
const deleteData = async()=>{ 
    try {
      await Tour.deleteMany();
      await Review.deleteMany();
      await User.deleteMany();
      console.log("Data Deleted");
    } catch (error) {
        console.error("Error deleting data", error);
    }
    process.exit();
};

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}
console.log(process.argv);