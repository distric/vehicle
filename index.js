const fs = require('fs');
const path = require('path');
var filesCollection = [];
const directoriesToSkip = ['node_modules'];

function readDirectorySynchronously(directory) {
    var currentDirectorypath = path.join(__dirname + directory);

    var currentDirectory = fs.readdirSync(currentDirectorypath, 'utf8');

    currentDirectory.forEach(file => {
        var fileShouldBeSkipped = directoriesToSkip.indexOf(file) > -1;
        var pathOfCurrentItem = path.join(__dirname + directory + '/' + file);
        if (!fileShouldBeSkipped && fs.statSync(pathOfCurrentItem).isFile()) {
            filesCollection.push(pathOfCurrentItem);
        }
        else if (!fileShouldBeSkipped) {
            var directorypath = path.join(directory + '\\' + file);
            readDirectorySynchronously(directorypath);
        }
    });
}

readDirectorySynchronously('');
console.log(filesCollection);



const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const util = require('util');

var app = express();

const uri = util.format('mongodb+srv://%s:%s@%s', config.database.user, config.database.password, config.database.host);
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
	if (err) throw err;

	console.log('info:\tConnected to MongoDB');

	// Generate logging format based on environment
	const LOG_FORMAT = config.env == 'development' ? winston.format.combine(
		winston.format.colorize(),
		winston.format.cli()
	) : winston.format.combine(
		winston.format.json()
	)

	// Middleware
	app.use(bodyParser.json());
	app.disable('x-powered-by');

	app.use(expressWinston.logger({
		transports: [
			new winston.transports.Console()
		],
		format: LOG_FORMAT
	}));


	// ======= ROUTERS HERE =======
	//
	// ============================
	var vehicles = require('./routes/vehicle');
	vehicles.init(client.db(config.database.name).collection(config.database.collections.vehicles));
	app.use(process.env.PREFIX || '/api/vehicle', vehicles.getRouter());


	// Error Logger Middleware
	app.use(expressWinston.errorLogger({
		transports: [
			new winston.transports.Console()
		],
		format: LOG_FORMAT
	}));


	// Listening for traffic
	app.listen(config.server.port, function () {
		console.log("distric vehicle API listening on port %d in %s mode", this.address().port, config.env);
	});
});
