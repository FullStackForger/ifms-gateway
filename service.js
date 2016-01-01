'use strict';
var
	config = require('./config.json'),
	seneca = require('seneca'),
	warpgate = require('./lib'),
	frequency = config.refresh * 60 * 1000,
	serviceSpec = { pin:'aspect:content', type: 'tcp' },
	warpOpts = { path: config.path, repos: config.repos, spec: serviceSpec}

seneca
	.use(warpgate.plugin, { path: config.path })
	.listen(serviceSpec)

warpgate
	.warp(warpOpts)
	.then(() => setInterval(() => gateway.warp(warpOpts), frequency))