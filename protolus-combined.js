//todo: events support
var ext = require('prime-ext');
var prime = ext(require('prime'));
var Class = require('Classy');
var type = require('prime/util/type');
var string = ext(require('prime/es5/string'));
var array = ext(require('prime/es5/array'));
var fn = require('prime/es5/function');
var regexp = require('prime/es5/regexp');
var Emitter = require('prime/util/emitter');
var fs = require('fs');
var Options = require('prime-ext/options');
var Registry = require('prime-ext/registry');
var Filters = require('prime-ext/filters');
var InternalWorker = require('prime-ext/internal-worker');
var Smarty = require('tag-template/smarty');
var NPMtrospect = require('npm-trospect');

var Protolus = {};
Protolus.Router = require('protolus-router');
Protolus.Resource = require('protolus-resource');
require('protolus-resource/handler-js');
require('protolus-resource/handler-css');
Protolus.Templates = require('protolus-templates');
Protolus.Application = require('protolus-application');
Protolus.routes = 'App/routes.conf';
var TLRQ = require;
Protolus.PanelServer = function(options){
    if(!options) options = {};
    if(!options.environment) options.environment = 'production';
    var router = new Protolus.Router({
        ini : Protolus.routes,
        passthru : true
    });
    Protolus.Templates.set({
        base : (options.base || process.cwd()),
        templateDirectory : '/App/Panels',
        scriptDirectory : '/App/Controllers'
    });
    var registry = new Protolus.Resource.Registry();
    var requirer = {working : false};
    var renderHeadAndReturnPage = function(html, request, response, headOptions, path){
        Protolus.Resource.head(headOptions, function(tags){
            console.log('rendered', path);
            var pageTags = tags.join("\n        ");
            if(pageTags) html = Protolus.Templates.insertTextAtTarget(pageTags, 'head', html);
            response.end(html);
        });
    };
    Smarty.registerMacro('require', function(node){
        if(node.attributes.name == undefined) throw('require macro requires \'name\' attribute');
        var resources = node.attributes.name.split(',');
        requirer.working = true;
        array.forAllEmissions(resources, function(resource, index, rtrn){
            
            Protolus.Resource.import(resource, registry, function(){
                rtrn();
            });
        }, function(){
            if(type(requirer.working) == 'function') requirer.working();
            requirer.working = false;
        });
        //todo:inline
        //todo: handle in-browser
        return '';
    });
    var application = new Protolus.Application.WebServer({
        port : (options.port || 80),
        onServe : function(request, response, connection){
            Protolus.Resource.handle(request, response, function(){
                if(request.parts.path.substring(-1) == '/') request.parts.path += 'index';
                var location = request.parts.path.substring(1); // strip leading slash
                router.route(location, request.method.toUpperCase(), function(routedLocation){
                    if(Protolus.Templates.Panel.exists(routedLocation)){
                        Protolus.Templates.renderPage(routedLocation, {
                            onSuccess : function(html){
                                if(!requirer.working) renderHeadAndReturnPage(html, request, response, {
                                    dependencies : true,
                                    compact : true,
                                    registry : registry
                                }, routedLocation);
                                else requirer.working = function(){
                                    renderHeadAndReturnPage(html, request, response, {
                                        dependencies : true,
                                        compact : true,
                                        registry : registry
                                    }, routedLocation);
                                }
                            }, env : {
                                application : connection
                            }
                        });
                    }else{
                        fs.exists(routedLocation, function(exists){
                            if(!exists){
                                response.end('OMG 404');
                            }else{
                                fs.readFile(routedLocation, function(err, data){
                                    response.end(data);
                                })
                            }
                        });
                    }
                });
            });
        }
    });
    application.addJob();
    var configurationFile = 'Configuration/'+options.environment+'.private.json';
    application.loadConfiguration(configurationFile, function(conf){
        if(Protolus.Data){
            prime.filter(application.configurations, function(key){
                return key.indexOf('DB:') === 0;
            }, function(databasesToRegister){
                prime.each(databasesToRegister, function(options, key){
                    var name = key.substring(3);
                    var db;
                    //todo: allow sessions to be linked to datasources
                    switch(options.type){
                        case 'mongo':
                            if(!Protolus.Data.Source.Mongo) Protolus.Data.loadSource('Mongo');
                            db = new Protolus.Data.Source.Mongo(options);
                            break;
                        case 'mysql':
                            if(!Protolus.Data.Source.MySQL) Protolus.Data.loadSource('MySQL');
                            db = new Protolus.Data.Source.MySQL(options);
                            break;
                        //todo: more types
                        default : throw('unknown datasource type: '+options.type);
                    }
                    Protolus.Data.sources[name] = db;
                    //console.log('name', db);
                })
            });
        }
        application.removeJob();
    });
    return application;
};
Protolus.internalRequire = function(topLevelRequire){
    NPMtrospect.require = topLevelRequire;
    if(Protolus.Data) Protolus.Data.internalRequire = topLevelRequire;
    Protolus.Templates.internalRequire = topLevelRequire;
    Protolus.Resource.internalRequire(topLevelRequire);
    TLRQ = topLevelRequire;
};
if(!GLOBAL.Protolus) GLOBAL.Protolus = Protolus;
Protolus.with = function(module){
    switch(module.toLowerCase()){
        case 'data':
            Protolus.Data = require('protolus-data');
            break;
        default : throw('unknown protolus module: '+module);
    }
    return Protolus;
};
module.exports = Protolus;