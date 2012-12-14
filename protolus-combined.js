//todo: events support
var prime = require('prime');
var Class = require('Classy');
var type = require('prime/util/type');
var string = require('prime/es5/string');
var array = require('prime/es5/array');
array.forEachEmission = function(collection, callback, complete){ //one at a time
    var a = {count : 0};
    var fn = function(collection, callback, complete){
        if(a.count >= collection.length){
            if(complete) complete();
        }else{
            callback(collection[a.count], a.count, function(){
                a.count++;
                fn(collection, callback, complete);
            });
        }
    };
    fn(collection, callback, complete);
};
array.forAllEmissions = function(collection, callback, complete){ //parallel
    var a = {count : 0};
    var begin = function(){
        a.count++;
    };
    var finish = function(){
        a.count--;
        if(a.count == 0 && complete) complete();
    };
    array.forEach(collection, function(value, key){
        begin();
        callback(value, key, function(){
           finish(); 
        });
    });
};
array.combine = function(thisArray, thatArray){ //parallel
    var result = [];
    array.forEach(thatArray, function(value, key){
        result.push(value);
    });
    return result;
};
array.contains = function(haystack, needle){ //parallel
    return haystack.indexOf(needle) != -1;
};
prime.keys = function(object){
    var result = [];
    for(var key in object) result.push(key);
    return result;
};
prime.values = function(object){
    var result = [];
    for(var key in object) result.push(object[key]);
    return result;
};
prime.clone = function(obj){
    var result;
    switch(type(obj)){
        case 'object':
            result = {};
            for(var key in obj){
                result[key] = prime.clone(obj[key]);
            }
            break;
        case 'array':
            result = obj.slice(0);
            break;
        default : result = obj;
    }
    return result;
};
prime.merge = function(objOne, objTwo){
    var result = {};
    prime.forEach(objOne, function(item, key){
        result[key] = item;
    });
    prime.forEach(objTwo, function(item, key){
        if(!result[key]) result[key] = item;
    });
    return result;
};
string.startsWith = function(str, sub){
    return str.indexOf(sub) === 0; //likely more expensive than needed
};
string.endsWith = function(str, sub){
    return str.substring(str.length-sub.length) === sub;
};
var fn = require('prime/es5/function');
var regexp = require('prime/es5/regexp');
var Emitter = require('prime/util/emitter');
var fs = require('fs');

var Options = new Class({
    setOptions : function(options){
        if(!this.options) this.options = {};
        var value;
        for(var key in options){
            value = options[key];
            if(this.on && key.substring(0,2) == 'on' && key.substring(2,3) == key.substring(2,3).toUpperCase()){
                var event = key.substring(2,3).toLowerCase()+key.substring(3);
                this.on(event, value);
            }
            this.options[key] = value;
        }
    }
});

var Protolus = {};
Protolus.Router = require('protolus-router');
Protolus.Resource = require('protolus-resource');
Protolus.Templates = require('protolus-templates');
Protolus.Application = require('protolus-application');
Protolus.PanelServer = function(options){
    if(!options) options = {};
    var router = new Protolus.Router({
        ini : 'routes.conf',
        passthru : true
    });
    Protolus.Templates.templateDirectory = '/App/Panels';
    Protolus.Templates.scriptDirectory = '/App/Controllers';
    Protolus.Templates({});
    var application = new Protolus.Application.WebServer({
        port : (options.port || 80),
        onServe : function(request, response){
            var location = request.parts.path.substring(1); // strip leading slash
            router.route(location, function(routedLocation){
                if(Protolus.Templates.Panel.exists(routedLocation)){
                    Protolus.Templates.renderPage(routedLocation, function(html){
                        response.end(html);
                    });
                }else{
                    response.end('OMG 404');
                }
            });
        }
    });
    application.addJob();
    application.loadConfiguration('Configuration/production.private.json', function(config){
        application.removeJob();
    });
    return application;
};

module.exports = Protolus;