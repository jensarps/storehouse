require([
  "dojo/ready", 'storehouse/Storehouse', "dijit/form/ComboBox"
], function(ready, Storehouse, ComboBox){

  var places = new Storehouse({
    storeId: 'places'
  });
	
	var nodeCache = {};

  var comboBox;
	
	function init(){
		
		// create references for some nodes we have to work with
		['submit', 'name', 'description'].forEach(function(id){
			nodeCache[id] = document.getElementById(id);
		});
		
		// and listen to the form's submit button.
		nodeCache.submit.addEventListener('click', enterData);

    // open the store and call populateStore when ready
    places.open().then(populateStore);
	}

  function createComboBox(){

    // create a combobox widget
    comboBox = new ComboBox({
      id: "placesSelect",
      name: "placesSelect",
      store: places, // <-- use Storehouse as data store for this widget
      searchAttr: "name"
    }, "placesSelect");

    comboBox.on('change', displayCurrentItem);
  }

  function displayCurrentItem() {
    var currentItem = comboBox.item; // this is the item as it's found in the store
    alert(currentItem.name + ':\n\n' + currentItem.description);
  }

  function populateStore(){
    if(!places.data.length){
      // if there is nothing in there, apply some default data and create the comboBox when done
      var data = [
        { id: 1, name: "Rome", description: "A definitive must-see."},
        { id: 2, name: "Venice", description: "Hard to find the spots without tourists where the students live, but worth it."},
        { id: 3, name: "Florence", description: "A beautiful city, worth a trip even if you are not into museums."}
      ];
      places.applyData(data).then(createComboBox);
    } else {
      // there already is some data in the store, so let's create the comboBox right away
      createComboBox();
    }
  }

	function enterData(){
		// read data from inputs…
		var data = {};
		['name','description'].forEach(function(key){
			var value = nodeCache[key].value.trim();
			if(value.length){
				data[key] = value;
			}
		});
		
		// …and store it.
		places.put(data).then(function(){
      clearForm();
      // Now, the item is already available in the comboBox!
      // Click the down arrow and you will see it's in the list.
		});
	}
	
	function clearForm(){
    ['name','description'].forEach(function(id){
			nodeCache[id].value = '';
		});
	}

  // go!
  ready(init);

});
