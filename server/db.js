// db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let User;

function modelUser() {
    if (!User) {
        const userSchema = new mongoose.Schema({
            spotifyId: String,
            displayName: String,
            accessToken: String,
            refreshToken: String,
            expiresIn: Number,
        });

        User = mongoose.model("User", userSchema);
    }
    return User;
}

async function connectdb() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, 
        });
        console.log('conexion a mongo');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.reason);
        process.exit(1);
    }
}


module.exports = { connectdb, modelUser };
