define([
  'dojo/_base/declare',
  'dojo/Deferred',
  'dojo/when',
  'dojo/_base/lang',

  'storehouse/engines/cookie',
  'storehouse/engines/indexeddb',
  'storehouse/engines/localstorage',

  'dojo/store/Memory' /*=====, './api/Store' =====*/
], function (declare, Deferred, when, lang,
             CookieEngine, IDBEngine, LSEngine,
             Memory /*=====, Store =====*/) {

  return declare('Storehouse', Memory, {
    // summary:
    //		This is a client-side persistent object store.
    //		It implements dojo/store/api/Store.

    constructor: function (/*dojo.store.Memory*/ options) {
      // summary:
      //		Creates a locally persistent object store.
      // options: kwArgs?
      //		This provides any configuration information that will be mixed into the store.

      if (typeof options != 'undefined') {
        var allowedProperties = ['storeId', 'idProperty', 'data', 'enginePreference'];
        for (var i = 0, m = allowedProperties.length; i < m; i++) {
          var key = allowedProperties[i];
          if (typeof options[key] != 'undefined') {
            this[key] = options[key];
          }
        }
      }
      this.options = options;

      if (Object.prototype.toString.call(this.enginePrecedence) != '[object Array]') {
        this.enginePrecedence = [
          'indexeddb',
          'localstorage',
          'cookie'
        ];
      }

      this.engines = {
        indexeddb: IDBEngine,
        localstorage: LSEngine,
        cookie: CookieEngine
      };

    },

    //  storeId: String
    //    An identifier for the local store, allows you to have distinct local stores by setting unique ids on each
    storeId: 'dojo-store',

    //  engine: Object
    //		A pointer to the storage engine
    engine: null,

    //  engineName: String
    //    The name of the used engine
    engineName: '',

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
      //  summary:
      //    Opens the store.
      //  returns: Promise
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
      //  summary:
      //    Called when an engine is available. Will load persisted data into
      //    memory, or, if options.data is given, populate the backend.
      //    If successful, will resolve the promise created during the open()
      //    call.
      this.data = [];
      var deferred = this._openDeferred;

      if (this.options.data) { // Can't rely on this.data here, as Memory fools around w/ it
        // cloning data here to make sure external refs can't screw up
        // our internal representation.
        var data = lang.clone(this.options.data);
        this.applyData(data).then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
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
      //	returns: Promise

      var data = this.data,
          index = this.index,
          deferred = new Deferred();

      var id = this.ensureIdentity(object, options);

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

    /*=====
    add: function(object, options){
   		// summary:
   		//		Creates an object, throws an error if the object already exists
   		// object: Object
   		//		The object to store.
   		// options: dojo/store/api/Store.PutDirectives?
   		//		Additional metadata for storing the data.  Includes an "id"
   		//		property if a specific id is to be used.
   		// returns: Promise
   		(options = options || {}).overwrite = false;
   		// call put with overwrite being false
   		return this.put(object, options);
   	},
   	=====*/

    remove: function (id) {
      // 	summary:
      //		Deletes an object by its identity
      // 	id: Number
      //		The identity to use to delete the object

      var index = this.index,
          data = this.data,
          deferred = new Deferred(),
          inst = this;

      if (typeof id == 'undefined') {
        deferred.reject(new Error('Cannot remove item: No id was provided.'));
      }

      if (id in index) {
        when(this.engine.remove(id), function(){
          data.splice(index[id], 1);
          inst._indexData();
          deferred.resolve(true);
        }, function(err){
          deferred.reject(err)
        });
      } else {
        deferred.reject(new Error('Cannot remove item: No object found with the given id.'));
      }

      return deferred.promise;
    },

    applyData: function (data) {
   		//  summary:
   		//		Sets the given data as the source for this store, and indexes it
   		//  data: Object[]
   		//		An array of objects to use as the source of data.
      //  returns: Promise
      var deferred = new Deferred(),
          inst = this;

      if(data.items){
        // just for convenience with the data format IFRS expects
        this.idProperty = data.identifier;
        data = data.items;
      }

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

    ensureIdentity: function (object, options) {
      var idProperty = this.idProperty;
      return object[idProperty] = (options && 'id' in options) ? options.id : idProperty in object ? object[idProperty] : this._getInsertId();
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
    },

    _getInsertId: function () {
      var largest = 0;
      for(var key in this.index){
        // no need for hasOwnProperty check
        var numeric = parseInt(key, 10) || 0;
        if (numeric > largest) {
          largest = numeric;
        }
      }
      return ++largest;
    }
  });

});
