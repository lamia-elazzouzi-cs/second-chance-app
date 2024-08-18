const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');


router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        // Task 2: Access MongoDB `users` collection
        // Task 3: Check if user credentials already exists in the database and throw an error if they do
        // Task 4: Create a hash to encrypt the password so that it is not readable in the database
        // Task 5: Insert the user into the database
        // Task 6: Create JWT authentication if passwords match with user._id as payload
        // Task 7: Log the successful registration using the logger
        // Task 8: Return the user email and the token as a JSON
    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

module.exports = router;