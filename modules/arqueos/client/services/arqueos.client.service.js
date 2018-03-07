'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('arqueos').factory('Arqueos', ['$resource',
	function($resource) {
		return $resource('api/arqueos/:arqueoId', { arqueoId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
