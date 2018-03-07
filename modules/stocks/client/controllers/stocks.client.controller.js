'use strict';

// Stocks controller
angular.module('stocks').controller('StocksController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Stocks', 'Products', 'Enterprises', '$mdBottomSheet', '$mdDialog', 'StockFactory', '$filter', '$state', 'Providers',
    function ($scope, $rootScope, $stateParams, $location, Authentication, Stocks, Products, Enterprises, $mdBottomSheet, $mdDialog, StockFactory, $filter, $state, Providers) {
        $scope.authentication = Authentication;

        // watch for SEARCH to update value
        $scope.$watch('authentication', function () {
            $scope.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
            $scope.find();
            $scope.findProveedores();
        });

        $scope.tipoProducto = $stateParams.tipo;
        $rootScope.productosAPedir = [];

        $scope.filtroActivo = false;
        $scope.productsLength = 5;

        $scope.$watch('tipoProducto', function () {
            if ($scope.tipoProducto === 'p') {
                $scope.daFilter = {esProducto: true};
                $scope.title = 'Stock de  productos';
                $scope.esProducto = true;
                $scope.esMateriaPrima = false;
                $scope.esInsumo = false;
            } else if ($scope.tipoProducto === 'm') {
                $scope.daFilter = {esMateriaPrima: true, esInsumo: true};
                $scope.title = 'Stock de materia prima e insumos';
                $scope.esMateriaPrima = true;
                $scope.esProducto = false;
                $scope.esInsumo = false;
            } else if ($scope.tipoProducto === 'i') {
                $scope.daFilter = {esInsumo: true};
                $scope.title = 'Stock de insumos';
                $scope.esMateriaPrima = false;
                $scope.esProducto = false;
                $scope.esInsumo = true;
            } else {
                // do nothing... bad request
            }
        });

        $scope.filtrarProveedores = function (proveedor) {
            $scope.nombreProveedorFiltro = proveedor.name;
            $scope.idProveedorFiltro = proveedor._id;
            $rootScope.nuevoProveedor = proveedor;
            $scope.filtroActivo = true;
        };

        $scope.eliminarFiltro = function () {
            $scope.nombreProveedorFiltro = undefined;
            $scope.filtroActivo = false;
            $scope.setStatus('');
        };

        // Create new Stock
        $scope.create = function (action, reference) {
            console.log(action, 'action');
            if (action == undefined || action === null) {
                return console.log('No se especificó una acción al intentar modificar stock');
            }
            // Create new Stock object
            var stock = new Stocks({
                action: action,
                amount: this.stockToAdd,
                product: $scope.item,
                enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                reference: reference || undefined,
                observations: this.observations
            });

            // Redirect after save
            stock.$save(function (response) {
                //$location.path('stocks/' + response._id);

                // Clear form fields
                $scope.closeDialog();

                //$mdBottomSheet.hide();
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Stock
        $scope.remove = function (stock) {
            if (stock) {
                stock.$remove();

                for (var i in $scope.stocks) {
                    if ($scope.stocks [i] === stock) {
                        $scope.stocks.splice(i, 1);
                    }
                }
            } else {
                $scope.stock.$remove(function () {
                    $location.path('stocks');
                });
            }
        };

        // Update existing Stock
        $scope.update = function () {
            var stock = $scope.stock;

            stock.$update(function () {
                $location.path('stocks');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Products
        $scope.find = function () {
            if ($scope.SEARCH !== undefined) {
                // $rootScope.products = Products.query({ e: $scope.SEARCH.enterprise }, function(data){
                // 	$scope.greenItems = $filter('filter')($rootScope.products, {
                // 		esProducto: ($scope.daFilter.esProducto === true),
                // 		esMateriaPrima: ($scope.daFilter.esMateriaPrima === true),
                // 		esInsumo: ($scope.daFilter.esInsumo === true),
                // 		stockState: {
                // 			color: 'green'
                // 		}
                // 	});
                // 	$scope.yellowItems = $filter('filter')($rootScope.products, {
                // 		esProducto: ($scope.daFilter.esProducto === true),
                // 		esMateriaPrima: ($scope.daFilter.esMateriaPrima === true),
                // 		esInsumo: ($scope.daFilter.esInsumo === true),
                // 		stockState: {
                // 			color: 'yellow'
                // 		}
                // 	});
                // 	$scope.redItems = $filter('filter')($rootScope.products, {
                // 		esProducto: ($scope.daFilter.esProducto === true),
                // 		esMateriaPrima: ($scope.daFilter.esMateriaPrima === true),
                // 		esInsumo: ($scope.daFilter.esInsumo === true),
                // 		stockState: {
                // 			color: 'red'
                // 		}
                // 	});
                // });

                Products.query({e: $scope.SEARCH.enterprise,  p: 0, pcount: 5}, function (data) {
                    $scope.greenItems = $filter('filter')(data, function (item) {
                        switch ($scope.tipoProducto) {
                            //console.log('obteniendo data:', $scope.tipoProducto);
                            case 'p':
                                return (item.esProducto === true) && (item.stockState.color === 'green') && (item.deleted === false);
                                break;

                            case 'm':
                                return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'green') && (item.deleted === false);
                                break;
                            default:

                        }
                    });
                    $scope.yellowItems = $filter('filter')(data, function (item) {
                        switch ($scope.tipoProducto) {
                            //console.log('obteniendo data:', $scope.tipoProducto);
                            case 'p':
                                return (item.esProducto === true) && (item.stockState.color === 'yellow') && (item.deleted === false);
                                break;

                            case 'm':
                                return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'yellow') && (item.deleted === false);
                                break;
                            default:

                        }
                    });
                    $scope.redItems = $filter('filter')(data, function (item) {
                        switch ($scope.tipoProducto) {
                            //console.log('obteniendo data:', $scope.tipoProducto);
                            case 'p':
                                return (item.esProducto === true) && (item.stockState.color === 'red') && (item.deleted === false);
                                break;

                            case 'm':
                                return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'red') && (item.deleted === false);
                                break;
                            default:

                        }
                    });

                    $rootScope.products = $filter('filter')(data, function (item) {
                        switch ($scope.tipoProducto) {
                            //console.log('obteniendo data:', $scope.tipoProducto);
                            case 'p':
                                return item.esProducto === true;
                                break;

                            case 'm':
                                return item.esMateriaPrima === true || item.esInsumo === true;
                                break;
                            default:

                        }
                    });
                });

            }

        };

        $scope.loadmoreProducts = function () {
            console.log('load more products ... ' +  $scope.productsLength);
            $scope.loadingFinal = true;

            Products.query({e: $scope.SEARCH.enterprise,  p: $scope.productsLength, pcount: 5}, function (data) {
                
                if (data.length === 0 ) $scope.doneFinal = true;

                $scope.productsLength += data.length;
                console.log('load more data lenth : ' + data.length);

                var greenItems = $filter('filter')(data, function (item) {
                    switch ($scope.tipoProducto) {
                        //console.log('obteniendo data:', $scope.tipoProducto);
                        case 'p':
                            return (item.esProducto === true) && (item.stockState.color === 'green') && (item.deleted === false);
                            break;

                        case 'm':
                            return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'green') && (item.deleted === false);
                            break;
                        default:

                    }
                });                
                $scope.greenItems = $scope.greenItems.concat(greenItems);

                var yellowItems = $filter('filter')(data, function (item) {
                    switch ($scope.tipoProducto) {
                        //console.log('obteniendo data:', $scope.tipoProducto);
                        case 'p':
                            return (item.esProducto === true) && (item.stockState.color === 'yellow') && (item.deleted === false);
                            break;

                        case 'm':
                            return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'yellow') && (item.deleted === false);
                            break;
                        default:

                    }
                });
                $scope.yellowItems = $scope.yellowItems.concat(yellowItems);

                var redItems = $filter('filter')(data, function (item) {
                    switch ($scope.tipoProducto) {
                        //console.log('obteniendo data:', $scope.tipoProducto);
                        case 'p':
                            return (item.esProducto === true) && (item.stockState.color === 'red') && (item.deleted === false);
                            break;

                        case 'm':
                            return (item.esMateriaPrima === true || item.esInsumo === true) && (item.stockState.color === 'red') && (item.deleted === false);
                            break;
                        default:

                    }
                });
                $scope.redItems = $scope.redItems.concat(redItems);

                var products = $filter('filter')(data, function (item) {
                    switch ($scope.tipoProducto) {
                        //console.log('obteniendo data:', $scope.tipoProducto);
                        case 'p':
                            return item.esProducto === true;
                            break;

                        case 'm':
                            return item.esMateriaPrima === true || item.esInsumo === true;
                            break;
                        default:

                    }
                });

                $rootScope.products = $rootScope.products.concat(products);

                $scope.loadingFinal = false;
            });
           
        }

        $scope.$watch('greenItems', function () {
            if ($scope.greenItems !== undefined) {
                //console.log('green: ', $scope.greenItems.length)
            }

        });

        $scope.$watch('redItems', function () {
            if ($scope.redItems !== undefined) {
                //console.log('red: ', $scope.redItems.length)
            }

        });

        $scope.$watch('yellowItems', function () {
            if ($scope.yellowItems !== undefined) {
                //console.log('yellow: ', $scope.yellowItems.length)
            }

        });

        $scope.cambiar = function (producto) {
            // $location.path('pedidos/create?tipo=compra');
            $rootScope.nuevoProducto = producto;
            console.log($rootScope.nuevoProducto, 'nuevo producto');
            $state.go('home.createPedido', {"tipo": "compra"});
        };

        $scope.cambioCheckbox = function (item) {
            var product = angular.copy(item);
            if (item.checkbox == true) {
                var cant = 1;
                delete product["checkbox"];
                if (product.idealStock !== undefined) {
                    if (product.idealStock > product.unitsInStock) {
                        cant = product.idealStock - product.unitsInStock;
                    }
                }
                var tot = cant * product.costPerUnit;
                var p = {product: product, cantidad: cant, descuento: 0, total: tot, subtotal: tot, observaciones: ''};
                $rootScope.productosAPedir.push(p);
                $rootScope.providerStock = product.provider;
            } else {
                for (var i = $rootScope.productosAPedir.length - 1; i >= 0; i--) {
                    if ($rootScope.productosAPedir[i].product._id == item._id) {
                        $rootScope.productosAPedir.splice(i, 1);
                    }
                }
            }
            // console.log($rootScope.productosAPedir);
            // console.log($rootScope.providerStock);
        };

        $scope.verProd = function (item) {
            // console.log('id', item._id);
            $location.path('productos/view/' + item._id).search({back: 'home.stock', tipo: $stateParams.tipo});
        };

        $scope.setStatus = function (s) {
            if (s !== '') {
                //console.log('cambio a ', s);
                $scope.status = {stockState: {color: s}};
            } else {
                //console.log('filtro eliminado ');
                $scope.status = undefined;
            }

        };

        // Find existing Stock
        $scope.findOne = function () {
            $scope.stock = Stocks.get({
                stockId: $stateParams.stockId
            });
        };

        $scope.findProveedores = function () {
            if ($scope.SEARCH !== undefined) {
                $scope.proveedores = Providers.query({e: $scope.SEARCH.enterprise});
            }
        };

        $scope.showDialog = showDialog;


        function showDialog($event, item, action) {
            var parentEl = angular.element(document.body);
            var template = '';
            switch (action) {
                case 'agregar':
                    template = 'modules/stocks/views/add-stock.client.view.html';
                    break;

                case 'suprimir':
                    template = 'modules/stocks/views/remove-stock.client.view.html';
                    break;

                case 'pedido':
                    template = 'modules/pedidos/views/create-pedido.client.view.html';
                    break;

                case 'pedido recibido':
                    template = 'modules/stocks/views/received-stock.client.view.html';
                    break;

                default:
                    template = 'modules/stocks/views/add-stock.client.view.html'
            }

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: template,
                locals: {
                    item: item,
                    SEARCH: $scope.SEARCH,
                    action: action
                },
                controller: DialogController
            })
                .then(function (answer) {
                    //$scope.alert = 'You said the information was "' + answer + '".';
                    $scope.find();
                }, function () {
                    //$scope.alert = 'You cancelled the dialog.';
                });
        } //end showDialod


        function DialogController($scope, $mdDialog, item, SEARCH, action, Stocks, StockFactory) {

            $scope.botonApagado = false;

            $scope.item = item;
            $scope.SEARCH = SEARCH;
            $scope.errorStock = undefined;
            $scope.create = function (action, $event, reference) {
                // console.log(this.stockToAdd);
                if (($event.keyCode === 13) || ($event.keyCode === 0) || ($event.keyCode === undefined)) {
                    if ((this.stockToAdd != undefined) && (this.stockToAdd != null) && (this.stockToAdd != '')) {
                        if (action == undefined || action === null) {
                            return console.log('No se especificó una acción al intentar modificar stock');
                        }
                        $scope.botonApagado = true;
                        // Create new Stock object
                        var stock = new Stocks({
                            action: action,
                            amount: this.stockToAdd,
                            product: $scope.item._id,
                            enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                            reference: reference || undefined,
                            observations: this.observations
                        });

                        // console.log(stock, 'stock');
                        // Redirect after save
                        stock.$save(function (response) {
                            //$location.path('stocks/' + response._id);

                            // Clear form fields
                            $scope.closeDialog();

                            //$mdBottomSheet.hide();
                        }, function (errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });
                    }
                    else {
                        if (action == 'agregar') {
                            $scope.errorStock = 'Debe indicar el stock a agregar';
                        }
                        else {
                            $scope.errorStock = 'Debe indicar el stock a suprimir';
                        }
                    }
                }
            };

            $scope.registerOrder = function (order) {
                if (order == undefined || order === null) {
                    return console.log('No se especificó una acción al intentar modificar stock');
                }
                // Create new Stock object
                var stock = new Stocks({
                    action: 'pedido recibido',
                    amount: order.amount,
                    product: $scope.item,
                    enterprise: this.enterprise ? this.enterprise._id : $scope.SEARCH.enterprise,
                    received: true,
                    reference: order._id || undefined,
                    observations: 'Pedido con id ' + order._id + 'recibido!'
                });

                // Redirect after save
                stock.$save(function (response) {
                    //$location.path('stocks/' + response._id);

                    // Clear form fields
                    $scope.closeDialog();

                    //$mdBottomSheet.hide();
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            };

            // Find a list of Stock
            $scope.findStock = function (product) {
                if ($scope.SEARCH !== undefined) {
                    StockFactory.getStockOrdersForProduct(product, $scope.SEARCH.enterprise)
                        .success(function (data) {
                            // OK
                            $scope.stocks = data;
                        })
                        .error(function (error) {
                            // FUCK!
                            console.error('Fuck!!! -> ', error);
                        });
                    console.log('sock: ', $scope.stocks)
                }
            };

            $scope.action = action;

            $scope.closeDialog = function () {
                $mdDialog.hide();
            };

            $scope.add = function (value1, value2) {
                //console.log('add fired!' +  $scope.newValue);
                $scope.newValue = value1 + value2;
                $scope.errorStock = undefined;
            };

            $scope.sup = function (value1, value2) {
                //console.log('sup fired!');
                $scope.newValue = value1 - value2;
                $scope.errorStock = undefined;
            };
        }
    }
]);
