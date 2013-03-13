#About

Storehouse is a persistent data store for the Dojo Toolkit implementing the [dojo/store API](http://dojotoolkit.org/reference-guide/1.8/dojo/store.html).

It's built open [dojo/store/Memory](http://dojotoolkit.org/reference-guide/1.8/dojo/store/Memory.html), so you have all the API you have with the Memory store, just that the data get's persisted client-side.

Behind the covers, it uses IndexedDB as storage engine and falls back to localStorage if IndexedDB is not available – if that fails, too, it uses cookies as a last resort to store the data.

#Getting Storehouse

Clone or download this repository and require 'storehouse' in your application (for an example, please refer to the [examples section](https://github.com/jensarps/storehouse#examples)). Other ways to obtain Storehouse will follow.

#How it works

Storehouse keeps a copy of the stored data in memory, allowing for fast, synchronous access and fast queries.

Only write operations are asynchronous (as the underlying engine might work asynchronously itself), and return Promises to make working with it as easy as possible.

#Usage

Storehouse has the same API as the Memory Store has, with some differences, as Storehouse uses storage backends that operate async, and it needs to take this into account.

##Opening a storehouse instance

First, create a new instance:

```javascript
var myStorehouse = new Storehouse({
  storeId: 'customers'
});
```

The options object is optional and may contain one or more of the following properties:

* `storeId`: The name of the store. Defaults to `'dojo-store'`. Though this is optional, it is highly advised to provide a specific id. If you, e.g. want to use two different stores, you **must** specify different store ids.
* `idProperty`: The idProperty to use for this store. Defaults to `'id'`. Note that you cannot change the idProperty of an already existing store.
* `data`: An array of data objects to populate the store with on startup. **WARNING**: *This will erase all previously stored data and replace the contents of the store with the given data.* This property only exists due to compatability resons, and most probably you will never want to use that.
* `enginePreference`: An array of storage engines, in order of preference. Available engines are `'indexeddb'`, `'localstorage'` and `'cookie'`. Upon open, Storehouse will check each engine listed in the array if it is available in the current browser. When Storehouse finds an engine that can be used, it stops checking and goes with that engine. Be default, Storehouse uses the order as listed above.

Before you can acutally work with it, you need to `open()` it. This will make Storehouse check for available storage backends, and prepare the chosen backend. The `open` method returns a promise, so you can use it's convenient `then` method:

```javascript
myStorehouse.open().then(function(){
  // storehouse now is ready to be worked with
  console.log('ready!');
});
```
##Methods

Of the [dojo/store API](http://dojotoolkit.org/reference-guide/1.8/dojo/store.html#api), Storehouse implements the following methods:


###`get(id)`

####Summary
Retrieves an object by its identifier, returning the object.

####Arguments

* `id`: The identity to use to lookup the object

####Returns

The object in the store that matches the given id.

####Example

```javascript
var dataObject = myStorehouse.get(2);
```

---

###`getIdentity(object)`

####Summary
Returns an object's identity.

####Arguments
* `object`: The object to get the identity from

####Returns
The object's identity.	

####Example

```javascript
var id = myStorehouse.getIdentity(someDataObject);
```

---
	

###`put(object, options)`

####Summary
Stores an object.

####Arguments

* `object`: The object to store
* `options`: An optional object containing additional metadata for storing the data. The options object may contain one or more of the following properties:
  * `id`: The id of the object to store
  * `overwrite`: If set to `false`, will prevent overwriting an existing object with the given id. Defaults to `true`

####Returns
`put` returns a promise.

####Example

```javascript
var dataObject= {
  id: 15,
  name: 'John',
  lastname: 'Doe',
  age: '57'
};
myStorehouse.put(dataObject).then(function(){
  // the data now is stored and persisted
});
```

---

###`add(object, options)`

####Summary

Adds an object, throws an error if the object already exists

####Arguments

* `object`: The object to add.
* `options`: An optional object containing additional metadata for storing the data. The options object may contain the following property:
  * `id`: The id of the object to add

####Returns

`add` returns a promise.

---

###`remove(id)`

####Summary

Deletes an object by its identity

####Arguments

* `id`: The id of the object to remove.

####Returns

`remove` returns a promise.

####Example


---

###`query(query, options)`

####Summary

Queries the store for objects.

####Arguments

* `query`: The query to use for retrieving objects from the store.
* `options`: The optional arguments to apply to the resultset. The options object may contain one or more of the following proerties:
  * `start` - Starting offset
  * `count` - Number of objects to return
  * `sort` - This is an array of sort definitions, where each definition contains an attribute property indicating which property to sort on and a descending property indicating the direction of sort.

####Returns

An array containing the results of the query, extended with iterative methods.

####Example

```javascript
// Given the following store:
var store = new Memory({
  data: [
    {id: 1, name: "one", prime: false },
    {id: 2, name: "two", even: true, prime: true},
    {id: 3, name: "three", prime: true},
    {id: 4, name: "four", even: true, prime: false},
    {id: 5, name: "five", prime: true}
  ]
});

//	...find all items where "prime" is true:
var results = store.query({ prime: true });

//	...or find all items where "even" is true:
var results = store.query({ even: true });
```

#Examples

Examples are in the `example` folder.

#Tests

Tests are in the `test` directory. They require a D.O.H. runner.

#License

Storehouse is available under the terms of the modified BSD license or the Academic Free License version 2.1. For details, see the [LICENSE](https://github.com/jensarps/storehouse/blob/master/LICENSE) file.


