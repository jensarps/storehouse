var profile = (function () {

  var miniExcludes = {
  		'storehouse/LICENSE': 1,
  		'storehouse/README.md': 1,
  		'storehouse/package.js': 1,
      'storehouse/package.json': 1
  	},
  	isTestRe = /\/test\//;

  var _profile = {

  	resourceTags: {

  		test: function(filename, mid){
  			return isTestRe.test(filename);
  		},

  		miniExclude: function(filename, mid){
  			return /\/(?:test|example|doc)\//.test(filename) || mid in miniExcludes;
  		},

  		amd: function(filename, mid){
  			return /\.js$/.test(filename);
  		}

  	}

  };

  return _profile;
})();
