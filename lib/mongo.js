const mongoose = require('mongoose')

async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URL)
  console.log('Mongo connected')
}

module.exports = connectMongo