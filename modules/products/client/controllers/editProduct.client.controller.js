'use strict';

// Comprobantes controller
angular.module('products').controller('ProductosEditController', ['$rootScope', '$scope', '$location', 'user', 'product', 'tipoProducto', 'productos', 'categories', 'enterprises', 'providers', '$state',
	function($rootScope, $scope, $location, user, product, tipoProducto, productos, categories, enterprises, providers, $state) {

		$rootScope.tipoProducto = tipoProducto;

		// asignacion de modelos
		this.user = user;
		this.product = product;
		this.tipoProducto = tipoProducto;
		this.productos = productos;
		this.categories = categories;
		this.enterprises = enterprises;
		this.providers = providers;

		$scope.modificar = false;
		$scope.verListado = false;
		$scope.errorRepetido = [];
		$scope.errorProducto = false;

		$scope.cambioProveedor = false;

		this.selectedMode = 'md-scale';
	    this.selectedDirection = 'left';

		// asignacion de funciones
		this.update = update;
		this.findTaxes = findTaxes;
		this.findMetrics = findMetrics;
		this.verTax = verTax;
		this.asignarTipos = asignarTipos;
		this.habilitarEdicion = habilitarEdicion;
		this.habilitoLista = habilitoLista;
		this.modificoProducto = modificoProducto;
		this.eliminar = eliminar;
		this.addMateriaPrima = addMateriaPrima;
		this.borrarError = borrarError;
		this.rutaVolver = rutaVolver;

		this.cambiarProveedor = cambiarProveedor;

		verTax();
		asignarTipos();

		// definicion de funciones

		function asignarTipos (){
			if (tipoProducto == 'p'){
				$rootScope.estadoActualParams.tipo = 'p';
			}
			else{
				if (tipoProducto == 'm'){
					$rootScope.estadoActualParams.tipo = 'm';
				}
				else{
					if(tipoProducto == 'i') {
							$rootScope.estadoActualParams.tipo = 'i';
					}
				}
			}
		};

		function rutaVolver (){
	  //   	if (product.esProducto){
	  //   		$rootScope.estadoActualParams.tipo = 'p';
	  //   	}
	  //   	else{
	  //   		if (product.esMateriaPrima){
	  //   			$rootScope.estadoActualParams.tipo = 'm';
	  //   		}
	  //   		else{
		 //    		if (product.esInsumo){
		 //    			$rootScope.estadoActualParams.tipo = 'i';
		 //    		}
		 //    	}
	  //   	}
			// $state.go('home.products', $rootScope.estadoActualParams);
			history.back()
		};

		//tax para mostrar en la vista
		function verTax () {
			if (product.tax == 1){
				$scope.vistaTax = 'Iva Incluido';
			}
			else{
				$scope.vistaTax = product.tax;
			}
		};

		function cambiarProveedor (){
			$scope.cambioProveedor = true;
		}

		// Update existing Product
		function update (product2, prov) {
			var product = product2;

			//para cuando esdita MP y le saca el reseller 
			if ((product.esMateriaPrima == true) && (product.reseller == false)){
				product.esProducto = false;
			}

			//si es una materia prima para revender
			if (this.reseller2 == true){
				if ((this.unitPrice2 !== undefined)&&(this.unitPrice2 !== null)){
					product.reseller = true;
					product.unitPrice = this.unitPrice2;
					product.esProducto = true;
				}
				else{
					$scope.errorProducto = 'Se debe indicar el precio de reventa del producto'
					return 0;
				}
			}

			//si tiene una produccion
			if ((product.esProducto == true)&&(product.reseller == false)&&(product.produccion.length > 0)){
				var costo = 0;
				for (var i in product.produccion){
					costo = costo + product.produccion[i].total;
				}
				product.costPerUnit = costo;
				for (var i=0; i<product.produccion.length; i++){
					product.produccion[i].producto = product.produccion[i].producto._id;
				}
			}

			if (product.esProducto){
				$rootScope.estadoActualParams.tipo = 'p';
			}
			else{
				if (product.esMateriaPrima){
					$rootScope.estadoActualParams.tipo = 'm';
				}
				else{
					if(product.esInsumo) {
						$rootScope.estadoActualParams.tipo = 'i';
					}
				}
			}

			product.enterprise = product.enterprise._id;

			if ($scope.cambioProveedor == true){
				product.provider = prov;
			}
			else{
				product.provider = product2.provider._id;
			}
			

			product.$update(function(data) {
				if (product.esProducto){
					$rootScope.estadoActualParams.tipo = 'p';
					// $state.go('home.products', $rootScope.estadoActualParams);
					history.back();
				}
				else{
					if (product.esMateriaPrima){
						$rootScope.estadoActualParams.tipo = 'm';
						// $state.go('home.products', $rootScope.estadoActualParams);
						history.back();
					}
					else{
						if(product.esInsumo) {
							$rootScope.estadoActualParams.tipo = 'i';
							// $state.go('home.products', $rootScope.estadoActualParams);
							history.back();
						}
					}
				}
				if (product.esMateriaPrima){ actualizarReferencias(); };
			}, function(errorResponse) {
				console.log(errorResponse, 'error');
			});
		};

		//actualiza los productos por si cambio el precio de las MP que lo componen
		function actualizarReferencias(){
			for (var i in productos){
				if ((productos[i].esProducto == true)&&(productos[i].reseller == false)&&(productos[i].deleted == false)){
					if (productos[i].produccion.length > 0){
						var product = productos[i];
						product.enterprise = product.enterprise._id;
						product.provider = product.provider._id;
						product.$update(function(data) {
							console.log('update referencia ok');
						}, function(errorResponse) {
							this.error = errorResponse.data.message;
						});
					};
				}
			}
		};

		//habilito la edicion de cant de materias primas elegidas
		function habilitarEdicion (){
			$scope.modificar = true;
		};

		//listado para agregar nuevas materias primas
		function habilitoLista (){
			$scope.verListado = true;
		};

		//ng-change al cambiar cantidad
		function modificoProducto (id, cant){
			var costo = findProducto(id);
			for (var i in product.produccion){
				if (product.produccion[i].producto._id == id){
					product.produccion[i].total = costo*cant;
				}
			}
		}; //end modificoProducto


		function findProducto(id){
			for (var i in productos){
				if (productos[i]._id == id ){
					return productos[i].costPerUnit;
				}
			};
		};

		//elimina materias primas
		function eliminar (id,cant){
			var costo = findProducto(id);
			for (var i in product.produccion){
				if (product.produccion[i].producto._id === id){
					product.produccion.splice(i, 1);
					product.costPerUnit = product.costPerUnit - (costo*cant);
				}
			}
		}; //end eliminar

		//agrega nueva materia prima para la produccion
		function addMateriaPrima (item,cant,$index){
			var p = { producto: undefined, nombre:undefined, cantidad: undefined, total: undefined };
			var ok = false;
			for (var i in product.produccion){
				if ((product.produccion[i].producto !== undefined)&&(product.produccion[i].producto !== null)){
					if (product.produccion[i].producto._id === item._id){
						ok = true;
						$scope.errorRepetido[$index] = 'Materia Prima existente';
					}
				}
			}
			if (ok === false ){
				p.producto = item;
				p.nombre = item.name;
				p.cantidad = cant;
				p.total = cant * item.costPerUnit;
				product.produccion.push(p);
				product.costPerUnit = product.costPerUnit + p.total;
			}
		} //end addMateria

		function findTaxes () {
			this.taxes = [
				{value: 1, name: 'Iva incluido en el precio'},
				{value: 10.5, name: '10.50%'},
				{value: 21, name: '21.00%'},
				{value: 27, name: '27.00%'}];
		};

		function findMetrics () {
			this.metrics = [ 'Bultos','Cajas','Cajones','Cm3','Grs', 'Horas', 'Kg','Latas','Litros','Ml','Mts2','U.'];
		};

		function borrarError (){
			$scope.errorProducto = undefined;
		};
	}
]);
