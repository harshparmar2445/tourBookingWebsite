const mongoose = require('mongoose');
// process.on("uncaughtException", err => {
//   console.log("Uncaught Exception. shutting dowm...");
//   console.error(err.name, err.message);
//   process.exit(1);
// })

require('dotenv').config({ path: './config.env' });
const app = require('./app');


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


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on("unhandledRejection", err => {
  console.error(err.name, err.message);
  console.log("Unhandled Rejection. 💥 shutting dowm...");
  server.close(() => {
    process.exit(1);
  });
});
