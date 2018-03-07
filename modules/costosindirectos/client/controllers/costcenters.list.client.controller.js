'use strict';

// costosindirectos controller
angular.module('costosindirectos')
.controller('CostocentersListController', ['$rootScope','$location', 'user', '$scope', 'centrodecosto', 'PagosService','ServiceNavigation','FacturaService',
	function($rootScope, $location, user, $scope, centrodecosto, PagosService, ServiceNavigation,FacturaService) {

		// asignacion de modelos
		this.user = user;	
		this.searchCostosIndirectos = searchCostosIndirectos;
		$scope.year = new Date().getFullYear();
		$scope.month = new Date().getMonth();
		
		
		//$scope.centrodecosto = centrodecosto.data;		
		this.searchCostosIndirectos();

		
		ServiceNavigation.navInit();

		
		$scope.getName = function(name) {
			ServiceNavigation.addNav({name:name});
			$rootScope.$broadcast("nav change",true);
		}


		$scope.$watch("year",function(newVal,oldval){			
			localStorage.setItem("year",JSON.stringify({yearName : newVal}))
			//$rootScope.period.year = newVal;
		})

		$scope.$watch("month",function(newVal,oldval){
			var elemPos = $scope.monthList.map(function(x){return x.id}).indexOf(newVal);
			localStorage.setItem("month",JSON.stringify({monthName : $scope.monthList[elemPos].name}))
			//$rootScope.period.month = newVal;
		})

		// definicion de funciones
		$scope.monthList = 
[
    { id: 0, name: 'enero' },
    { id: 1, name: 'febrero' },
    { id: 2, name: 'marzo' },
    {id:  3, name: 'abril'},
    {id:  4, name:  'mayo'},
    {id: 5, name:   'junio'},
    {id: 6, name: 'julio'},
    {id:7, name:'agosto'},
    {id:8, name:'septiembre'},
    {id:9, name: 'octubre'},
    {id:10, name:'noviembre'},
    {id:11, name:'diciembre'}
  ];

 // {1:"enero",2:"febrero",3:"marzo",4:"abril",5:"mayo",6:"junio",7:"julio",8:"agosto",9:"septiembre",10:"octubre",11:"noviembre",12:"diciembre"};
		$scope.yearList = ["2016","2017"];
		function searchCostosIndirectos(){
			if($scope.year != "" ||  $scope.month != ""){
				var data = PagosService.query({year:$scope.year, month:$scope.month, e:user.enterprise._id});
				localStorage.setItem("search_postos", JSON.stringify({year:$scope.year, month:$scope.month}));
				$scope.centrodecosto = data;				
			}
		};
}]);



