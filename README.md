#About

Storehouse is a persistent data store for the Dojo Toolkit implementing the [dojo/store API](http://dojotoolkit.org/reference-guide/1.8/dojo/store.html).

It's built upon [dojo/store/Memory](http://dojotoolkit.org/reference-guide/1.8/dojo/store/Memory.html), so you have all the API you have with the Memory store, just that the data gets persisted client-side.

Behind the covers, it uses IndexedDB as storage engine and falls back to localStorage if IndexedDB is not available – if that fails, too, it uses cookies as a last resort to store the data.

#How it works

Storehouse keeps a copy of the stored data in memory, allowing for fast, synchronous read access and queries.

Only write operations are asynchronous (as the underlying engine might work asynchronously itself), and return Promises to make working with it as easy as possible. For more information on Promises, please refer to the [Dojo documentation](http://dojotoolkit.org/reference-guide/1.8/dojo/promise/Promise.html).

#Getting Storehouse

Clone or download this repository and require 'Storehouse' in your application (for an example, please refer to the [examples section](https://github.com/jensarps/storehouse#examples)). Other ways to obtain Storehouse will follow.

You might need to tell the Dojo loader where the Storehouse modules are; this is done via the `dojoConfig` config object. Please refer to the code in the examples to see some examples of this.

#Usage

Storehouse has the same API as the Memory Store has, with some differences, as Storehouse uses storage backends that operate async, and it needs to take this into account.

For usage details and a method overview, please refer to the [Usage Doc](https://github.com/jensarps/storehouse/blob/master/doc/usage.md).

#Examples

Examples are in the `example` folder.

#Tests

Tests are in the `test` directory. They require a D.O.H. runner.

#License

Storehouse is available under the terms of the modified BSD license or the Academic Free License version 2.1. For details, see the [LICENSE](https://github.com/jensarps/storehouse/blob/master/LICENSE) file.
