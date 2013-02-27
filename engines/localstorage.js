define(['dojo/json'], function (JSON) {

  var engine = function (storeId) {
    this.storeId = storeId;
  };

  engine.prototype = {

    storeId: '',

    isAvailable: function () {
      return ('localStorage' in window) && typeof localStorage.setItem != 'undefined';
    },

    put: function (id, object) {
      localStorage.setItem(this.prefixId(id), JSON.stringify(object));
    },

    remove: function (id) {
      localStorage.removeItem(this.prefixId(id));
    },

    clear: function () {
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var key = localStorage.key(i);
        if (this.hasPrefix(key)) {
          localStorage.removeItem(key);
        }
      }
    },

    getAll: function () {
      var data = [], i = 0, m = localStorage.length, key;
      for (; i < m; i++) {
        key = localStorage.key(i);
        if(this.hasPrefix(key)){
          data.push(JSON.parse(localStorage.getItem(key)));
        }
      }
      return data;
    },

    prefixId: function (id) {
      return this.storeId + '-' + id;
    },

    hasPrefix: function(key){
      return key.indexOf(this.storeId + '-') === 0;
    }

  };

  return engine;
});
