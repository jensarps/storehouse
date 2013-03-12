define([
  'storehouse/engines/registry',

  'storehouse/engines/cookie',
  'storehouse/engines/indexeddb',
  'storehouse/engines/localstorage',
  'storehouse/engines/sqlite'
], function(
  registry,

  cookieEngine,
  idbEngine,
  lsEngine,
  sqlEngine
){
  registry.addEngine(cookieEngine);
  registry.addEngine(idbEngine);
  registry.addEngine(lsEngine);
  registry.addEngine(sqlEngine);
});
