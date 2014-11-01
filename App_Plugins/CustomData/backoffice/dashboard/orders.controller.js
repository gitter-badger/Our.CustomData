function ordersListViewController($rootScope, $scope, $routeParams, $injector, $timeout, notificationsService, iconHelper, dialogService, umbRequestHelper) {

    var customDataResource = $injector.get('customDataResource');

    $scope.actionInProgress = false;
    $scope.listViewResultSet = {
        totalPages: 0,
        items: []
    };

    $scope.options = {
        pageSize: 10,
        pageNumber: 1,
        filter: {},
        orderBy: 'SortOrder',
        orderDirection: "asc"
    };


    $scope.next = function () {
        if ($scope.options.pageNumber < $scope.listViewResultSet.totalPages) {
            $scope.options.pageNumber++;
            $scope.reloadView();
        }
    };

    $scope.goToPage = function (pageNumber) {
        $scope.options.pageNumber = pageNumber + 1;
        $scope.reloadView();
    };

    $scope.sort = function (field) {

        $scope.options.orderBy = field;


        if ($scope.options.orderDirection === "desc") {
            $scope.options.orderDirection = "asc";
        } else {
            $scope.options.orderDirection = "desc";
        }

        $scope.reloadView();
    };

    $scope.prev = function () {
        if ($scope.options.pageNumber > 1) {
            $scope.options.pageNumber--;
            $scope.reloadView();
        }
    };

    /*Loads the search results, based on parameters set in prev,next,sort and so on*/
    /*Pagination is done by an array of objects, due angularJS's funky way of monitoring state
    with simple values */

    $scope.reloadView = function () {
        // Reset data
        $scope.listViewResultSet = {
            totalPages: 0,
            items: []
        };
        $scope.pagination = [];

        customDataResource.getAll($scope.resourceType, $scope.options).then(function (data) {

            $scope.listViewResultSet.items = data;
            $scope.listViewResultSet.totalPages = 1;
            $scope.listViewResultSet.totalItems = data.length;

            //for (var i = $scope.listViewResultSet.totalPages - 1; i >= 0; i--) {
            //    $scope.pagination[i] = { index: i, name: i + 1 };
            //}

            //if ($scope.options.pageNumber > $scope.listViewResultSet.totalPages) {
            //    $scope.options.pageNumber = $scope.listViewResultSet.totalPages;
            //}

        });
    };

    //assign debounce method to the search to limit the queries
    $scope.search = _.debounce(function () {
        $scope.options.pageNumber = 1;
        $scope.reloadView();
    }, 100);

    $scope.selectAll = function ($event) {
        var checkbox = $event.target;
        if (!angular.isArray($scope.listViewResultSet.items)) {
            return;
        }
        for (var i = 0; i < $scope.listViewResultSet.items.length; i++) {
            var entity = $scope.listViewResultSet.items[i];
            entity.selected = checkbox.checked;
        }
    };

    $scope.isSelectedAll = function () {
        if (!angular.isArray($scope.listViewResultSet.items)) {
            return false;
        }
        return _.every($scope.listViewResultSet.items, function (item) {
            return item.selected;
        });
    };

    $scope.isAnythingSelected = function () {
        if (!angular.isArray($scope.listViewResultSet.items)) {
            return false;
        }
        return _.some($scope.listViewResultSet.items, function (item) {
            return item.selected;
        });
    };

    $scope.delete = function () {
        var selected = _.filter($scope.listViewResultSet.items, function (item) {
            return item.selected;
        });
        var total = selected.length;
        if (total === 0) {
            return;
        }

        if (confirm("Sure you want to delete?") == true) {
            $scope.actionInProgress = true;
            $scope.bulkStatus = "Starting with delete";
            var current = 1;

            for (var i = 0; i < selected.length; i++) {
                orderResource.deleteByKey(selected[i].key).then(function (data) {
                    $scope.bulkStatus = "Deleted order " + current + " out of " + total + " orders";
                    if (current === total) {
                        notificationsService.success("Bulk action", "Deleted " + total + " orders");
                        $scope.bulkStatus = "";
                        $timeout($scope.reloadView, 1000);
                        $scope.actionInProgress = false;
                    }
                    current++;
                });
            }
        }

    };

    $scope.edit = function (id) {
        dialogService.closeAll();
        dialogService.open({
            template: '/app_plugins/CustomData/backoffice/dialogs/' + $scope.resourceType + '/edit.html',
            id: id,
            closeOnSave: true,
            //tabFilter: ["Generic properties"],
            callback: function (data) {
                $scope.reloadView();
            }
        });
    };

    $scope.clearFilter = function () {
        dialogService.closeAll();
        $scope.options.filter = {};
        $scope.searchDisplay = null;
        $scope.reloadView();
    };

    $scope.filter = function () {
        dialogService.closeAll();
        dialogService.open({
            template: '/app_plugins/CustomData/backoffice/dialogs/' + $scope.resourceType + '/filter.html',
            closeOnSave: false,
            filter: $scope.options.filter,
            orderTypes: $scope.listViewAllowedTypes,
            callback: function (data) {
                $scope.options.filter = data;
                $scope.searchDisplay = data.display;
                $scope.reloadView();
            }
        });
    };

    $scope.resourceType = "order";
    $scope.pagination = new Array(10);
    //orderTypeResource.getTypes().then(function (data) {
    //    $scope.listViewAllowedTypes = data;
    //});
    $scope.reloadView();
}

angular.module("umbraco").controller("CustomData.Dashboard.OrdersListViewController", ordersListViewController);