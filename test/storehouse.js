require(["dojo", "doh", "storehouse/Storehouse", "dojo/store/Memory"], function (dojo, doh, Storehouse, Memory) {
  dojo.ready(function () {

    var tests = doh;
    var testPersistence = false;
    var engines = [
      'indexeddb',
      'localstorage',
      'cookie'
    ];

    var initialData = [
      {id: 1, name: "one", prime: false, mappedTo: "E"},
      {id: 2, name: "two", even: true, prime: true, mappedTo: "D"},
      {id: 3, name: "three", prime: true, mappedTo: "C"},
      {id: 4, name: "four", even: true, prime: false, mappedTo: null},
      {id: 5, name: "five", prime: true, mappedTo: "A"}
    ];

    for (var i = 0, m = engines.length; i < m; i++) {

      (function (engine) {

        var options = {
          enginePrecedence: [engine]
        };
        if (!testPersistence) {
          options.data = initialData
        }

        var store = new Storehouse(options);

        tests.register("storehouse-compliance-" + engine, [

          function open (t) {
            var def = new doh.Deferred();
            store.open().then(function () {
              def.callback(true);
            }, function () {
              def.errback();
            });
            return def;
          },
          function testGet (t) {
            t.is(store.get(1).name, "one");
            t.is(store.get(4).name, "four");
            t.t(store.get(5).prime);
          },
          function testQuery (t) {
            t.is(store.query({prime: true}).length, 3);
            // order is not defined by query w/o sort
            var data = store.query({even: true}, {sort: 'id'}),
                result = false;

            if (data[0].name == "four" || data[1].name == "four") {
              result = true;
            }

            t.is(true, result);
          },
          function testQueryWithString (t) {
            t.is(store.query({name: "two"}).length, 1);
            t.is(store.query({name: "two"})[0].name, "two");
          },
          function testQueryWithRegExp (t) {
            t.is(store.query({name: /^t/}).length, 2);
            t.is(store.query({name: /^t/})[1].name, "three");
            t.is(store.query({name: /^o/}).length, 1);
            t.is(store.query({name: /o/}).length, 3);
          },
          function testQueryWithTestFunction (t) {
            t.is(store.query({id: {test: function (id) {
              return id < 4;
            }}}).length, 3);
            t.is(store.query({even: {test: function (even, object) {
              return even && object.id > 2;
            }}}).length, 1);
          },
          function testQueryWithSort (t) {
            t.is(store.query({prime: true}, {sort: [
              {attribute: "name"}
            ]}).length, 3);
            t.is(store.query({even: true}, {sort: [
              {attribute: "name"}
            ]})[1].name, "two");
            t.is(store.query({even: true}, {sort: function (a, b) {
              return a.name < b.name ? -1 : 1;
            }})[1].name, "two");
            t.is(store.query(null, {sort: [
              {attribute: "mappedTo"}
            ]})[4].name, "four");
          },
          function testQueryWithPaging (t) {
            t.is(store.query({prime: true}, {start: 1, count: 1}).length, 1);
            t.is(store.query({even: true}, {start: 1, count: 1, sort: [ {attribute: 'id'} ]})[0].name, "four");
          },
          function testPutUpdate (t) {
            var def = new doh.Deferred();
            var four = store.get(4);
            four.square = true;
            store.put(four).then(function () {
              four = store.get(4);
              if (four.square === true) {
                def.callback(true);
              } else {
                def.errback();
              }
            }, function (err) {
              def.errback(err);
            });
            return def;
          },
          function testPutNew (t) {
            var def = new doh.Deferred();
            store.put({
              id: 6,
              perfect: true
            }).then(function () {
                if (store.get(6).perfect) {
                  def.callback(true);
                } else {
                  def.errback();
                }
              }, function (err) {
                def.errback(err);
              });
            return def;
          },
          function testAddDuplicate (t) {
            var def = new doh.Deferred();
            store.add({
              id: 6,
              perfect: true
            }).then(function () {
                def.errback();
              }, function (err) {
                def.callback();
              });
            return def;
          },
          function testAddNew (t) {
            var def = new doh.Deferred();
            store.add({
              id: 7,
              prime: true
            }).then(function () {
                if (store.get(7).prime) {
                  def.callback(true);
                } else {
                  def.errback();
                }
              }, function (err) {
                def.errback(err);
              });
            return def;
          },
          function testRemove (t) {
            var def = new doh.Deferred();
            store.remove(7).then(function () {
              if (store.get(7) === undefined) {
                def.callback(true);
              } else {
                def.errback();
              }
            }, function (err) {
              def.errback(err);
            });
            return def;
          },
          function testRemoveMissing (t) {
            var def = new doh.Deferred();
            store.remove(77).then(function () {

              // make sure nothing changed
              if (store.get(1).id === 1) {
                def.callback(true);
              } else {
                def.errback();
              }
            }, function () {

              // make sure nothing changed
              if (store.get(1).id === 1) {
                def.callback(true);
              } else {
                def.errback();
              }
            });
          },
          function testQueryAfterChanges (t) {
            t.is(store.query({prime: true}).length, 3);
            t.is(store.query({perfect: true}).length, 1);
          },
          function testIFRSStyleData (t) {
            var def = new doh.Deferred();
            var anotherStore = new Storehouse({
              data: {
                items: [
                  {name: "one", prime: false},
                  {name: "two", even: true, prime: true},
                  {name: "three", prime: true}
                ],
                identifier: "name"
              },
              storeId: 'ifrs',
              enginePrecedence: [engine]
            });
            anotherStore.open().then(function(){
              if (anotherStore.get("one").name == "one" &&
                  anotherStore.query({name: "one"})[0].name == "one") {
                def.callback(true);
              }
            }, function(error){
              def.errback(error);
            });
            return def;
          },
          function testAddNewIdAssignment (t) {
            var object = {
              random: true
            };
            store.add(object);
            t.t(!!object.id);
          },
          function testClear (t) {

          },
          function testApplyData (t) {
            // not part of the API, but still
            var def = new doh.Deferred();
            store.applyData(initialData).then(function(){
              if (store.get(1).name == "one" &&
                  store.get(2).name == "two" &&
                  store.get(3).name == "three" &&
                  store.get(4).name == "four" &&
                  store.get(5).name == "five" &&
                  store.data.length == 5) {
                def.callback(true);
              } else {
                def.errback();
              }
            }, function(){
              def.errback();
            });
            return def;
          }
        ]);

      })(engines[i]);

    }

  });
});
