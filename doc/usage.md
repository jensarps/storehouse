# Usage

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
* `data`: An array of data objects to populate the store with on startup. **WARNING**: *This will erase all previously stored data and replace the contents of the store with the given data.* This property only exists due to compatibility reasons, and most probably you will never want to use that.
* `enginePreference`: An array of storage engines, in order of preference. Available engines are `'indexeddb'`, `'localstorage'` and `'cookie'`. Upon open, Storehouse will check each engine listed in the array if it is available in the current browser. When Storehouse finds an engine that can be used, it stops checking and goes with that engine. Be default, Storehouse uses the order as listed above.

Before you can actually work with it, you need to `open()` it. This will make Storehouse check for available storage backends, and prepare the chosen backend. The `open` method returns a promise, so you can use it's convenient `then` method:

```javascript
myStorehouse.open().then(function(){
  // storehouse now is ready to be worked with
  console.log('ready!');
});
```

After the Storehouse instance has opened, you can find the name of the storage engine that is being used in the `engineName` property.

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

####Example

```javascript
var dataObject= {
  id: 15,
  name: 'John',
  lastname: 'Doe',
  age: '57'
};
myStorehouse.add(dataObject).then(function(){
  // the data now is stored and persisted
});
```

---

###`remove(id)`

####Summary

Deletes an object by its identity

####Arguments

* `id`: The id of the object to remove.

####Returns

`remove` returns a promise.

####Example

```javascript
var dataObject= {
  id: 15,
  name: 'John',
  lastname: 'Doe',
  age: '57'
};
myStorehouse.remove(15).then(function(){
  // the object with id #15 is now deleted from the store
});
```

---

###`query(query, options)`

####Summary

Queries the store for objects.

####Arguments

* `query`: The query to use for retrieving objects from the store.
* `options`: The optional arguments to apply to the resultset. The options object may contain one or more of the following properties:
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
