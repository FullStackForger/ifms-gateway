'use strict';
var
	config = require('./config.json'),
	seneca = require('seneca'),
	portal = require('./lib/portal'),
	updateRefresh = config.refresh * 60 * 1000,
	serviceSpec = { pin:'aspect:content', type: 'tcp' },
	updateOpts = { path: config.path, repos: config.repos, spec: serviceSpec}

seneca
	.use(portal.plugin, {path: config.path})
	.listen(serviceSpec)

portal
	.updateContent(updateOpts)
	.then(() => setInterval(() => portal.updateContent(updateOpts), updateRefresh))

