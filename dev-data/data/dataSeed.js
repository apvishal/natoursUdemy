const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../model/tourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/reviewModel');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

console.log(`${__dirname}`);
// connect to the database...
const DB = process.env.DATABASE_LOCAL.replace(
  '<DATABASE_NAME>',
  process.env.DATABASE_NAME
);

// connect to the databse (
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(connection => {
    //console.log(connection);
    console.log('DB CONNECTION SUCCESSFUL');
  });

// read the contents file...
console.log(`${__dirname}`);
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));
console.log(reviews);

// function to import data to database...
const importUtil = async () => {
  // put to database...
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('IMPORT COMPLETED SUCCESSFULLY');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteUtil = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('DELETED');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

console.log('hello from utility');

if (process.argv[2] === '--import') importUtil();
else if (process.argv[2] === '--delete') deleteUtil();
