define([
  'dojo/Deferred',
  'dojo/_base/lang'
],
function (Deferred, lang) {

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
      var handlerData = this._createHandlerDataObject(),
          putTransaction = this.db.transaction([this.storeId], 'readwrite'),
          putRequest = putTransaction.objectStore(this.storeId).put(object);

      this._connectTransaction(putTransaction, handlerData);
      this._connectRequest(putRequest, handlerData);
      return handlerData.deferred.promise;
    },

    remove: function (id) {
      var handlerData = this._createHandlerDataObject(),
          deleteTransaction = this.db.transaction([this.storeId], 'readwrite'),
          deleteRequest = deleteTransaction.objectStore(this.storeId)['delete'](id);

      this._connectTransaction(deleteTransaction, handlerData);
      this._connectRequest(deleteRequest, handlerData);
      return handlerData.deferred.promise;
    },

    clear: function () {
      var handlerData = this._createHandlerDataObject(),
          clearTransaction = this.db.transaction([this.storeId], 'readwrite'),
          clearRequest = clearTransaction.objectStore(this.storeId).clear();

      this._connectTransaction(clearTransaction, handlerData);
      this._connectRequest(clearRequest, handlerData);
      return handlerData.deferred.promise;
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
    },

    _createHandlerDataObject: function () {
      return {
        result: null,
        hasSuccess: false,
        deferred: new Deferred()
      };
    },

    _createErrorHandler: function (handlerData) {
      return function (error) {
        handlerData.deferred.reject(error);
      };
    },

    _connectRequest: function (idbRequest, handlerData) {
      idbRequest.onsuccess = function (event) {
        handlerData.hasSuccess = true;
        handlerData.result = event.target.result;
      };
      idbRequest.onerror = this._createErrorHandler(handlerData);
    },

    _connectTransaction: function (idbTransaction, handlerData) {
      idbTransaction.onabort =
      idbTransaction.onerror = this._createErrorHandler(handlerData);
      idbTransaction.oncomplete = function () {
        handlerData.deferred[handlerData.hasSuccess ? 'resolve' : 'reject'](handlerData.result);
      }
    }

  };

  return engine;
});
