'use strict';
var
	config = require('./config.json'),
	seneca = require('seneca'),
	gateway = require('./lib'),
	frequency = config.refresh * 60 * 1000,
	serviceSpec = { pin:'aspect:content', type: 'tcp' },
	warpOpts = { path: config.path, repos: config.repos, spec: serviceSpec}

seneca
	.use(gateway.plugin, { path: config.path })
	.listen(serviceSpec)

gateway
	.warp(warpOpts)
	.then(() => setInterval(() => gateway.warp(warpOpts), frequency))