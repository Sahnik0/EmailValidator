const mongoose = require('mongoose')

async function connectMongo() {
  try{
    await mongoose.connect(process.env.MONGO_URL)
    console.log('Mongo connected')
  }catch(err){
    console.log(err)
  }
}

module.exports = connectMongo