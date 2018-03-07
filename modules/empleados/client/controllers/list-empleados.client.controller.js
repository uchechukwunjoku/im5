(function () {
    'use strict';

    angular.module('empleados').controller('EmpleadosListController', EmpleadosListController);

    EmpleadosListController.$inject = ['$http', '$stateParams', 'user',  '$scope', '$mdDialog', '$rootScope', 'PagosService', 'ServiceNavigation'];

    function EmpleadosListController($http, $stateParams, user, $scope, $mdDialog, $rootScope, PagosService, ServiceNavigation) {

        $scope.empleados = [];
        $scope.concepto = "";
        $scope.centroDeCosto = $stateParams.costcenterId;

        $http.put('/api/empleados',
            {
                enterprise: user.enterprise._id,
                centrodecosto: $scope.centroDeCosto
            })
            .success(function(response) {
                $scope.empleados = response;
                for(var i=0; i < $scope.empleados.length; i++) {
                    $scope.countActividades(i);
                    $scope.summLiquidaciones(i);
                    $scope.summPagos(i);
                }

            }).error(function(err) {
                console.log("Error: " + err);
            });

        $scope.getName = function(name) {            
          ServiceNavigation.addNav({name:name});
        }

        var getMonth = JSON.parse(localStorage.getItem("month"));
        var getYear = JSON.parse(localStorage.getItem("year"));
        $rootScope.getPeriod = getMonth.monthName + ", " + getYear.yearName;      

      
        $scope.countActividades = function(index) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            if (date && (date.month || date.year)) {
                $http.put('/api/actividades', {
                    empleadoId: $scope.empleados[index]._id,
                    month: date.month || null,
                    year: date.year || null
                }).success(function (response) {
                    var hourDiff;
                    var minuteDiff;
                    if(!$scope.empleados[index].hasOwnProperty("faltas")) {
                        $scope.empleados[index]["faltas"] = 0;
                    }

                    if(!$scope.empleados[index].hasOwnProperty("llegasTardes")) {
                        $scope.empleados[index]["llegasTardes"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {

                        hourDiff = Number(response[i].created.split("T")[1].split(":")[0]) - Number($scope.empleados[index].puesto.horarioE.split(":")[0]) - 3;
                        minuteDiff = Number(response[i].created.split("T")[1].split(":")[1]) - Number($scope.empleados[index].puesto.horarioE.split(":")[1]);

                        if(response[i].operacion == "Falta") {
                            $scope.empleados[index].faltas += 1;
                        } else if(response[i].operacion == "Hola" && (hourDiff < -2 || hourDiff > 0 || (hourDiff == 0 && minuteDiff > 15))) {
                            $scope.empleados[index].llegasTardes += 1;
                        }
                    }
                });
            } else {
                $http.put('/api/actividades', {
                    empleadoId: $scope.empleados[index]._id
                }).success(function (response) {
                    var hourDiff;
                    var minuteDiff;
                    if(!$scope.empleados[index].hasOwnProperty("faltas")) {
                        $scope.empleados[index]["faltas"] = 0;
                    }

                    if(!$scope.empleados[index].hasOwnProperty("llegasTardes")) {
                        $scope.empleados[index]["llegasTardes"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {
                        hourDiff = Number(response[i].created.split("T")[1].split(":")[0]) - Number($scope.empleados[index].puesto.horarioE.split(":")[0]) - 3;
                        minuteDiff = Number(response[i].created.split("T")[1].split(":")[1]) - Number($scope.empleados[index].puesto.horarioE.split(":")[1]);

                        if(response[i].operacion == "Falta") {
                            $scope.empleados[index].faltas += 1;
                        } else if(response[i].operacion == "Hola" && (hourDiff < -2 || hourDiff > 0 || (hourDiff == 0 && minuteDiff > 15))) {
                            $scope.empleados[index].llegasTardes += 1;
                        }
                    }
                });
            }
        };

        $scope.summLiquidaciones = function(index) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));

            if (date && (date.month || date.year)) {
                $http.put('/api/liquidaciones', {
                    empleadoId: $scope.empleados[index]._id,
                    month: date.month || null,
                    year: date.year || null
                }).success(function (response) {
                    if(!$scope.empleados[index].hasOwnProperty("liquidacion")) {
                        $scope.empleados[index]["liquidacion"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {
                        $scope.empleados[index].liquidacion += response[i].total;
                    }
                });
            } else {
                $http.put('/api/liquidaciones', {
                    empleadoId: $scope.empleados[index]._id
                }).success(function (response) {
                    if(!$scope.empleados[index].hasOwnProperty("liquidacion")) {
                        $scope.empleados[index]["liquidacion"] = 0;
                    }

                    for(var i = 0; i < response.length; i++) {
                        $scope.empleados[index].liquidacion += response[i].total;
                    }
                });
            }
        };

        $scope.summPagos = function (index) {
            var date = JSON.parse(localStorage.getItem("dateEmpleados"));
            if(!$scope.empleados[index].hasOwnProperty("pago")) {
                $scope.empleados[index]["pago"] = 0;
            }

            if (date && (date.month || date.year)) {
                PagosService.query({
                    empleadoId: $scope.empleados[index]._id,
                    month: date.month || null,
                    year: date.year || null
                }, function(response) {
                    for(var i = 0; i < response.length; i++) {
                        $scope.empleados[index].pago += (response[i].montoE + response[i].montoC);
                    }
                });
            } else {
                PagosService.query({
                    empleadoId: $scope.empleados[index]._id
                }, function(response) {
                    for(var i = 0; i < response.length; i++) {
                        $scope.empleados[index].pago += (response[i].montoE + response[i].montoC);
                    }
                });
            }
        };

        if(!$rootScope.$$listenerCount.callAddPago) {
            $rootScope.$on("callAddPago", function (event, data) {
                $scope.showDialogPago(data.event, data.item);
            });
        }

        $scope.showDialogPago = function ($event, item) {
            $mdDialog.cancel();
            $mdDialog.show({
                targetEvent: $event,
                templateUrl: 'modules/pagos/views/create-pago.client.view.html',
                locals: {
                    item: item,
                    user: user
                },
                controller: DialogController
            })
        }; //end showDialog

        function DialogController($scope, $mdDialog, $state, item, user, PagosService, $filter, Socket, Cajas) {
            $scope.apagarBoton = false; //desahbilita boton de crear para evitar que se presione dos veces
            $scope.$watch('ServiciosService', function () {
                $scope.findPago();
            });
            $scope.$watch('Cajas', function () {
                $scope.findCajas();
            });

            $scope.item = item;
            $scope.item.name = item.userLogin.displayName;
            $scope.item.personal = true;

            $scope.montoE = 0;
            $scope.montoC = 0;

            $scope.errorCaja = undefined;

            $scope.assignConcepto = function (concepto) {
                $scope.concepto = concepto;
            };

            $scope.findCajas = function () {
                Cajas.query({e: user.enterprise._id}, function (data) {
                    $scope.cajas = $filter('filter')(data, function (item) {
                        return (item._id !== $scope.item._id);
                    })
                });
            };

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.findPago = function () {
                $scope.pagos = PagosService.query({e: user.enterprise._id});
            };

            $scope.createPago = function ($event, item) {
                console.log($scope.concepto);
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if (($scope.caja !== undefined) && ($scope.caja !== null)) {

                        $scope.apagarBoton = true; //desahbilita boton de crear para evitar que se presione dos veces

                        var numero = $scope.pagos.length + 1;

                        var pago = {
                            numero: numero,
                            personal: item._id,
                            cajaD: $scope.caja._id,
                            montoE: $scope.montoE,
                            montoC: $scope.montoC,
                            pagoDate: $scope.pagoDate,
                            concepto: $scope.concepto,
                            saldo: $scope.caja.total - ($scope.montoE + $scope.montoC),
                            observaciones: $scope.observaciones,
                            enterprise: user.enterprise._id,
                            user: item.userLogin._id,
                            type: 'personal'
                        };

                        Socket.emit('pago.create', pago);
                        $state.go('home.viewPago', {empleadoId: item._id, displayName: item.userLogin.displayName}, {reload: true});
                        $mdDialog.hide();
                    }
                    else {
                        $scope.errorCaja = 'Se debe seleccionar la caja origin'
                    }
                }
            };
        }
    }
})();