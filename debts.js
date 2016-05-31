angular.module('debts', ['people'])
.component('debts', {
	template: '<h1>Debts</h1><ng-outlet></ng-outlet>',
	$routeConfig: [
		{path: '/', name: 'DebtList', component: 'debtList', useAsDefault: true},
		{path: '/edit/:id', name: 'EditDebt', component: 'editDebt'},
		{path: '/new', name: 'NewDebt', component: 'editDebt'},
	]
})
.component('debtList', {
	templateUrl: 'debt-list.html',
	controller: DebtListComponent
})
.component('editDebt', {
	templateUrl: 'edit-debt.html',
	bindings: { $router: '<' },
	controller: EditDebtComponent
})

.service('debtService', DebtService);

function DebtListComponent(debtService) {
	var $ctrl = this;
	debtService.getDebts().then(function(debts) {
		$ctrl.debts = debts;
	});
}

function EditDebtComponent($q, debtService, peopleService) {
	var $ctrl = this;
	$ctrl.$routerOnActivate = function(next) {
		$q.all([debtService.getDebtById(+next.params.id), peopleService.getPeople()]).then(function(items) {
			var debt = items[0], people = items[1];
			$ctrl.people = people;
			if(debt) {
				$ctrl.debt = debt;
				$ctrl.amount = debt.amount;
				$ctrl.note = debt.note;
				$ctrl.ownerId = debt.owner.id;
			} else {
				$ctrl.amount = 0;
				$ctrl.note = null;
				$ctrl.ownerId = people[0].id;
			}
		});
	};

	$ctrl.save = function() {
		var owner = $ctrl.people.filter(function(person) {
			return person.id === $ctrl.ownerId;
		})[0];
		if($ctrl.debt) { //Editing debt
			$ctrl.debt.amount = $ctrl.amount;
			$ctrl.debt.note = $ctrl.note;
			$ctrl.debt.owner = owner;
		} else { //New debt
			var debt = {
				amount: $ctrl.amount,
				note: $ctrl.note,
				owner: $ctrl.owner
			};
			debtService.addDebt(debt);
		}
		this.$router.navigate(['DebtList']);
	};
}

function DebtService($q, peopleService) {
	var debtsPromise = $q.when([
		{ id: 1, owner: 1, amount: 10, note: 'Vodka' },
		{ id: 2, owner: 1, amount: 50, note: 'Calzone på riviera' },
		{ id: 3, owner: 2, amount: 120, note: null },
	]);

	var debtsWithOwnersPromise = $q.all([debtsPromise, peopleService.getPeople()]).then(function(items) {
		var debts = items[0], people = items[1];
		var peopleMap = {};
		people.forEach(function(person) {
			peopleMap[person.id] = person;
		});
		debts.forEach(function(debt) {
			debt.owner = peopleMap[debt.owner];
		});
		return debts;
	});

	var debtService = this;

	this.getDebts = function() {
		return debtsWithOwnersPromise;
	};

	this.getDebtById = function(id) {
		return this.getDebts().then(function(debts) {
			return debts.filter(function(debt) {
				return debt.id === id;
			})[0];
		});
	};

	this.addDebt = function(debt) {
		debtService.getDebts.then(function(debts) {
			debts.push(debt);
		});
	};
}
