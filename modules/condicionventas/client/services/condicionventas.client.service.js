'use strict';

//Condicionventas service used to communicate Condicionventas REST endpoints
angular.module('condicionventas').factory('Condicionventas', ['$resource',
	function($resource) {
		return $resource('api/condicionventas/:condicionventaId', { condicionventaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

//Condicionventas service used to communicate Condicionventas REST endpoints
// angular.module('condicionventas').factory('Condicionventas', ['$resource',
// 	function($resource) {
// 		return $resource('api/condicionventas', { e: '@enterprise'
// 		}, {
// 			update: {
// 				method: 'PUT'
// 			}
// 		});
// 	}
// ]);