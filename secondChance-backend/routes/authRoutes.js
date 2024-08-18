require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const connectToDatabase = require('../models/db');
const JWT_SECRET = `${process.env.JWT_SECRET}` || "thisisasecretkey";

const pino = require('pino');  // Import Pino logger
const logger = pino();  // Create a Pino logger instance

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();
        // Task 2: Access MongoDB `users` collection
        const collection = db.collection("users");
        // Task 3: Check if user credentials already exists in the database and throw an error if they do
        const { email, password, firstName, lastName } = req.body;
        const existingEmail = await collection.findOne({ email: email });

        if (existingEmail) {
            logger.error('Register error: Email id already exists');
            res.status(400).json({ error: "Email already in use" });
        }
        // Task 4: Create a hash to encrypt the password so that it is not readable in the database
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        // Task 5: Insert the user into the database
        const newUser = await collection.insertOne({
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: hash,
            createdAt: new Date(),
        });
        // Task 6: Create JWT authentication if passwords match with user._id as payload
        const payload = { user: { id: newUser.insertedId } };
        const authToken = jwt.sign(payload, JWT_SECRET);
        // Task 7: Log the successful registration using the logger
        logger.info('User registered successfully');
        // Task 8: Return the user email and the token as a JSON
        res.json({ authToken, email });

    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;