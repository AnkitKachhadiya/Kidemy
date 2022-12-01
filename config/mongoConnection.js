require("dotenv").config();
const { MongoClient } = require("mongodb");
const mongoDbConnectionLink =
    process.env.MONGODB_CONNECTION_LINK || "mongodb://localhost:27017/";
const database = process.env.MONGODB_DATABASE || "kidemy";

let _connection = undefined;
let _db = undefined;

const connectDb = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoDbConnectionLink, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        _db = await _connection.db(database);
    }

    return _db;
};

const disconnectDb = () => {
    _connection.close();
};

module.exports = {
    connectDb,
    disconnectDb,
};
