define([
  'dojo/_base/declare',
  'dojo/Deferred',
  'dojo/when',

  'storehouse/engines/cookie',
  'storehouse/engines/indexeddb',
  'storehouse/engines/localstorage',
  'storehouse/engines/sqlite',

  'dojo/store/Memory' /*=====, './api/Store' =====*/
], function (declare, Deferred, when, CookieEngine, IDBEngine, LSEngine, SqliteEngine, Memory /*=====, Store =====*/) {


  return declare('Storehouse', Memory, {
    // summary:
    //		This is a client-side persistent object store.
    //		It implements most parts of the dojo.store.api.Store.

    constructor: function (/*dojo.store.Memory*/ options) {
      // summary:
      //		Creates a locally persistent object store.
      // options: kwArgs?
      //		This provides any configuration information that will be mixed into the store.


      options = options || {};
      for (var i in options) {
        this[i] = options[i];
      }

      if (Object.prototype.toString.call(this.enginePrecedence) != '[object Array]') {
        this.enginePrecedence = [
          'localstorage',
          'sqlite',
          'cookie'
        ];
      }

      // Choose backend
      this.engine = this._chooseBackend();

      this.data = [];
      var inst = this;
      if (options.data) { // Can't rely on this.data here, as Memory fools around w/ it
        this.applyData(options.data);
      } else {
        this._loadData().then(function(){
          inst.successHandler && inst.successHandler(inst);
        }, function(err){
          inst.errorHandler && inst.errorHandler(err);
        });
      }
    },

    //  storeId: String
    //    An identifier for the local store, allows you to have distinct local stores by setting unique ids on each
    storeId: 'dojo-store',

    //  engine: Object
    //		A pointer to the backend.
    engine: null,

    //  enginePrecedence: Array
    //    An array of storage engines to be used, preferred engines first
    enginePrecedence: null,

    //  errorHandler: Function
    //    A handler to be called if initialization of the store failed.
    errorHandler: null,

    //  successHandler: Function
    //    A handler to be called if initialization of the store succeeded.
    successHandler: null,

    _chooseBackend: function () {
      //  summary:
      //    Chooses a backend, based on engine precedence.  
      var engine;
      for(var i= 0, m=this.enginePrecedence.length; i<m; i++){
        if(true){ // TODO: check availability
          engine = this.enginePrecedence[i];
          break;
        }
      }

      if(!engine){
        throw new Error('No storage engine available; tried ' + this.enginePrecedence.join(', ') + '.');
      }

      var backend;
      switch(engine){
        case 'localstorage':
          backend = new LSEngine(this.storeId);
          break;
        case 'cookie':
          backend = new CookieEngine(this.storeId);
          break;
        default:
          throw new Error('No engine available for ' + engine + '.');
          break;
      }

      return backend;
    },

    put: function (object, options) {
      // 	summary:
      //		Stores an object
      // 	object: Object
      //		The object to store.
      // 	options: dojo.store.api.Store.PutDirectives??
      //		Additional metadata for storing the data.  Includes an 'id'
      //		property if a specific id is to be used.
      //	returns: Number

      var data = this.data,
          index = this.index,
          idProperty = this.idProperty,
          deferred = new Deferred();

      var id = object[idProperty] = (options && 'id' in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();

      var exists = id in index;

      if (id in index) {
        // object exists
        if (options && options.overwrite === false) {
          deferred.reject(new Error('Object already exists'));
        }

        // persist data
        when(this.engine.put(id, object), function (res) {

          // replace the entry in data
          data[index[id]] = object;

          deferred.resolve(id);
        }, function (err) {
          deferred.reject(err);
        });

      } else {
        // persist data
        when(this.engine.put(id, object), function (res) {

          // add the new object
          index[id] = data.push(object) - 1;

          deferred.resolve(id);
        }, function (err) {
          deferred.reject(err);
        });
      }

      return deferred.promise;
    },

    remove: function (id) {
      // 	summary:
      //		Deletes an object by its identity
      // 	id: Number
      //		The identity to use to delete the object

      var index = this.index,
          data = this.data,
          deferred = new Deferred(),
          inst = this;

      if (id in index) {
        when(this.engine.remove(id), function(){
          data.splice(index[id], 1);
          inst._indexData();
          deferred.resolve(true);
        }, function(err){
          deferred.reject(err)
        });
      } else {
        deferred.reject(new Error('Cannot remove item: No id was provided.'));
      }

      return deferred.promise;
    },

    applyData: function (data) {
      //  summary:
      //    Clears storage backend and sets data.
      //  data: Array
      //    The data to set.
      var deferred = new Deferred(),
          inst = this;

      // TODO: add apply() method to engine

      when(this.engine.clear(), function(){
        inst.index = {};
        inst.data = [];

        for (var i = 0, m = data.length; i < m; i++) {
          inst.put(data[i]);
        }

        inst._indexData();

        deferred.resolve(true);
      }, function(err){
        deferred.reject(err);
      });

      return deferred.promise;
    },

    _loadData: function () {
      // 	summary:
      //		Loads available data from storage backend.
      var deferred = new Deferred(),
          inst = this;

      when(this.engine.getAll(), function(data){
        inst.data = data;
        inst._indexData();
        deferred.resolve(true);
      }, function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    },

    _indexData: function () {
      //  summary:
      //    Rebuilds data index.
      var data = this.data;

      this.index = {};
      for (var i = 0, l = data.length; i < l; i++) {
        this.index[data[i][this.idProperty]] = i;
      }
    }
  });

});
