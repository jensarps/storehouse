define([], function(){

  var registry = {

    registeredEngines: {},

    addEngine: function (engine) {
      this.registeredEngines[engine.name] = engine;
    }

  };

  return registry;
});
