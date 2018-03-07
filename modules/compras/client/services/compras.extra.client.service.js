'use strict';

//Reportes service used to communicate Reportes REST endpoints
angular.module('compras').factory('ComprasExtra', ['$http',
    function($http) {
        return {
            select: function(estado, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/compras/select",
                    params: {
                        e: enterprise,
                        estado: estado
                    }
                });
            },
            loadMore: function (enterprise, estado, last, limit) {
                return $http({
                    method: "get",
                    url: "/api/compras/loadmore",
                    params: {
                        e: enterprise,
                        last: last,
                        limit: limit,
                        estado: estado
                    }
                })
            },
            search: function (enterprise, estado,search ) {
                return $http({
                    method: "get",
                    url: "/api/compras/search",
                    params: {
                        e: enterprise,
                        estado: estado,
                        search: search
                    }
                })
            },
            loadMoreImpuestos: function (impuesto, last, limit, year, month) {
                return $http({
                    method: "get",
                    url: "/api/compras/loadmoreImpuestos",
                    params: {
                        impuesto: impuesto,
                        last: last,
                        limit: limit,
                        year: year,
                        month: month
                    }
                })
            }
        }
    }
]);
