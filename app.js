angular.module('app', ['ngComponentRouter', 'debts', 'people'])
.value('$routerRootComponent', 'payBack')
.component('payBack', {
	templateUrl: 'pay-back.html',
	$routeConfig: [
		{path: '/debts/...', name: 'Debts', component: 'debts', useAsDefault: true},
		{path: '/people/...', name: 'People', component: 'people'},
	]
});
