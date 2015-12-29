'use strict';
var
	//helpers = require('./lib/helpers.js'),
	config = require('./config.json'),
	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	nodegit = require('nodegit')


//setInterval(initCheck, 1000);

verifyPath(config)
	.then(updateRepositories)
	.catch((err) => { console.log(err.stack) })

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
 * Know issues:
 * nodegit is based on open-source libgit2 library (https://github.com/libgit2/libgit2)
 * which seems to have problem with working on os-x
 * todo: consider different library if there is one available
 *
 * @param settings
 * @returns {Promise}
 */
function updateRepositories(settings) {
	// github will fail cert check on some OSX machines - this overrides that check

	// clone with https: https://github.com/nodegit/nodegit/blob/master/test/tests/clone.js#L40-L51
	// clone with ssh: https://github.com/nodegit/nodegit/blob/master/test/tests/clone.js#L78-L92
	let cloneOpts = {
		fetchOpts: {
			callbacks: {
				certificateCheck: function() {
					return 1
				},
				credentials: function(url, userName) {
					return nodegit.Cred.sshKeyFromAgent(userName)
				}
			}
		}
	}

	// source: https://github.com/nodegit/nodegit/blob/master/examples/pull.js
	let fetchOpts = {
		credentials: (url, userName) => { return nodegit.Cred.sshKeyFromAgent(userName) },
		certificateCheck: function() { return 1 }
	}

	return new Promise((resolve, reject) => {
		if (settings.pages == undefined || !settings.pages instanceof Array) {
			reject('Bad configuration, pages property couldn\'t be found');
		}

		async.parallel(settings.pages.map((page) => {

			return (callback) => {
				let
					repoPath = path.resolve(__dirname, settings.path, page.slug),
					mapped = false,
					repository

				function onReject(err) {
					page.ready = false
					page.error = err
					mapped = true
					callback(null, page)
				}

				function onResolve() {
					page.ready = true
					page.error = null
					mapped = true
					callback(null, page)
				}

				if (page.ignore) onReject(new Error("Repository was ignored"))
				if (mapped) return

				// check if directory exist
				fs.stat(repoPath, (error, stats) => {

					// clone repo if directory doesn't exist
					if (error) {
						return nodegit
							.Clone(page.git, repoPath, null)
							.then(onResolve)
							.catch(onReject)
					}

					if (mapped) return

					// check if repo dir is writable
					fs.access(repoPath, fs.F_OK | fs.R_OK | fs.W_OK, (error) => {
						if (error) {
							return onReject(error)
						}
					})

					if (mapped) return

					// try to fast forward (fetch and merge)
					// nodegit, doesn't have pull implementation
					nodegit.Repository
						.open(repoPath)
						.then((repo) => {
							repository = repo;
							return repository.fetchAll(fetchOpts);
						})
						.then(() => {
							return repository.mergeBranches("master", "origin/master");
						})
						.then(onResolve)
						.catch(onReject)

				})
			}
		}), (error, results) => {
			console.log(settings.pages)
			settings.pages.forEach((page) => {
				if (page.error) {
					//todo: log error
					//console.log(page.slug + " repository (" + page.repo + ") error:" + err.message);
				}
			})
			resolve(settings)
		})
	})
}



