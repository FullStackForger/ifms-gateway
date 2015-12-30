'use strict';
var
	//helpers = require('./lib/helpers.js'),
	config = require('./config.json'),
	repomine = require('repomine'),
	seneca = require('seneca')();

//setInterval(initCheck, 1000);

repomine
	.update(config)
	.then((output) => {
		console.log(output)
	})
	.catch((err) => { console.log(err.stack) })


seneca.add({act: 'content', cmd: 'get'}, function (msg, next) {
	// /games/jewelines/index.html

	msg.uri = '';
	next();
})