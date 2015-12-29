'use strict';
var
	//helpers = require('./lib/helpers.js'),
	config = require('./config.json'),
	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	simpleGit = require('simple-git')


//setInterval(initCheck, 1000);

verifyPath(config)
	.then(updateRepositories)
	.catch((err) => { console.log(err.stack) })

// todo:
// - convert to service, to allow manual repository update
// - allow to reload config.json without application reboot
// - set interval for repositories update
// - microservice: broadcast message when repositories update has completed with changes (watch page.update object)


/**
 * Verifies the path to directory storing repositories.
 * If directory doesn't exist it will create one.
 * @param settings
 * @returns {Promise}
 */
function verifyPath(settings) {
	let dirPath = path.resolve(__dirname, settings.path)
	return new Promise((resolve, reject) => {

		// check if file exist
		fs.stat(dirPath, (error, stats) => {

			// create directory if doesn't
			if (error) {
				return fs.mkdir(dirPath, parseInt('0755',8), (error) => {
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

/**
 * Method clones or fast forwards repositories.
 * This method always resolves, decorating settings page objects with properies:
 * - ready = {bool}
 * - error = {null} | {string}
 *
 * @param settings
 * @returns {Promise}
 */
function updateRepositories(settings) {
	return new Promise((resolve, reject) => {
		if (settings.pages == undefined || !settings.pages instanceof Array) {
			reject('Bad configuration, pages property couldn\'t be found');
		}

		async.parallel(settings.pages.map((page) => {

			return (callback) => {
				let
					repoPath = path.resolve(__dirname, settings.path, page.slug)

				function onReject(err) {
					page.ready = false
					page.error = err
					callback(null, page)
				}

				function onResolve() {
					page.ready = true
					page.error = null
					callback(null, page)
				}

				if (page.ignore) return onReject(new Error("Repository was ignored"))

				// check if directory exist
				fs.stat(repoPath, (error, stats) => {

					// clone repo if directory doesn't exist
					if (error) {
						return simpleGit()
							.clone(page.git, repoPath, (err) => {
								return err ? onReject(err) : onResolve()
							})
					}


					// check if repo dir is writable
					let mapped = false
					fs.access(repoPath, fs.F_OK | fs.R_OK | fs.W_OK, (error) => {
						if (error) {
							onReject(error)
							mapped = true
						}
					})
					if (mapped) return

					simpleGit(repoPath).pull((err, update) => {
						if (err) return onReject(err)
						page.update = update
						onResolve()
					})
				})
			}
		}), (error, results) => {
			console.log(settings.pages)
			resolve(settings)
		})
	})
}



