define(['dojo/json', 'dojo/cookie'], function (JSON, cookie) {

  var engine = function (storeId) {
    this.storeId = storeId;
    this._store = {};
    this.init();
  };

  engine.prototype = {

    cookieName: '',

    storeId: '',

    _store: null,

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
      for(var key in this._store){
        data.push(this._store[key]);
      }
      return data;
    },

    updateCookie: function () {
      cookie(this.cookieName, JSON.stringify(this._store), {expires: 100});
    },

    readStoreFromCookie: function () {
      this._store = JSON.parse(cookie(this.cookieName) || '({})');
    }
  };

  return engine;

});
