const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../model/tourModel');

const dotenv = require('dotenv');
dotenv.config({ path: './../../config.env' });

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
  const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));

  // function to import data to database...
  const importUtil = async () => {
    // put to database...
    try {
        await Tour.create(tours);
        console.log("IMPORT COMPLETED SUCCESSFULLY");
    } catch (err) {
        console.log(err);
    }
    process.exit();
  };

  const deleteUtil = async () => {
    try {
        await Tour.deleteMany();
        console.log("DELETED");

    } catch (err) {
        console.log(err);
    }

    process.exit();
  };


  console.log("hello from utility");

  if (process.argv[2] === '--import') importUtil();
  else if (process.argv[2] === '--delete') deleteUtil();