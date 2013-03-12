define([
  'dojo/Deferred',
  'dojo/when',
  'dojo/_base/lang'
],
function (Deferred, when, lang) {

  var engine = function (storeId, idProperty) {
    this.storeId = storeId;
    this.idProperty = idProperty;
    this.idbFactory = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    this.dbName = 'storehouse-' + storeId;
  };

  engine.prototype = {

    db: null,

    dbName: '',

    dbVersion: 1,

    idbFactory: null,

    idProperty: '',

    keyRange: null,

    storeId: '',

    engineName: 'indexeddb',

    isAvailable: function () {

      var deferred = new Deferred();
      var openRequest = this.idbFactory.open(this.dbName, this.dbVersion);

      openRequest.onerror = function (error) {
        deferred.reject(error);
      };

      openRequest.onsuccess = lang.hitch(this, function (event) {

        if(!this.db){
          this.db = event.target.result;

          if(typeof this.db.version == 'string'){
            deferred.reject(new Error('The IndexedDB implementation in this browser is outdated.'));
            return;
          }
        }

        // double check
        if(!this.db.objectStoreNames.contains(this.storeId)){
          deferred.reject(new Error('Something is wrong with the IndexedDB implementation in this browser.'));
          return;
        }

        deferred.resolve(true);
      });

      openRequest.onupgradeneeded = lang.hitch(this, function(/* IDBVersionChangeEvent */ event){

        this.db = event.target.result;

        if (!this.db.objectStoreNames.contains(this.storeId)) {
          this.db.createObjectStore(this.storeId, { keyPath: this.idProperty, autoIncrement: false});
        }
      });

      return deferred.promise;

    },

    put: function (id, object) {
      var deferred = new Deferred();
      var putTransaction = this.db.transaction([this.storeId], 'readwrite');
      var putRequest = putTransaction.objectStore(this.storeId).put(object);
      putRequest.onsuccess = function (event) {
        deferred.resolve(event.target.result);
      };
      putRequest.onerror = function (error) {
        deferred.reject(error);
      };
      return deferred.promise;
    },

    remove: function (id) {
      var deferred = new Deferred();
      var deleteTransaction = this.db.transaction([this.storeId], 'readwrite');
      var deleteRequest = deleteTransaction.objectStore(this.storeId)['delete'](id);
      deleteRequest.onsuccess = function (event) {
        deferred.resolve(event.target.result);
      };
      deleteRequest.onerror = function (error) {
        deferred.reject(error);
      };
      return deferred.promise;
    },

    clear: function () {
      var deferred = new Deferred();
      var clearTransaction = this.db.transaction([this.storeId], 'readwrite');
      var clearRequest = clearTransaction.objectStore(this.storeId).clear();
      clearRequest.onsuccess = function (event) {
        deferred.resolve(event.target.result);
      };
      clearRequest.onerror = function (error) {
        deferred.reject(error);
      };
      return deferred.promise;
    },

    getAll: function () {
      var deferred = new Deferred();

      var getAllTransaction = this.db.transaction([this.storeId], 'readonly');
      var store = getAllTransaction.objectStore(this.storeId);
      if (store.getAll) {
        var getAllRequest = store.getAll();
        getAllRequest.onsuccess = function (event) {
          deferred.resolve(event.target.result);
        };
        getAllRequest.onerror = function (error) {
          deferred.reject(error);
        };
      } else {
        this._getAllCursor(getAllTransaction, deferred);
      }

      return deferred.promise;
    },

    _getAllCursor: function (tr, getAllDeferred) {
      var all = [];
      var store = tr.objectStore(this.storeId);
      var cursorRequest = store.openCursor();

      cursorRequest.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
          all.push(cursor.value);
          cursor['continue']();
        }
        else {
          getAllDeferred.resolve(all);
        }
      };
      cursorRequest.onError = function (error) {
        getAllDeferred.reject(error);
      };
    },

    apply: function (dataSet) {
      var deferred = new Deferred(),
          itemsLeft = dataSet.length;
      this.clear().then(lang.hitch(this, function () {
        for (var i = 0, m = dataSet.length; i < m; i++) {
          var item = dataSet[i],
              id = item[this.idProperty];
          this.put(id, item).then(function(){
            --itemsLeft || deferred.resolve();
          }, function(error){
            deferred.reject(error);
          });
        }
      }), function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }

  };

  return engine;
});
