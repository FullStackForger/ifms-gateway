'use strict';
var
	//helpers = require('./lib/helpers.js'),
	config = require('./config.json'),
	fs = require('fs'),
	path = require('path')

//setInterval(initCheck, 1000);

checkPath(config)
	.then(checkRepositories)
	.catch((err) => { console.log(err.stack) })

function checkPath(settings) {
	let dirPath = path.resolve(__dirname, settings.path)
	return new Promise((resolve, reject) => {

		// check if file exist
		fs.stat(dirPath, (error, stats) => {

			// create directory if doesn't
			if (error) {
				return fs.mkdir(dirPath, 0x0766, (error) => {
					if (error) return reject (error)
					resolve(settings)
				})
			}

			// check if is a directory
			if (!stats.isDirectory()) {
				return reject(new Error('File: ' + dirPath + ' is not a directory'))
			}

			// check if is writable
			return fs.access(dirPath, fs.F_OK | fs.R_OK | fs.W_OK, (error) => {
				if (error) return reject(error)
				resolve(settings)
			})
		});
	})
}

function checkRepositories(settings) {
	return new Promise((resolve, reject) => {
		if (settings.pages == undefined || !settings.pages instanceof Array) {
			reject('Bad configuration, pages property couldn\'t be found');
		}
		resolve(settings)
	})
}