'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('movimientos').factory('Movimientos', ['$resource',
	function($resource) {
		return $resource('api/movimientos/:movimientoId', { movimientoId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
