#About

Storehouse is a persistent data store for the Dojo Toolkit implementing the dojo/store API.

It's built open dojo/store/Memory, so you have all the API you have with the Memory store, just that the data get's persisted client-side.

Behind the covers, it uses IndexedDB as storage engine and falls back to localStorage if IndexedDB is not available – if that fails, too, it uses cookies as a last resort to store the data.

#Getting Storehouse

Clone or download this repository and require 'storehouse' in your application.

#How it works

Storehouse keeps a copy of the stored data in memory, allowing for fast, synchronous access and fast queries.

Only write operations are asynchronous (as the underlying engine might work asynchronously itslef), and return Promises to make working with it as easy as possible.

#Usage

Storehouse has the same API as the Memory Store has, with some differences, as Storehouse uses storage backends that operate async, and it needs to take this into account.

##Opening a storehouse instance

First, create a new instance:

```javascript
var myStorehouse = new Storehouse(options);
```

Before you can acutally work with it, you need to open it. This will make Storehouse check for available storage backends, and prepare the chosen backend. The `open` method returns a promise, so you can use it's convenient `then` method:

```javascript
myStorehouse.open().then(function(){
  // storehouse now is ready to be worked with
  console.log('ready!');
});
```
##Methods

###`put: function (object, options)`

####Summary
Stores an object.

####Arguments

`object` is the object to store.
`options` is an optional object containing additional metadata for storing the data.  Includes an 'id' property if a specific id is to be used.

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

###`add: function(object, options)`

####Summary

Creates an object, throws an error if the object already exists

####Arguments

`object` is the object to add.
`options` is an optional object containing additional metadata for storing the data.  Includes an "id" property if a specific id is to be used.

####Returns

`add` returns a promise.

---

