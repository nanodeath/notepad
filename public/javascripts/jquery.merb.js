(function($){
  var registered_resource_types = {};
  
  // Private methods
  var merb = {
    resource: {
      // Determine the extension, if any, that we should concatenate onto the end of the url
      // Preconditions: dataType is a string
      // Input: dataType as jQuery ajax would expect it
      // Output: object where .extension is the extension that we want
      //         to append to the request, and .clear_dataType is a boolean
      //         suggesting whether we should clear the dataType in the calling method
      determine_extension: function(dataType){
        // Eh, this is an unfortunate way of handling the following cases:
        // 1) we don't want any extension added (html, text)
        // 2) we want a different extension added than the one we specified (jsonp)
        // 3) we want an extension added and set the dataType (xml, json)
        // 4) we want an extension added, but not the dataType (yaml, rss, etc [not specified])
        var mapping = {
          'xml': 'xml',
          'json': 'json',
          'jsonp': 'json',
          'script': 'js',
          'html': '',
          'text': ''
        }
        // Ugly way of doing this but this really needs to return both
        var ret = {extension: '', clear_dataType: false};
        
        dataType = dataType.toLowerCase();
        
        if(mapping[dataType] !== undefined){
          // We don't want to add .html or .text
          if(mapping[dataType] !== ''){
            ret.extension = '.' + mapping[dataType];
          }
        } else {
          ret.extension = '.' + dataType;
          // User could be doing something slightly out of the ordinary, like .yaml or .rss
          // Therefore don't confuse jQuery...
          ret.clear_dataType = true;
        }
        return ret;
      },
      // Return the resource options stored with $.merb.resource.register for a given resource
      // Preconditions: resource is an object
      // Input: Resource object with .singular and/or .plural properties
      get_resource_options: function(resource){
        var ret = resource.singular && registered_resource_types[resource.singular] ||
                  resource.plural && registered_resource_types[resource.plural];
        return ret || {};
      }
    }
  };
  
  // Public methods
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

        // Careful not to confuse "resource" and "options.resource"
        // "resource" is an object storing the terms+path whereas
        // options.resource is just the singular form of the resource name
        var resource = {
          singular: options.resource,
          plural: options.resources,
          path: options.path
        };
        
        // The registered resource options will be used to fill-in/override
        // the passed in settings, unless ALL the required settings are passed in
        if(!resource.singular || !resource.plural){
          resource = merb.resource.get_resource_options(resource);
        }
        
        // Obviously we need these
        if(!resource.singular){
          throw "Can't determine singular resource (for property-setting)";
        }
        if(!resource.plural) {
          throw "Can't determine plural resource (for url)";
        }
        
        // Goes from '' to '/posts', for instance
        var url = resource.path + resource.plural;
        
        // Setting the end of the url (if applicable)
        var det_ext = merb.resource.determine_extension(options.dataType);
        url += det_ext.extension;
        if (det_ext.clear_dataType) {
          options.dataType = null;
        }
        
        // Process properties (of the resource)
        // Converts "body" to "post[body]", for instance
        var new_properties = {};
        for(var i in options.properties){
          new_properties[resource.singular + '[' + i + ']'] = options.properties[i];
        }
        options.properties = new_properties;
        
        // Fairly standard fare here
        var ajax_options = $.extend({
          type: 'post',
          url: url,
          dataType: options.dataType,
          data: options.properties
        }, options.ajax || {});
        
        $.ajax(ajax_options);
      },
      read: function(options){
        // See create method for comments -- this method is basically the same
        options = $.extend({
          path: '/',
          dataType: 'html',
          separator: '/'
        }, options || {});

        var resource = {
          singular: options.resource,
          plural: options.resources,
          path: options.path
        };
        
        if(!resource.plural){
          resource = merb.resource.get_resource_options(resource);
        }
        
        if(!resource.plural) {
          throw "Can't determine plural resource (for url)";
        }
        
        var url = resource.path + resource.plural;
        
        // This lets you either retrieve the index or a particular element
        if(options.id){
          url += options.separator + options.id;
        }
        
        var det_ext = merb.resource.determine_extension(options.dataType);
        url += det_ext.extension;
        if (det_ext.clear_dataType) {
          options.dataType = null;
        }
        
        var ajax_options = $.extend({
          type: 'get',
          url: url,
          dataType: options.dataType
        }, options.ajax || {});
        
        $.ajax(ajax_options);
      },
      update: function(){
        
      },
      deleted: function(){
        
      }
    }
  }
})(jQuery);