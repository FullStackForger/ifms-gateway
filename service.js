'use strict';
var
	//helpers = require('./lib/helpers.js'),
	config = require('./config.json'),
	repomine = require('repomine');

//setInterval(initCheck, 1000);


repomine
	.update(config)
	.then((output) => {
		console.log(output)
	})
	.catch((err) => { console.log(err.stack) })