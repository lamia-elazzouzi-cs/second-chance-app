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

router.post('/login', async (req, res) => {
    console.log("\n\n Inside login");
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();
        // Task 2: Access MongoDB `users` collection
        const collection = db.collection("users");
        // Task 3: Check for user credentials in database
        const { email, password } = req.body;
        const appUser = await collection.findOne({ email: email });
        
        // Task 4: Check if the password matches the encrypted password and send appropriate message on mismatch
        if (appUser) {
            let result = await bcrypt.compare(password, appUser.password);

            if (!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong pasword' });
            }

            // Task 5: Fetch user details from a database
            const firstName = appUser.firstName;
            const appUserEmail = appUser.email;

            // Task 6: Create JWT authentication if passwords match with user._id as payload
            let payload = { user: { id: appUser._id.toString() } };
            const authToken = jwt.sign(payload, JWT_SECRET);
            logger.info('User logged in successfully');

            return res.status(200).json({ authToken, firstName, appUserEmail });

        } else {

            // Task 7: Send appropriate message if the user is not found
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }


    } catch (e) {
        return res.status(500).send('Internal server error');

    }
});

// {Insert it along with other imports} Task 1: Use the `body`,`validationResult` from `express-validator` for input validation

router.put('/update', async (req, res) => {
    // Task 2: Validate the input using `validationResult` and return an appropriate message if you detect an error
try {
    // Task 3: Check if `email` is present in the header and throw an appropriate error message if it is not present
    // Task 4: Connect to MongoDB
    // Task 5: Find the user credentials in database

    existingUser.updatedAt = new Date();

    // Task 6: Update the user credentials in the database
    // Task 7: Create JWT authentication with `user._id` as a payload using the secret key from the .env file
    res.json({authtoken});
} catch (e) {
     return res.status(500).send('Internal server error');

}
});

module.exports = router;