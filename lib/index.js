"use strict";
var
	fs = require('fs'),
	path = require('path'),
	seneca = require('seneca')(),
	repomine = require('repomine');

/**
 * Pulls and/or updates repositories calling repomine.update()
 * @param options
 * @param {string} options.path
 * @param {array} options.pages
 * @param {*} options.spec
 */
exports.warp = function (options) {
	return new Promise((resolve, reject) => {
		repomine
			.update(options)
			.then((data) => {
				seneca
					.client(options.spec)
					.act('aspect:content, info:update');
				resolve(data)
			}).catch((err) => {
				seneca.act('aspect:content, info:error', { error: err })
				reject(err)
			})
	})
}

/**
 *
 * @param options
 * @param {string} options.path
 */
exports.plugin = function (options) {

	// init pattern
	this.add( 'init:portal', init )

	// core patterns
	this.add( 'aspect:content,cmd:find', findContent)

	// additional patterns (prevent errors)
	this.add( 'aspect:content,info:update', (data, next) => { next() });
	this.add( 'aspect:content,info:error', (data, next) => { next() });

	function init(msg, next) {
		// todo: handle logging
		next()
	}

	function findContent(msg, next) {
		let filePath = path.resolve(process.cwd(), options.path, msg.uri)

		fs.stat(filePath, (err, stats) => {
			if (err == null && (stats.isDirectory() || stats.isFile())) {
				return next(null, {
					uri: msg.uri,
					path: filePath,
					type: stats.isDirectory() ? 'directory' : 'file'
				})
			}
		})
	}

	// return name of the plugin
	return "portal"
}