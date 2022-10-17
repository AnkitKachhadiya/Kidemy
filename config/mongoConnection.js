const { MongoClient } = require("mongodb");
const settings = require("./settings");
const mongoConfig = settings.mongoConfig;

let _connection = undefined;
let _db = undefined;

const connectDb = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(mongoConfig.serverUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        _db = await _connection.db(mongoConfig.database);
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
