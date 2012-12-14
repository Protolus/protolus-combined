protolus.js
===========
The combined Protolus environment (still under development, some of the packages are relatively stable... but at the top level things are still quite rough (including this doc))

Layout
------
Protolus expects a certain directory structure:

* App
*   Panels
*   Controllers
*   routes.conf
* Classes
* node_modules
*   main
*       main.less
*       main.js
*       package.json


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

Controllers
-----------
The controller is a simple js script who's job is to fetch & stuff any data that the panel will need into the template, which is exposed to the object as 'renderer' and to respond to any incoming input.

    renderer.set('data', myVar);
    
Resources
---------
Formerly resources lived in their own directory, now Protolus is piggybacking the npm format which means, not only does publishing the module serve double duty, but it also makes it easy to serve existing browser-compatible npm modules. Check the [documentation](https://npmjs.org/package/protolus-resource).

Startup
-------

    var Protolus = require('./protolus-combined');

    var application = Protolus.PanelServer();
    application.start();

This also gives you access to the protolus libraries at: Protolus.Templates, Protolus.Router, Protolus.Resource, Protolus.Data and Protolus.Application.

Sorry about the slim docs, more to come.

Enjoy,

-Abbey Hawk Sparrow