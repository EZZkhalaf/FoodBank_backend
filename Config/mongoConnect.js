const mongo = require('mongoose');

const connectDb = async()=>{
    await mongo.connect(process.env.CONNECT_DATABASE)
        .then(()=>{
            console.log('connected to the database .... ')
        })
}

module.exports = connectDb;