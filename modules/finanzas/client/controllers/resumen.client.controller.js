'use strict';

// Comprobantes controller
angular.module('finanzas').controller('ResumenController', ['$scope', '$stateParams', '$state', '$http', 'user', 'PagosService', 'Impuestos',
    function($scope, $stateParams, $state, $http, user, PagosService, Impuestos) {
        $scope.ventasTotal = 0;
        $scope.otrosIngresosTotal = 0;
        $scope.comprasTotal = 0;
        $scope.costosIndirectosTotal = 0;
        $scope.rrhhTotal = 0;
        $scope.impuestosTotal = 0;
        $scope.ventasTotales = 0;
        $scope.resultadoBruto = 0;
        $scope.resultadoNeto = 0;

        $scope.ventasRatio = 0;
        $scope.otrosIngresosRatio = 0;
        $scope.comprasRatio = 0;
        $scope.costosIndirectosRatio = 0;
        $scope.rrhhRatio = 0;
        $scope.impuestosRatio = 0;
        $scope.resultadoRatio = 0;

        var year = (new Date()).getFullYear();
        var month = (new Date()).getMonth();
        if(localStorage.getItem("dateResumen")) {
            var date = JSON.parse(localStorage.getItem("dateResumen"));
            year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        }

        $scope.$watch('authentication', function () {
            if (!sessionStorage.getItem('centroDeCosto')) {
                sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            } else if ($stateParams.centroDeCosto !== '' && $stateParams.centroDeCosto !== sessionStorage.getItem('centroDeCosto')) {
                sessionStorage.setItem('centroDeCosto', $stateParams.centroDeCosto);
            }

            $scope.centroDeCosto = sessionStorage.getItem('centroDeCosto');

            Promise.all([
                findVentas(),
                findCompras(),
                findCostosIndirectos().$promise,
                findRRHH(),
                findImpuestos()
            ]).then(function(result) {
                calculateResumen();
            }).catch(function (error) {
                console.log(error);
            });
        });

        function findVentas() {
            return $http.put('/api/ventas', {
                year: year,
                month: month,
                enterprise: user.enterprise._id,
                centroDeCosto: $scope.centroDeCosto
            }).success(function (ventas) {
                ventas.forEach(function(venta) {
                    if(venta.tipoComprobante && (venta.tipoComprobante.name === "Factura A" || venta.tipoComprobante.name === "Factura B" || venta.tipoComprobante.name === "Factura C"))
                        $scope.ventasTotal += venta.total;
                    else
                        $scope.otrosIngresosTotal += venta.total;
                });
            });
        }

        function findCompras() {
            return $http.put('/api/compras', {
                year: year,
                month: month,
                enterprise: user.enterprise._id,
                centroDeCosto: $scope.centroDeCosto
            }).success(function (compras) {
                compras.forEach(function(compra) {
                    $scope.comprasTotal += compra.total;
                });
            });
        }

        function findCostosIndirectos() {
            if(year != "" || month != ""){
                return PagosService.query({year: year, month: month, e: user.enterprise._id, centroId: $scope.centroDeCosto}, function(pagos) {
                    pagos.forEach(function(pago) {
                        $scope.costosIndirectosTotal += pago.total;
                    });
                });
            }
        }

        function findRRHH() {
            return $http.put('/api/empleados', {
                enterprise: user.enterprise._id,
                centrodecosto: $scope.centroDeCosto
            }).success(function (response) {
                var empleados = response;
                for (var i = 0; i < empleados.length; i++) {
                    $http.put('/api/liquidaciones', {
                        empleadoId: empleados[i]._id,
                        month: month,
                        year: year
                    }).success(function (response) {
                        for (var j = 0; j < response.length; j++) {
                            $scope.rrhhTotal += response[j].total;
                        }
                    });
                }
            }).error(function (err) {
                console.log("Error: " + err);
            });
        }

        function findImpuestos() {
            return $http.post('/api/impuestos/updateTotal', {
                month: month,
                year: year
            }).then(function () {
                Impuestos.query({centroDeCosto: $scope.centroDeCosto}, function (impuestos) {
                    impuestos.forEach(function(impuesto) {
                        if(impuesto.name === 'IVA Compras') {
                            $scope.impuestosTotal -= impuesto.total;
                        } else {
                            $scope.impuestosTotal += impuesto.total;
                        }
                    });
                });
            }).catch(function (error) {
                console.log("Error: " + error);
            });
        }

        function calculateResumen() {
            return new Promise(function() {
                $scope.ventasTotales = $scope.ventasTotal + $scope.otrosIngresosTotal;
                $scope.resultadoBruto = $scope.ventasTotales - $scope.comprasTotal - $scope.costosIndirectosTotal - $scope.rrhhTotal;
                $scope.resultadoNeto = $scope.resultadoBruto - $scope.impuestosTotal;

                if($scope.ventasTotales) {
                    $scope.ventasRatio = $scope.ventasTotales && Math.round(($scope.ventasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.otrosIngresosRatio = Math.round(($scope.otrosIngresosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.comprasRatio = Math.round(($scope.comprasTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.costosIndirectosRatio = Math.round(($scope.costosIndirectosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.rrhhRatio = Math.round(($scope.rrhhTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.impuestosRatio = Math.round(($scope.impuestosTotal / $scope.ventasTotales) * 10000) / 100;
                    $scope.resultadoRatio = Math.round(($scope.resultadoNeto / $scope.ventasTotales) * 10000) / 100;
                }

                $scope.$apply();
            });
        }
    }
]);