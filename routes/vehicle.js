const express = require('express');
const ObjectId = require('mongodb').ObjectId;

var router = express.Router();

function init(col) {
    const collection = col;

	// Index creation
	col.createIndex({ location: "2dsphere" });
	col.createIndex({ "$**": "text" })

    // Default Route
    router.get('/', (req, res, next) => {
        res.json({
            application: 'distric',
            api: 'vehicle'
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
                res.json({ matched: result.matchedCount, modified: result.modifiedCount });
            })
            .catch(err => {
                res.json(err);
                res.sendStatus(400);
            });
    });
}

function getRouter() {
    return router;
}

module.exports = {
    init: init,
    getRouter: getRouter
};