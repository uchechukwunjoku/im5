'use strict';

// Create Impuesto controller
angular.module('impuestos').controller('ImpuestosDetailsController', ['$state', '$scope', '$http', '$stateParams', 'VentasExtra', 'ComprasExtra', 'ImpuestosTax',
    function($state, $scope, $http, $stateParams, VentasExtra, ComprasExtra, ImpuestosTax) {
        var year = (new Date()).getFullYear();
        var month = (new Date()).getMonth();

        if (localStorage.getItem("dateImpuestos")) {
            var date = JSON.parse(localStorage.getItem("dateImpuestos"));
            year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        }

        $scope.impuestosName = $stateParams.impuestosName;
        $scope.impuestosType = $stateParams.impuestosType;
        console.log($stateParams, $scope.impuestosType);
        $scope.start = true;
        $scope.impuestos = [];
        $scope.ajustars = [];

        $scope.loadmore = function() {
            console.log($scope.impuestosName, $scope.impuestosType);

            $scope.loading = true;
            $scope.start = false;
            var last = $scope.impuestos.length ? $scope.impuestos[$scope.impuestos.length - 1].created : null;
            var limit = $scope.impuestos.length < 40 ? 40 : 20;
            // if ($scope.impuestosName == 'IVA Ventas') {
            //     VentasExtra.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
            //         function(data) {

            //             $scope.impuestos = $scope.impuestos.concat(data.data);
            //             $scope.loading = false;
            //             $scope.start = false;
            //             if (data.data.length === 0)
            //                 $scope.done = true;
            //             else {
            //                 $http.get('/api/impuestos/ajustar', {
            //                     params: {
            //                         impuestoId: $stateParams.impuestosId,
            //                         year: year,
            //                         month: month,
            //                         last: data.data[data.data.length - 1].created
            //                     }
            //                 }).then(function(data) {
            //                     console.log("QQQQQ", data);

            //                     $scope.impuestos = $scope.impuestos.concat(data.data);
            //                 });
            //             }
            //         }
            //     )
            // } else if ($scope.impuestosName == 'IVA Compras') {
            //     ComprasExtra.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
            //         function(data) {
            //             console.log(data);
            //             $scope.impuestos = $scope.impuestos.concat(data.data);
            //             $scope.loading = false;
            //             $scope.start = false;
            //             if (data.data.length === 0)
            //                 $scope.done = true;
            //             else {
            //                 $http.get('/api/impuestos/ajustar', {
            //                     params: {
            //                         impuestoId: $stateParams.impuestosId,
            //                         year: year,
            //                         month: month,
            //                         last: data.data[data.data.length - 1].created
            //                     }
            //                 }).then(function(data) {
            //                     console.log(data.data)
            //                     $scope.impuestos = $scope.impuestos.concat(data.data);
            //                 });
            //             }
            //         }
            //     )
            // }
            if ($scope.impuestosName == 'IVA Ventas') {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function(data) {
                        console.log("HEEEREEE", data);

                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created
                                }
                            }).then(function(data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                            });
                        }
                    }
                )
            } else if ($scope.impuestosName == 'IVA Compras') {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function(data) {
                        console.log("HEEEREEE", data);

                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created
                                }
                            }).then(function(data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                            });
                        }
                    }
                )
            } else {
                ImpuestosTax.loadMoreImpuestos($stateParams.impuestosId, last, limit, year, month).then(
                    function(data) {
                        console.log("HEEEREEE", data);

                        $scope.impuestos = $scope.impuestos.concat(data.data);
                        $scope.loading = false;
                        $scope.start = false;
                        if (data.data.length === 0)
                            $scope.done = true;
                        else {
                            $http.get('/api/impuestos/ajustar', {
                                params: {
                                    impuestoId: $stateParams.impuestosId,
                                    year: year,
                                    month: month,
                                    last: data.data[data.data.length - 1].created
                                }
                            }).then(function(data) {
                                $scope.impuestos = $scope.impuestos.concat(data.data);
                            });
                        }
                    }
                )
            }
        };

    }
]);