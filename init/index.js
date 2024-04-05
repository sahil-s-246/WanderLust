const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mongoURL = "mongodb://127.0.0.1:27017/wanderlust"
async function main(){
    await mongoose.connect(mongoURL);
}
main().then(()=>{
    console.log("Connected to MDB");
})
.catch((err)=>{
    console.log(err);
})

const initDB = async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("data was saved");
}    
initDB();