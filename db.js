const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const dbname = "unititledjs_mongodb";
const dbname = 'heroku_tgn4lpng';
require('dotenv').config()
const url = process.env.MONGODB_URI || "mongodb://localhost:27017"
const mongoOptions = {useNewUrlParser : true, useUnifiedTopology: true}

const state = {
    db: null,
    client: null
}
const connect = (cb) => {
    if (state.db) {
        cb();
    }
    else{
        MongoClient.connect(url, mongoOptions, (err, client)=>{
            if (err) {
                cb(err);
            }
            else {
                state.client = client
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

const getPrimaryKey = (_id)=>{
    return ObjectID(_id);
}

const getDB = () => {
    return state.db;
}

const getClient = () => {
    return state.client
}

module.exports = {getDB, connect, getPrimaryKey, getClient}