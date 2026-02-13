require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");

mongoose.connect(process.env.MONGO_URI);

async function seed() {
    await User.create({
        name: "Admin",
        email: "admin@gmail.com",
        password: "123456", // sẽ auto hash do pre-save
        role: "admin",
    });

    console.log("Admin created");
    process.exit();
}

seed();