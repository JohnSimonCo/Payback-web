angular.module('app', ['ngComponentRouter', 'debts', 'people'])
.value('$routerRootComponent', 'payBack')
.component('payBack', {
	templateUrl: 'pay-back.html',
	$routeConfig: [
		{path: '/debts/...', name: 'Debts', component: 'debts', useAsDefault: true},
		{path: '/people/...', name: 'People', component: 'people'},
	]
})

.service('currency', ['appData', function(appData) {
	var currencyPreferences = null;
	appData.then(function(data) {
		currencyPreferences = data.preferences.currency.value;
	});
	return {
		render: function(debt) {
			var string = Math.abs(debt.amount);
			if(currencyPreferences) {
				string += ' ' + currencyPreferences.displayName;
			}
			return string;
		}
	};
}])

.filter('currency', ['currency', function(currency) {
	return currency.render;
}])

.service('appData', ['$http', '$window', function($http, $window) {
	return $http.get('data.json').then(function(response) {
		var url = response.data.url;
		if(url) {
			$window.location = url;
		} else {
			console.log(response.data)
			return response.data;
		}
	});
}]);
