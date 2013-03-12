define(['dojo/json'], function (JSON) {

  var engine = function (storeId, idProperty) {
    this.storeId = storeId;
    this.idProperty = idProperty;
  };

  engine.prototype = {

    storeId: '',

    idProperty: '',

    engineName: 'localstorage',

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

    apply: function (dataSet) {
      this.clear();
      for (var i = 0, m = dataSet.length; i < m; i++) {
        var item = dataSet[i],
            id = item[this.idProperty];
        this.put(id, item);
      }
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
