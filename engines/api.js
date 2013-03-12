define([], function () {

  var engine = function (storeId, idProperty) {
    this.storeId = storeId;
    this.idProperty = idProperty;
  };

  engine.prototype = {

    storeId: '',

    idProperty: '',

    isAvailable: function () {
      //  summary:
      //    Checks if the given engine is supported and returns false if not
      //    and true if it is supported _and_ ready to be used.
      //	returns: Boolean or Promise
    },

    put: function (id, object) {
      //  summary:
      //    Stores the given object. Must throw or reject if operation fails.
      //  id: *
      //    The id of the object to store.
      //  object: Object
      //    The object to store.
      //  returns:
      //    undefined or Promise
    },

    remove: function (id) {
      //  summary:
      //    Removes the object identified by the given id. Must throw or reject
      //    if operation fails.
      //  id: *
      //    The id of the object to remove.
      //  returns:
      //    undefined or Promise
    },

    clear: function () {
      //  summary:
      //    Clears all data associated to the given storeId. Must throw or
      //    reject if operation fails.
      //  returns:
      //    undefined or Promise
    },

    getAll: function () {
      //  summary:
      //    Retrieves all data associated to the given storeId.
      //  returns:
      //    Array or Promise
    },

    apply: function (data) {
      //  summary:
      //    Clears the storage and puts the provided data in it. Must throw or
      //    reject if operation fails.
      //  data: Array
      //    An array of data objects.
      //  returns:
      //    undefined or Promise
    }

  };

  return engine;
});
