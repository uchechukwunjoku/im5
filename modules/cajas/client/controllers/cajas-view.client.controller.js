'use strict';

// Comprobantes controller
angular.module('cajas').controller('CajasViewController', ['$stateParams', 'user', 'Authentication', 'caja', 'transferencias', 'arqueos', '$mdDialog', 'ventasPendientes', 'comprasFinalizadas', 'movimientos', 'ventasPendientesEntrega', 'ventasFinalizadas', 'condicionventas', 'CajasExtra', '$scope', 'pagosService','ventasAnuladas', function ($stateParams, user, authentication, caja, transferencias, arqueos, $mdDialog, ventasPendientes, comprasFinalizadas, movimientos, ventasPendientesEntrega, ventasFinalizadas, condicionventas, CajasExtra, $scope, pagosService, ventasAnuladas) {

    // asignacion de modelos
    var global = this;
    this.user = user;
    this.caja = caja;
    this.transferencias = transferencias;
    this.arqueos = arqueos;
    this.ventasFinalizada = [];
    this.movimientos = [];
    this.movimientosList = [];
    this.waiting = false;
    this.idCuenta;
    this.ventasFinalizadaLength = 0;

    // asignacion de funciones

    this.findMovimientos = findMovimientos;
    this.showAlert = showAlert;

    this.findMovimientos(arqueos, transferencias, ventasPendientes, comprasFinalizadas);
   
    //global.loadmoreCondi = 0;
    
    this.loadmoreCaja = function () {
        global.loadingCaja = true;
        global.movimientosList = global.movimientos;
              
        var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;
        CajasExtra.loadMore(enterprise, 'Finalizada',global.ventasFinalizadaLength, 40).then(
            angular.bind(this, function (data) {
                
                data = data.data;                       
                global.ventasFinalizadaLength += data.length;

                if (data.length == 0) global.doneCaja = true;
                global.ventasFinalizada = global.ventasFinalizada.concat(data);
                for (var i = 0; i < data.length; i++) {
                    if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                        console.log("data pushed");
                        global.movimientos.push(data[i]);
                    }
                }
                global.loadingCaja = false;
                global.movimientosList = global.movimientos;                
            })
        ).catch(
            function(err) { 
                if (err.status == 400) global.doneCaja = true;                
            }
        );
    }

    global.ventasFinalizada = [];
    this.loadmoreCaja1 = function () {
        global.loadingCaja = true;
        global.movimientosList = global.movimientos;
        setTimeout(function () {

            // ventasFinalizadas.$promise.then(angular.bind(this, function(data) {
            //   console.log("data");
            //     for (var i = 0; i < data.length; i++) {
            //         if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
            //           console.log("data pushed");
            //             global.movimientos.push(data[i]);
            //         }
            //     }
            // }));
            console.log(authentication)
            console.log("áuth");
            var p = global.ventasFinalizada.length ? global.ventasFinalizada.length : 0;
            var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;
            CajasExtra.loadMore(enterprise, 'Finalizada', p, 30).then(
                angular.bind(this, function (data) {
                    data = data.data;
                    global.ventasFinalizada = global.ventasFinalizada.concat(data);
                    console.log(data.length);
                    for (var i = 0; i < data.length; i++) {
                        if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                            console.log("data pushed1");
                            global.movimientos.push(data[i]);
                        }

                    }
                    global.loadingCaja = false;
                    global.movimientosList = global.movimientos;
                })
            )

            // if(global.movimientosList.length === 0) {
            //     global.count = 40;
            //     global.movimientosList = global.movimientos.slice(0, 40);
            //     // global.doneCaja = true;
            // }
            //
            // if(global.movimientos.slice(global.count, global.count + 20).length >= 20) {
            //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count, global.count + 20));
            //     global.loadingCaja = false;
            //     global.count += 20;
            // } else {
            //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count));
            //     global.loadingCaja = false;
            //     global.count += 20;
            // }
        }, 1000);
    };

    // definicion de funciones

    function findMovimientos(arqueos, transferencias) {
        console.log("Movimientos: ");
        console.log(movimientos);
        console.log("Pagos Service: ");
        console.log(pagosService);
        console.log("Transferencias: ");
        console.log(transferencias);
        this.waiting = true;
        condicionventas.$promise.then(angular.bind(this, function (res) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].name == 'Cuenta Corriente') {
                    global.idCuenta = res[i]._id;
                }
            }
        }));
        arqueos.$promise.then(angular.bind(this, function (res) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].caja == caja._id) {
                    this.movimientos.push(res[i]);
                }
            }
        }));
        transferencias.$promise.then(angular.bind(this, function (data) {
            for (var i = 0; i < data.length; i++) {
                if ((data[i].cajaO._id == caja._id) || (data[i].cajaD._id == caja._id)) {
                    this.movimientos.push(data[i]);
                }
            }
        }));
        movimientos.$promise.then(angular.bind(this, function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].caja == caja._id) {
                    if (((data[i].estado == 'haber') && (data[i].provider != undefined)) || ((data[i].estado == 'debe') && (data[i].client != undefined))) {
                        this.movimientos.push(data[i]);
                    }
                }
            }
        }));
        ventasPendientes.$promise.then(angular.bind(this, function (data) {
            for (var i = 0; i < data.length; i++) {
                if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                    this.movimientos.push(data[i]);
                }
            }
        }));
        ventasPendientesEntrega.$promise.then(angular.bind(this, function (data) {
            for (var i = 0; i < data.length; i++) {
                if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                    this.movimientos.push(data[i]);
                }
            }
        }));

        comprasFinalizadas.$promise.then(angular.bind(this, function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].caja == caja._id) {
                    this.movimientos.push(data[i]);
                }
            }
        }));
        pagosService.$promise.then(angular.bind(this, function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].cajaD._id == caja._id) {
                    this.movimientos.push(data[i]);
                }
            }
        }));
        ventasAnuladas.$promise.then(angular.bind(this,function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].caja == caja._id) {
                    this.movimientos.push(data[i]);
                }
            }
        }));
        this.waiting = false;

        /*function loaditmore() {
            global.loadingCaja = true;
            global.movimientosList = global.movimientos;
            setTimeout(function () {

                // ventasFinalizadas.$promise.then(angular.bind(this, function(data) {
                //   console.log("data");
                //     for (var i = 0; i < data.length; i++) {
                //         if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                //           console.log("data pushed");
                //             global.movimientos.push(data[i]);
                //         }
                //     }
                // }));
                var p = global.ventasFinalizada.length ? global.ventasFinalizada.length : 0;
                var enterprise = this.user ? this.user.enterprise.enterprise : authentication.user.enterprise.enterprise;
                CajasExtra.loadMore(enterprise, 'Finalizada', p, 20).then(
                    angular.bind(this, function (data) {
                        data = data.data;
                        global.ventasFinalizada = global.ventasFinalizada.concat(data);
                        for (var i = 0; i < data.length; i++) {
                            if ((data[i].caja == caja._id) && (data[i].condicionVenta != global.idCuenta)) {
                                console.log("data pushed");
                                global.movimientos.push(data[i]);
                            }
                        }
                        global.loadingCaja = false;
                        global.movimientosList = global.movimientos;
                        if (global.loadmoreCondi == 0) {
                            console.log("loaditmore2");
                            loaditmore();
                        }
                    })
                )

                // if(global.movimientosList.length === 0) {
                //     global.count = 40;
                //     global.movimientosList = global.movimientos.slice(0, 40);
                //     // global.doneCaja = true;
                // }
                //
                // if(global.movimientos.slice(global.count, global.count + 20).length >= 20) {
                //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count, global.count + 20));
                //     global.loadingCaja = false;
                //     global.count += 20;
                // } else {
                //     global.movimientosList = global.movimientosList.concat(global.movimientos.slice(global.count));
                //     global.loadingCaja = false;
                //     global.count += 20;
                // }
            }, 1000);
        };

        loaditmore();*/

        /*$scope.$on('$destroy', function () {
            global.loadmoreCondi = 1;
        });*/
    }

    function showAlert(ev, obs) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(obs)
                .ariaLabel('Alert Dialog Demo')
                .targetEvent(ev)
                .ok('Cerrar')
        );
    }

}
]);
