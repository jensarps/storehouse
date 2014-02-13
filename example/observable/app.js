require(['dojo/store/Observable', 'storehouse/Storehouse', 'dojo/on', 'dojo/html'], function (Observable, Storehouse, on, html) {

  var tpls = {
    row: '<tr><td>{customerid}</td><td><input id="lastname_{customerid}" value="{lastname}"></td><td><input id="firstname_{customerid}" value="{firstname}"></td><td><button onclick="app.deleteItem(\'{customerid}\');">delete</button><button onclick="app.updateItem(\'{customerid}\');">update</button></td></tr>',
    table: '<table><tbody><tr><th>ID</th><th>Last Name</th><th>First Name</th><th></th></tr>{content}</table></tbody>'
  };

  var nodeCache = {};

  // create observable store
  var customers = new Observable(new Storehouse({
    storeId: 'customer-observable',
    idProperty: 'customerid'
  }));

  // query the store for all customers named 'Miller'
  var resultsMiller = customers.query({lastname: 'Miller'});

  // now listen for any changes on the query
  resultsMiller.observe(function (object, removedFrom, insertedInto) {
    if (removedFrom > -1) { // existing object removed
      alert('A Miller was removed, see console for details');
    }
    if (insertedInto > -1) { // new or updated object inserted
      alert('A Miller was updated or added, see console for details');
    }

    console.log(object);
  });

  function init () {

    // open the store
    customers.open().then(refreshTable);

    // create references for some nodes we have to work with
    dojo.forEach(['customerid', 'firstname', 'lastname', 'results-container'], function (id) {
      nodeCache[id] = document.getElementById(id);
    });
  }

  function refreshTable () {
    listItems(customers.data);
  }

  function listItems (data) {
    var content = '';
    dojo.forEach(data, function (item) {
      content += tpls.row.replace(/\{([^\}]+)\}/g, function (_, key) {
        return item[key];
      });
    });

    var node = dojo.byId('results-container');
    html.set(node, tpls.table.replace('{content}', content));
  }

  function checkForNumericId (id) {
    var numericId = parseInt(id, 10);
    return isNaN(numericId) ? id : numericId;
  }

  function deleteItem (id) {
    id = checkForNumericId(id);
    customers.remove(id).then(refreshTable);
  }

  function updateItem (id) {
    id = checkForNumericId(id);
    var data = {
      customerid: parseInt(id, 10),
      firstname: dojo.trim(document.getElementById('firstname_' + id).value),
      lastname: dojo.trim(document.getElementById('lastname_' + id).value)
    };
    customers.put(data).then(refreshTable);
  }

  function makeRandomEntry () {
    var lastnames = ['Smith', 'Miller', 'Doe', 'Frankenstein', 'Furter'],
        firstnames = ['Peter', 'John', 'Frank', 'James', 'Jill'];

    var entry = {
      lastname: lastnames[Math.floor(Math.random() * 5)],
      firstname: firstnames[Math.floor(Math.random() * 4)],
      age: Math.floor(Math.random() * (100 - 20)) + 20
    };

    return entry;
  }

  function addRandomCustomer () {
    var data = makeRandomEntry();
    customers.put(data).then(function () {
      refreshTable();
    });
  }

  // export some functions to the outside to
  // make the onclick="" attributes work.
  window.app = {
    deleteItem: deleteItem,
    updateItem: updateItem,
    addRandomCustomer: addRandomCustomer
  };

  // go!
  init();

});
