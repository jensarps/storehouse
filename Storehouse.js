define([
  'dojo/_base/declare',
  'dojo/Deferred',
  'dojo/when',
  'dojo/_base/lang',

  'storehouse/engines/cookie',
  'storehouse/engines/indexeddb',
  'storehouse/engines/localstorage',
  'storehouse/engines/sqlite',

  'dojo/store/Memory' /*=====, './api/Store' =====*/
], function (declare, Deferred, when, lang, CookieEngine, IDBEngine, LSEngine, SqliteEngine, Memory /*=====, Store =====*/) {


  return declare('Storehouse', Memory, {
    // summary:
    //		This is a client-side persistent object store.
    //		It implements most parts of the dojo.store.api.Store.

    constructor: function (/*dojo.store.Memory*/ options) {
      // summary:
      //		Creates a locally persistent object store.
      // options: kwArgs?
      //		This provides any configuration information that will be mixed into the store.

      // TODO: Don't mix in everything unchecked
      options = options || {};
      for (var i in options) {
        this[i] = options[i];
      }
      this.options = options;

      if (Object.prototype.toString.call(this.enginePrecedence) != '[object Array]') {
        this.enginePrecedence = [
          'indexeddb',
          'localstorage',
          //'sqlite',
          'cookie'
        ];
      }

      // TODO: This is pretty ugly
      this.engines = {
        indexeddb: IDBEngine,
        localstorage: LSEngine,
        sqlite: SqliteEngine,
        cookie: CookieEngine
      };

    },

    //  storeId: String
    //    An identifier for the local store, allows you to have distinct local stores by setting unique ids on each
    storeId: 'dojo-store',

    //  engine: Object
    //		A pointer to the backend.
    engine: null,

    //  engines: Object
    //    A hashmap of available engines and their names
    engines: null,

    //  _engineIndex: Number
    _engineIndex: 0,

    //  enginePrecedence: Array
    //    An array of storage engines to be used, preferred engines first
    enginePrecedence: null,

    //  options: Object
    //    The options object passed to the constructor
    options: null,

    open: function () {
      this._openDeferred = new Deferred();
      this._chooseBackend();
      return this._openDeferred.promise;
    },

    _chooseBackend: function () {
      //  summary:
      //    Chooses a backend, based on engine precedence.

      var engine = new this.engines[this.enginePrecedence[this._engineIndex]](this.storeId, this.idProperty);

      var errHandler = lang.hitch(this, function () {
        this._engineIndex++;
        if (this._engineIndex < this.enginePrecedence.length) {
          this._chooseBackend();
        } else {
          this._openDeferred.reject(new Error('No storage engine available; tried ' + this.enginePrecedence.join(', ') + '.'));
        }
      });
      var successHandler = lang.hitch(this, function (res) {
        if (!res) {
          return errHandler();
        }
        this.engine = engine;
        this.engineName = this.enginePrecedence[this._engineIndex];
        this._onEngineReady();
      });

      when(engine.isAvailable(), successHandler, errHandler);

    },

    _onEngineReady: function () {
      this.data = [];
      var deferred = this._openDeferred;

      if (this.options.data) { // Can't rely on this.data here, as Memory fools around w/ it
        this.applyData(this.options.data);
      } else {
        this._loadData().then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
      }
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

      // TODO: Math.random() is a really bad thing to do as id generator
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

      when(this.engine.apply(data), function(){
        inst.index = {};
        inst.data = data;
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
