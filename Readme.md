# Phantom Server

This project uses the webserver library in PhantomJS to host a simple phantomjs
webserver that will run scripts you pass it over http. This allows you to
easily run scripts that require the DOM (d3, js enabled web scrapers) from
NodeJS.

## Example

This is a simple example demonstrating that window will be defined in your evaluate
scripts. For a more complex example that uses d3, see `examples/d3`.

```javascript
# script.js
/**
 * This is the function that will be run in the page by PhantomJS. It has access
 * anything you would normally have access to in a page.
 */
module.exports = function() {
    return window !== undefined;
};
```

```javascript
# index.js
var path = require( 'path' );

var PhantomServer = require( 'phantom-server' ),
    phantomjs_path = require( 'phantomjs-prebuilt' ).path;

var phantom_server = new PhantomServer( phantomjs_path );

phantom_server
    .run( {
        evaluate_scripts: [
            path.join( __dirname, 'script.js' );
        ]
    } )
    .then( function( evaluate_responses ) {
        console.log( evaluate_responses[ 0 ] ); // true
        phantom_server.stop(); // MAKE SURE YOU STOP THE SERVER WHEN YOU ARE DONE
    } );
```
