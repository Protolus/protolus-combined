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
var NPMtrospect = require('../npm-trospect');

var Protolus = {};
Protolus.Router = require('protolus-router');
Protolus.Resource = require('protolus-resource');
require('protolus-resource/handler-js');
require('protolus-resource/handler-css');
Protolus.Templates = require('protolus-templates');
Protolus.Application = require('protolus-application');
Protolus.routes = 'App/routes.conf';
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
        onServe : function(request, response){
            Protolus.Resource.handle(request, response, function(){
                var location = request.parts.path.substring(1); // strip leading slash
                //todo: accurate browser action
                router.route(location, 'GET', function(routedLocation){
                    if(Protolus.Templates.Panel.exists(routedLocation)){
                        Protolus.Templates.renderPage(routedLocation, function(html){
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
                        });
                    }else{
                        response.end('OMG 404');
                    }
                });
            });
        }
    });
    application.addJob();
    var configurationFile = 'Configuration/'+options.environment+'.private.json';
    application.loadConfiguration(configurationFile, function(){
        application.removeJob();
    });
    return application;
};
Protolus.internalRequire = function(topLevelRequire){
    NPMtrospect.require = topLevelRequire;
};

module.exports = Protolus;