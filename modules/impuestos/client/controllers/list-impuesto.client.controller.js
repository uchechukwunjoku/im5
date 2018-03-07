'use strict';

// puestosList controller
angular.module('impuestos').controller('ImpuestosListController', ['$scope', '$http', 'costcenters', 'Impuestos','ServiceNavigation',"$rootScope",
    function($scope, $http, costcenters, Impuestos, ServiceNavigation,$rootScope) {
        this.costcenters = costcenters;

        if(localStorage.getItem("dateImpuestos")) {
            var date = JSON.parse(localStorage.getItem("dateImpuestos"));
            $scope.year = Object.keys(date).length !== 0 ? date.year : (new Date()).getFullYear();
            $scope.month = Object.keys(date).length !== 0 ? date.month : (new Date()).getMonth();
        } else {
            $scope.year = (new Date()).getFullYear();
            $scope.month = (new Date()).getMonth();
        }

        //it initializes and gets the current name of inner page in view.
       //ServiceNavigation.navInit();

        
        $scope.getName = function(name) {
            ServiceNavigation.addNav({name:name});
            $rootScope.$broadcast("nav change",true);
        }

        $scope.$watch("year",function(newVal,oldval){           
            localStorage.setItem("year",JSON.stringify({yearName : newVal}))
           
        })

        $scope.$watch("month",function(newVal,oldval){
            var elemPos = $scope.monthList.map(function(x){return x.id}).indexOf(newVal);
            localStorage.setItem("month",JSON.stringify({monthName : $scope.monthList[elemPos].name}))
           
        })

        $scope.monthList = [
            {id: 0, name: 'enero'},
            {id: 1, name: 'febrero'},
            {id: 2, name: 'marzo'},
            {id: 3, name: 'abril'},
            {id: 4, name: 'mayo'},
            {id: 5, name: 'junio'},
            {id: 6, name: 'julio'},
            {id: 7, name: 'agosto'},
            {id: 8, name: 'septiembre'},
            {id: 9, name: 'octubre'},
            {id: 10, name: 'noviembre'},
            {id: 11, name: 'diciembre'}
        ];
        $scope.yearList = [];
        $scope.totalImpuestos = {};

        // It returns current year. And fill the yearList array with options from 2016 to the current year.
        var endYear = (new Date()).getFullYear();
        for (var startYear = 2016; startYear <= endYear; startYear++) {
            $scope.yearList.push(String(startYear));
        }

        $scope.findImpuestos = function () {
            $scope.totalImpuestos = {};
            $http.post('/api/impuestos/updateTotal', {
                month: $scope.month,
                year: $scope.year
            }).then(function () {
                localStorage.setItem("dateImpuestos", JSON.stringify({year:$scope.year, month:$scope.month}));
                costcenters.forEach(function(costcenter) {
                    Impuestos.query({centroDeCosto: costcenter._id}, function (impuestos) {
                        $scope.totalImpuestos[costcenter.name] = 0;
                        impuestos.forEach(function(impuesto) {
                            $scope.totalImpuestos[costcenter.name] += impuesto.total;
                        });
                        $scope.totalImpuestos[costcenter.name] = Math.round($scope.totalImpuestos[costcenter.name] * 100) / 100;
                    });
                })
            }).catch(function (error) {
                console.log("Error: " + error);
            });
        };

        $scope.findImpuestos();
    }
]);
