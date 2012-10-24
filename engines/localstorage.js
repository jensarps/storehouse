define([], function () {
  var engine = {

    storeId: '',

    get: function (id) {
      return JSON.parse(localStorage.getItem(this.prefixId(id)));
    },

    put: function (id, object) {
      localStorage.setItem(this.prefixId(id), JSON.stringify(object));
    },

    remove: function (id) {
      localStorage.removeItem(this.prefixId(id));
    },

    clear: function () {
      localStorage.clear();
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
