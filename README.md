protolus.js
===========
The combined Protolus environment. Protolus is a view controller framework which does not couple views to data objects, but instead sees each view as an atomic unit which should be able to fetch it's own data, which may be a composite of many data objects. I believe this model is more representative of how we actually work on the web rather than being a naive object to template mapping, or at the other end of the spectrum: a reimplementation of Swing in js.

Getting Started
---------------

get protolus:

    npm install protolus
    
make your project directory:

    mkdir myProject
    cd myProject
    
now initialize a new protolus project:

    curl http://protol.us/fini.sh | sh
    
now run your app:

    node application.js

Layout
------
Protolus expects a certain directory structure:

    App
    _ Panels/
    _ Controllers/
    _ routes.conf
    Classes
    node_modules
    _ main
    __ main.css
    __ main.js
    __ package.json (which includes a 'resources' array which references main.(js/css))


Routing
-------

The App/routes.conf file has a series of sections which correspond to various groups and their routes.

    [*]
    articles/*/# = "articles?name=*&page=*"
    
    [post]
    articles/upload = "upload?type=article"
    
shows a couple of routes, one which only applies to a POST action, the other applying to all.

Panels
------

Panels make up the view component of Protolus, and are just a random piece of HTML however large in size you want it to be. Each [Panel](https://npmjs.org/package/protolus-templates) uses a set of macros to enable logic and subrendering, and before rendering it looks for a matching controller.

For example, if I had a panel 'signup/payment' I would put it at:

    App/Panels/signup/payment.panel.tpl

and I would put that controller at
    
    App/Controllers/signup/payment.controller.js
    
We also adds a macro to the mix for resource management: The `require` macro takes a comma separated list of node_modules to ship over to the client, and dependencies are resolved as you'd expect. This is built for inclusion in the head of the generated document and types are automatically served from endpoints like:

    /<type>/[dependencies/][compact/]module1.module2

Controllers
-----------
The controller is a simple js script who's job is to fetch & stuff any data that the panel will need into the template, which is exposed to the object as 'renderer' and to respond to any incoming input.

    renderer.set('data', myVar);
    
additionally you often have to wait for an asynchronous task to complete which you can do like:

    renderer.async(function(done){
        someFunction(function(){
            done();
        });
    });
    
and you have 'WebApplication' available to you which provides:

    WebApplcation.getSession(key);
    
and
    
    WebApplcation.setSession(key, value);
    
for managing session variables

    WebApplcation.getCookie(key);
    
and

    WebApplcation.setCookie(key, value);
    
for managing cookies


    WebApplcation.getGet(key);
    
and

    WebApplcation.getPost(key);
    
for managing incoming variables

and as a rollup for all these 

    WebApplcation.get(key)
    
which prefers get, then post, then session, then cookies

and last to pull your current session id:

    WebApplcation.sessionID()
    
Protolus.Data is also exposed as 'Data', so you can interact with the object layer, if you are using it.
    
Data
----
    
Datasources are registered by creating an entry in the configuration

    "DB:myDataSourceName" : {
        "mode" : "msql",
        "host" : "localhost",
        "user" : "dbuser",
        "password" : "P455W0RD",
        "database" : "mysqldbname"
    }

Check out the [docs](https://npmjs.org/package/protolus-data) to build your ORM, DAL or any number of minimally meaningful acronyms!
    
Resources
---------
Formerly resources lived in their own directory, now Protolus is piggybacking the npm format which means, not only does publishing the module serve double duty, but it also makes it easy to serve existing browser-compatible npm modules. Check the [documentation](https://npmjs.org/package/protolus-resource).

Startup
-------

    var Protolus = require('protolus');

    var application = Protolus.PanelServer();
    application.start();

This also gives you access to the protolus libraries at:

- Protolus.Templates 
- Protolus.Router
- Protolus.Resource
- Protolus.Data
- Protolus.Application

Testing
-------
Tests use mocha/should to execute the tests from root

    mocha

If you find any rough edges, please submit a bug!

Enjoy,

-Abbey Hawk Sparrow