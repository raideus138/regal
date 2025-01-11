// db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config()

let User;

function modelUser() {
    console.log('se ejecuto')
    const userSchema = new mongoose.Schema({
        spotifyId: String,
        displayName: String,
        accessToken: String,
        refreshToken: String,
        expiresIn: Number,
    });

    User = mongoose.model("User", userSchema);

    return User;
}

function connectdb() {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
    });

    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
    db.once("open", () => {
        console.log("se conecto lw");
    });
}

module.exports = { connectdb, modelUser };
