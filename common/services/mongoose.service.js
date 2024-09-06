const mongoose = require("mongoose");
let count = 0;

const options = {
    autoIndex: false, // Don't build indexes
    poolSize: 1000, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    // all other approaches are now deprecated by MongoDB:
    //useNewUrlParser: true,
    //useUnifiedTopology: true
};
const connectWithRetry = () => {
    console.log("Connecting to MongoDB server...");
    mongoose.set('strictQuery', true);
    mongoose
        .connect(
            "mongodb://dba:password@localhost:27017,192.168.1.100:27017/authtoken_db?authMechanism=DEFAULT&authSource=authtoken_db"
        )
        .then(() => {
            console.log("Successfully connected to MongoDB server.");
        })
        .catch((err) => {
            console.log("Connecting to MongoDB server failed! Retry after 3 seconds...", ++count);
            setTimeout(connectWithRetry, 3000);
        });
};

connectWithRetry();

exports.mongoose = mongoose;
