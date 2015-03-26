//Angular Stuff
angular.module('monkeySee', ['ngMaterial'])
  .controller('inputCtrl', function($scope){
    $scope.descriptors = ['plastic cup', 'cardboard box', 'wood plank', 'daisy flower'];
    $scope.train = function() {
    trainDescriptors();
  }
});