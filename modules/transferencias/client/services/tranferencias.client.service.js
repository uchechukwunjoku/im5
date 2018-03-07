'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('transferencias').factory('Transferencias', ['$resource',
	function($resource) {
		return $resource('api/transferencias/:transferenciaId', { transferenciaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
