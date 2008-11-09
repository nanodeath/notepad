(function($){
  var registered_resource_types = {};
  
  $.merb = {
    resource: {
      // Informs this plugin what resources you have...necessary since 
      // this plugin can't pluralize/singularize your resources for you
      register: function(singular_name, plural_name, options){
        options = $.extend({
          singular: singular_name,
          plural: plural_name,
          path: '/'
        }, options || {});
        registered_resource_types[singular_name] = options;
        registered_resource_types[plural_name] = options;
      },

      create: function(options){
        options = $.extend({
          path: '/',
          dataType: 'html',
          properties: {}
        }, options || {});
        options.type = 'post';
        
        var url = options.path;

        // Maybe null, maybe not, it's something to start with though
        var singular = options.resource;
        var plural = options.resources;

        var resource_options = singular && registered_resource_types[singular] ||
                               plural && registered_resource_types[plural];
        
        // The registered resource options will be used to fill-in/override
        // the passed in settings, unless ALL the required settings are passed in
        if(resource_options && !(options.resource && options.resources && options.path)){
          url = resource_options.path;
          singular = resource_options.singular;
          plural = resource_options.plural;
        }
        
        // Obviously we need these
        if(!singular){
          throw "Can't determine singular resource (for property-setting)";
        }
        if(!plural) {
          throw "Can't determine plural resource (for url)";
        }
        
        // Goes from '/' to '/posts', for instance
        url += plural;
        
        // Setting the end of the url (if applicable)
        
        options.dataType = options.dataType.toLowerCase();
        
        var mapping = {
          'xml': 'xml',
          'json': 'json',
          'jsonp': 'json',
          'script': 'js',
          'html': '',
          'text': ''
        }
        if(mapping[options.dataType] !== undefined){
          // We don't want to add .html or .text
          if(mapping[options.dataType] !== ''){
            url += '.' + mapping[options.dataType];
          }
        } else {
          url += '.' + options.dataType;
          // User could be doing something slightly out of the ordinary, like .yaml or .rss
          // Therefore don't confuse jQuery
          options.dataType = null;
        }
        
        // Process properties (of the resource)
        // Converts body to post[body], for instance
        var new_properties = {};
        for(var i in options.properties){
          new_properties[singular + '[' + i + ']'] = options.properties[i];
        }
        options.properties = new_properties;
        
        var ajax_options = $.extend({
          type: 'post',
          url: url,
          dataType: options.dataType,
          data: options.properties
        }, options.ajax || {});
        
        $.ajax(ajax_options);
      },
      read: function(){
        
      },
      update: function(){
        
      },
      deleted: function(){
        
      }
    }
  }
})(jQuery);