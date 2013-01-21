protolus.js
===========
The combined Protolus environment (still under development, some of the packages are relatively stable... but at the top level things are still quite rough (including this doc))

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
    
Resources
---------
Formerly resources lived in their own directory, now Protolus is piggybacking the npm format which means, not only does publishing the module serve double duty, but it also makes it easy to serve existing browser-compatible npm modules. Check the [documentation](https://npmjs.org/package/protolus-resource).

Startup
-------

    var Protolus = require('protolus');

    var application = Protolus.PanelServer();
    application.start();

This also gives you access to the protolus libraries at: Protolus.Templates, Protolus.Router, Protolus.Resource, Protolus.Data and Protolus.Application.

Sorry about the slim docs, more to come.

Enjoy,

-Abbey Hawk Sparrow