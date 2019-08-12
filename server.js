const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  // this will run when the program encounters an unhandled rejection...
  console.log("UNCAUGHT EXCEPTION", err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// debug
//console.log(process.env);
const DB = process.env.DATABASE_LOCAL.replace(
  '<DATABASE_NAME>',
  process.env.DATABASE_NAME
);

// connect to the databse (we can also connect to the atlas database after we create one... but for now, lets use local
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

// port
const port = 1337;
// listen
app.listen(process.env.PORT, () => {
  console.log('express app is listening...');
});

// we need to somehow handle unhandledexceptions...
// so we use emitters...
process.on('unhandledRejection', err => {
  // this will run when the program encounters an unhandled rejection...
  console.log(err.name, err.message);
  // server.close will allow all pending or in progress results to finish before shutting down...
  server.close(() => {
    process.exit(1);
  });
});