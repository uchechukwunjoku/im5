'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('cajas').factory('Cajas', ['$resource',
	function($resource) {
		return $resource('api/cajas/:cajaId', { cajaId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

angular.module('cajas').factory('CajasExtra', ['$http',
	function($http) {
		return {
			select: function(estado, enterprise) {
				return $http({
          method: "get",
          url: "/api/ventas/select",
          params: {
            e: enterprise,
            estado: estado
          }
        });
			},
			loadMore: function (enterprise, estado, last, limit) {
				return $http({
					method: "get",
					url: "/api/ventas/loadmore",
					params: {
						e: enterprise,
						p: last,
						pcount: limit,
						estado: estado
					}
				})
			}
		}
	}
]);
