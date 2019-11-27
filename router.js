var express = require('express');
const util = require('util');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var router = express.Router();

// MongoDB Logic
const DB_NAME = process.env.DB_NAME || 'vehicle';
const DB_VEHICLE_COLLECTION_NAME = process.env.DB_VEHICLE_COLLECTION_NAME || 'vehicles';

const MONGO_USER = process.env.MONGO_USER || 'distric-msvc';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '9p68lDlOS0bidxBm';
const MONGO_URL = process.env.MONGO_URL || 'distric-ie289.mongodb.net/test?retryWrites=true&w=majority';
const uri = util.format('mongodb+srv://%s:%s@%s', MONGO_USER, MONGO_PASSWORD, MONGO_URL);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var collection = null;

client.connect(err => {
    if (err) throw err;
    console.log('info:\tConnected to MongoDB');

    setCollection(client.db(DB_NAME).collection(DB_VEHICLE_COLLECTION_NAME));

    // Index creation
    client.db(DB_NAME).collection(DB_VEHICLE_COLLECTION_NAME).createIndex({ location: "2dsphere" });
    client.db(DB_NAME).collection(DB_VEHICLE_COLLECTION_NAME).createIndex({ "$**": "text" })
});

function setCollection(results) {
    collection = results;
}




// Default Route
router.get('/', (req, res, next) => {
    const { version, name, description } = require('./package.json');

    res.json({
        application: 'distric',
        api: name,
        version: version,
        description: description
    });
});

// Get all vehicles
router.get('/list', (req, res, next) => {
    const limit = parseInt(req.query.limit) || 100;
    const start = parseInt(req.query.start) || 0;

    collection.find()
        .skip(start)
        .limit(limit)
        .toArray()
        .then(items => {
            res.json(items);
        })
        .catch(err => {
            res.json(err);
            res.sendStatus(400);
        });
});

// Get vehicle count
router.get('/count', (req, res, next) => {
    collection.find()
        .count()
        .then(items => {
            res.json(items);
        })
        .catch(err => {
            res.json(err);
            res.sendStatus(400);
        });
});

// Get vehicle by text query
router.post('/find', (req, res, next) => {
    $language = req.body.language || 'english';

    collection.find({ $text: { $search: req.body.search, $language } })
        .toArray()
        .then(items => {
            res.json(items);
        })
        .catch(err => {
            res.json(err);
            res.sendStatus(400);
        });
});

// Get vehicle by id
router.get('/:id', (req, res, next) => {
    const query = { "_id": ObjectId(req.params.id) };

    collection.findOne(query)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            res.json(err);
            res.sendStatus(400);
        });
});

// Add new Vehicle
router.post('/', (req, res, next) => {
    collection.insertOne(req.body, (err, result) => {
        if (err) {
            res.json(err);
            res.sendStatus(400);
            return;
        }

        res.json(result.ops);
    });
});

// Get Vehicles in geometry
router.post('/within/area', (req, res, next) => {
    $geometry = req.body;

    collection.find({
        location: {
            $geoWithin:
                { $geometry }
        }
    })
        .toArray()
        .then(items => {
            res.json(items);
        })
        .catch(err => {
            res.json(err);
            res.sendStatus(400);
        });
});

// Get Vehicles in box area
router.post('/within/box', (req, res, next) => {
    collection.find({
        location: {
            $geoWithin: {
                $box: [[req.body.bottom_left[0], req.body.bottom_left[1]],
                [req.body.top_right[0], req.body.top_right[1]]]
            }
        }
    })
        .toArray()
        .then(items => {
            res.json(items);
        })
        .catch(err => {
            res.json(err);
            res.sendStatus(400);
        });
});

// Update a vehicle
router.put('/:id', (req, res, next) => {
    const query = { "_id": ObjectId(req.params.id) };
    $set = req.body
    collection.updateOne(query, { $set })
        .then(result => {
            res.json({matched: result.matchedCount, modified: result.modifiedCount});
        })
        .catch(err => {
            res.json(err);
            res.sendStatus(400);
        });
});


module.exports = router;
