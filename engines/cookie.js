define(['dojo/json', 'dojo/cookie'], function (JSON, cookie) {

  var engine = function (storeId) {
    this.storeId = storeId;
    this._store = {};
  };

  engine.prototype = {

    cookieName: '',

    storeId: '',

    _store: null,

    isAvailable: function () {
      var supported = cookie.isSupported();
      if (supported) {
        this.init();
      }
      return supported;
    },

    init: function () {
      this.cookieName = this.storeId + '-cookie';
      this.readStoreFromCookie();
    },

    put: function (key, value) {
      this._store[key] = value;
      this.updateCookie();
    },

    remove: function (key) {
      delete this._store[key];
      this.updateCookie();
    },

    clear: function () {
      this._store = {};
      this.updateCookie();
    },

    getAll: function () {
      var data = [];
      for (var key in this._store) {
        data.push(this._store[key]);
      }
      return data;
    },

    apply: function (dataSet) {
      this._store = {};
      for (var i = 0, m = dataSet.length; i < m; i++){
        var item = dataSet[i],
            id = item[this.idProperty];
        this._store[id] = item;
      }

      this.updateCookie();
    },

    updateCookie: function () {
      cookie(this.cookieName, JSON.stringify(this._store), {expires: 100});
    },

    readStoreFromCookie: function () {
      this._store = JSON.parse(cookie(this.cookieName) || '{}');
    }
  };

  return engine;

});
