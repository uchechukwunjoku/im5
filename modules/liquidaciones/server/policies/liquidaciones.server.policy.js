'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Liquidaciones Permissions
 */
exports.invokeRolesPolicies = function() {
	acl.allow([{
		roles: ['groso'],
		allows: [{
			resources: '/api/liquidaciones',
			permissions: '*'
		}, {
			resources: '/api/liquidaciones/:liquidacionId',
			permissions: '*'
		}]
	}, {
		roles: ['admin'],
		allows: [{
			resources: '/api/liquidaciones',
			permissions: '*'
		}, {
			resources: '/api/liquidaciones/:liquidacionId',
			permissions: '*'
		}]
	}, {
		roles: ['cliente'],
		allows: [{
			resources: '/api/liquidaciones',
			permissions: ['get', 'put']
		}, {
			resources: '/api/liquidaciones/:liquidacionId',
			permissions: ['get']
		}]
	}, {	
		roles: ['produccion'],
		allows: [{
			resources: '/api/liquidaciones',
			permissions: ['get', 'put']
		}, {
			resources: '/api/liquidaciones/:liquidacionId',
			permissions: ['get']
		}]
	}, {
		roles: ['user'],
		allows: [{
			resources: '/api/liquidaciones',
			permissions: ['get', 'put']
		}, {
			resources: '/api/liquidaciones/:liquidacionId',
			permissions: ['get']
		}]
	}, {
		roles: ['guest'],
		allows: [{
			resources: '/api/liquidaciones',
			permissions: ['get', 'put']
		}, {
			resources: '/api/liquidaciones/:liquidacionId',
			permissions: ['get']
		}]
	}]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
	var roles = (req.user) ? req.user.roles : ['guest'];

	// Check for user roles
	acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
		if (err) {
			// An authorization error occurred.
			return res.status(500).send('Unexpected authorization error');
		} else {
			if (isAllowed) {
				// Access granted! Invoke next middleware
				return next();
			} else {
				return res.status(403).json({
					message: 'User is not authorized'
				});
			}
		}
	});
};
