define([
  'dojo/_base/declare',

  'storehouse/engines/cookie',
  'storehouse/engines/indexeddb',
  'storehouse/engines/localstorage',
  'storehouse/engines/sqlite',

  'dojo/store/Memory' /*=====, './api/Store' =====*/
], function (declare, CookieEngine, IDBEngine, LSEngine, SqliteEngine, Memory /*=====, Store =====*/) {


  return declare('Storehouse', Memory, {
    // summary:
    //		This is a client-side persistent object store.
    //		It implements most parts of the dojo.store.api.Store.

    constructor: function (/*dojo.store.Memory*/ options) {
      // summary:
      //		Creates a locally persistent object store.
      // options: kwArgs?
      //		This provides any configuration information that will be mixed into the store.
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
      if (options.data) { // Can't rely on this.data here, as Memory fools around w/ it
        this.applyData(options.data);
      } else {
        this._loadData();
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

    _chooseBackend: function () {
      //  summary:
      //    Chooses a backend, based on engine precedence.  
      var engine;
      for(var i= 0, m=this.enginePrecedence.length; i<m; i++){
        if(true){ // check availability
          engine = this.enginePrecedence[i];
          break;
        }
      }

      if(!engine){
        throw new Error('No storage engine available; tried ' + this.enginePrecedence.join(', ') + '.');
      }

      // initialize engine
      engine = LSEngine;
      engine.storeId = this.storeId;

      return engine;
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
          idProperty = this.idProperty;
      var id = object[idProperty] = (options && 'id' in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();

      var exists = id in index;

      if (id in index) {
        // object exists
        if (options && options.overwrite === false) {
          throw new Error('Object already exists');
        }

        // persist data
        this.engine.put(id, object);

        // replace the entry in data
        data[index[id]] = object;
      } else {
        // persist data
        this.engine.put(id, object);

        // add the new object
        index[id] = data.push(object) - 1;
      }
      return id;
    },

    remove: function (id) {
      // 	summary:
      //		Deletes an object by its identity
      // 	id: Number
      //		The identity to use to delete the object

      var index = this.index,
          data = this.data;
      if (id in index) {

        this.engine.remove(id);

        data.splice(index[id], 1);

        this._indexData();

        return true;
      }
    },

    applyData: function (data) {
      //  summary:
      //    Clears storage backend and sets data.
      //  data: Array
      //    The data to set.
      this.engine.clear();
      this.index = {};
      this.data = [];
      
      for (var i = 0, m = data.length; i < m; i++) {
        this.put(data[i]);
      }
      this._indexData();
    },

    _loadData: function () {
      // 	summary:
      //		Loads available data from storage backend.
      this.data = this.engine.getAll();
      this._indexData();
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
