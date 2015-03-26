//Angular Stuff
var app = angular.module('monkeySee', ['ngMaterial', 'ngClipboard']);

app.config(['ngClipProvider', function(ngClipProvider) {
  ngClipProvider.setPath("https://cdnjs.cloudflare.com/ajax/libs/zeroclipboard/2.2.0/ZeroClipboard.swf");
}]);

app.controller('inputCtrl', ['$scope', function($scope){
  $scope.current = '';
  $scope.params = {query: [], className: '', size: 0};
  $scope.json = JSON.stringify(net.toJSON(), null, 2);
  $scope.train = function(){
    makeBatch(this.params.query, this.params.className, true, this.params.size, this);
    $scope.json = JSON.stringify(net.toJSON(), null, 2);
  }
 
}]);