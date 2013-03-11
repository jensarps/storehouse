define([], function () {

  var engine = function (storeId, idPrefix) {
    this.storeId = storeId;
  };

  engine.prototype = {

    storeId: '',

    isAvailable: function () {
    },

    put: function (id, object) {
    },

    remove: function (id) {
    },

    clear: function () {
    },

    getAll: function () {
    }

  };

  return engine;
});
