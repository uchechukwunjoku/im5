'use strict';

//Personas service used to communicate Personas REST endpoints
angular.module('personas').factory('Personas', ['$resource',
	function($resource) {
		return $resource('api/personas/:personaId', { personaId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);