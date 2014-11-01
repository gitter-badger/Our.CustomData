/**
    * @ngdoc service
    * @name umbraco.resources.orderExtResource
    * @description Member Management
    **/
function customDataResource($q, $http, umbDataFormatter, umbRequestHelper) {
    var customDataResource = {

        getById: function (resource, id) {
            return umbRequestHelper.resourcePromise(
               $http.get("Backoffice/api/CustomData/Get" + resource + "?id=" + id),
               'Failed to retrieve ' + resource);
        },
        getAll: function (resource, options) {

            var defaults = {
                pageSize: 0,
                pageNumber: 0,
                filter: '',
                orderDirection: "Ascending",
                orderBy: "SortOrder"
            };
            if (options === undefined) {
                options = {};
            }
            //overwrite the defaults if there are any specified
            angular.extend(defaults, options);
            //now copy back to the options we will use
            options = defaults;
            //change asc/desc
            if (options.orderDirection === "asc") {
                options.orderDirection = "Ascending";
            }
            else if (options.orderDirection === "desc") {
                options.orderDirection = "Descending";
            }

            // Create the querystring dictionary
            var querystring = _filterToDictionary(options.filter);
            querystring.push({ pageNumber: options.pageNumber });
            querystring.push({ pageSize: options.pageSize });
            querystring.push({ orderBy: options.orderBy });
            querystring.push({ orderDirection: options.orderDirection });
            //umbRequestHelper.dictionaryToQueryString(querystring)


            return umbRequestHelper.resourcePromise(
               $http.get("Backoffice/api/CustomData/Get" + resource + "s"),
               'Failed to retrieve ' + resource + "s");


        },
        postResource: function (resource, entity) {
            return umbRequestHelper.resourcePromise(
               $http.post("Backoffice/api/CustomData/Post" + resource + "?" + umbRequestHelper.dictionaryToQueryString(entity)),
               'Failed to retrieve ' + resource);
        },

        getOrder: function (id) {
            return this.getById("order", id);
        },

        getOrders: function (options) {
            return this.getAll("order", options);
        }
    };

    function _filterToDictionary(filter) {
        if (!filter)
            return;
        var dict = [];

        for (prop in filter) {
            if (filter.hasOwnProperty(prop) &&
                filter[prop] &&
                (prop.startsWith('f_') || prop == 'filter' || prop == 'orderType') &&
                filter[prop].length > 0) {

                // Add a new dictionary entry.
                var entry = {};
                entry[prop] = filter[prop];
                dict.push(entry);

            }
        }

        return dict;

    }

    return customDataResource;
}

angular.module('umbraco.resources').factory('customDataResource', customDataResource);
