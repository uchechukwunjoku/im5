'use strict';
angular.module('core').run(['$templateCache', function ($templateCache) {
      $templateCache.put('partials/menu-link.tmpl.html',
        '<md-button ui-sref-active="active" \n' +
        '  ui-sref="{{section.state}}" ng-click="focusSection()">\n' +
        '<ng-md-icon icon="{{section.icon}}" ng-if="section.icon"></ng-md-icon>\n' +
        '  {{section | humanizeDoc}}\n' +
        '  <span  class="md-visually-hidden "\n' +
        '    ng-if="isSelected()">\n' +
        '    current page\n' +
        '  </span>\n' +
        '</md-button>\n' +
        '');
    }]);

angular.module('core').directive('menuLink', [
	function() {
		return {
        scope: {
          section: '='
        },
        templateUrl: 'partials/menu-link.tmpl.html',
        link: function ($scope, $element) {
          var controller = $element.parent().controller();

          $scope.focusSection = function () {
            // set flag to be used later when
            // $locationChangeSuccess calls openPage()
            controller.autoFocusContent = true;
          };
        }
      };
	}
]);
