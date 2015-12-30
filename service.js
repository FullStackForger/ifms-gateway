'use strict';
var
	config = require('./config.json'),
	repomine = require('repomine'),
	path = require('path'),
	fs = require('fs'),
	seneca = require('seneca')(),
	refreshRate = config.refresh * 60 * 1000,
	internal = {};

seneca.add('aspect:content,cmd:find', function findContent(msg, next) {
	let filePath = path.resolve(process.cwd(), config.path, msg.uri)

	fs.stat(filePath, (err, stats) => {
		if (err == null && (stats.isDirectory() || stats.isFile())) {
			return next(null, {
				uri: msg.uri,
				path: filePath,
				type: stats.isDirectory() ? 'directory' : 'file'
			})
		}
	})
}).listen({pin:'aspect:content,cmd:find'})

internal.updatePages = function (cb) {
	let updateTime = Date.now();
	repomine.update({
		path: config.path,
		repos: config.pages.map((page) => {
			return {
				dir: page.slug,
				git: page.git
			}
		})
	}).then((data) => {
		data.updateTime = Date.now() - updateTime
		if (cb instanceof Function) cb()

		// todo: store success logs
		//console.log(data)
	}, (err) => {
		// todo: store success err
		//console.log(err)
	})
}

internal.testAction = function () {
	seneca.act('aspect:content,cmd:find', {
		uri: 'games/jewelines/'
	}, function (err, data) {
		if (err) return console.log("error response:\n", err)
		console.log("data response:\n", data)
	})
}


internal.updatePages(() => {
	setInterval(internal.updatePages, refreshRate)
	internal.testAction()
})


