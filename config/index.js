'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
	env: process.env.NODE_ENV || 'development',
	server: {
		port: process.env.PORT || 8080,
	},
	logging: {
		level: process.env.LOG_LEVEL || 'debug',
	},
	database: {
		name: fs.readFileSync(path.join(__dirname, './mnt/database'), { encoding: 'utf8' }),
		user: fs.readFileSync(path.join(__dirname, './mnt/user'), { encoding: 'utf8' }),
		password: fs.readFileSync(path.join(__dirname, './mnt/password'), { encoding: 'utf8' }),
		host: fs.readFileSync(path.join(__dirname, './mnt/host'), { encoding: 'utf8' }),
		collections: {
			vehicles: 'vehicles'
		}
	}
};