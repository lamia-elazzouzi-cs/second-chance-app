const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, directoryPath); // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - Get the db connection
        const db = await connectToDatabase();
        //Step 2: task 2 - retrieve the collection
        const collection = db.collection("secondChanceItems");
        //Step 2: task 3 - fetch the items
        const secondChanceItems = await collection.find({}).toArray();
        //Step 2: task 4 - return the items
        res.json(secondChanceItems);

    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/',
    upload.single('file'), //Step 3: Task 6 - Upload the image to the images directory
    async (req, res, next) => {
        try {

            //Step 3: task 1 - retrieve the db connection
            const db = await connectToDatabase();
            //Step 3: task 2 - retrieve the collection
            const collection = db.collection("secondChanceItems");
            //Step 3: task 3 - create a new item
            let secondChanceItem = req.body;
            //Step 3: task 4 - create a new ID for the new item
            const lastItemQuery = await collection.find().sort({ 'id': -1 }).limit(1);
            await lastItemQuery.forEach(item => {
                secondChanceItem.id = (parseInt(item.id) + 1).toString();
            });
            //Step 3: task 5 - create a new date for the new item
            const date_added = Math.floor(new Date().getTime() / 1000);
            secondChanceItem.date_added = date_added
            console.log("\n\n---> new item:\n", secondChanceItem);
            //Step 3: task 6 - add new item to db collection
            secondChanceItem = await collection.insertOne(secondChanceItem);
            console.log("\n\n---> new item:\n", secondChanceItem);
            res.status(201).json(secondChanceItem);

        } catch (e) {
            next(e);
        }
    });

// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        //Step 4: task 1 - retrieve db connection
        const db = await connectToDatabase();
        //Step 4: task 2 - retrieve db collection
        const collection = db.collection("secondChanceItems");
        //Step 4: task 3 - find item with the specified ID
        const id = req.params.id;
        const item = await collection.findOne({ 'id': id });
        //Step 4: task 4 - return the item
        if (!item) {
            return res.status(404).send("The requested item was not found.");
        }
        res.json(item);
    } catch (e) {
        next(e);
    }
});
/*
// Update and existing item
router.put('/:id', async (req, res, next) => {
    try {
        //Step 5: task 1 - insert code here
        //Step 5: task 2 - insert code here
        //Step 5: task 3 - insert code here
        //Step 5: task 4 - insert code here
        //Step 5: task 5 - insert code here
    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
    try {
        //Step 6: task 1 - insert code here
        //Step 6: task 2 - insert code here
        //Step 6: task 3 - insert code here
        //Step 6: task 4 - insert code here
    } catch (e) {
        next(e);
    }
});
*/
module.exports = router;
