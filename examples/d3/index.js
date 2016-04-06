var path = require( 'path' );

var PhantomServer = require( '../../' ),
    phantomjs_path = require( 'phantomjs-prebuilt' ).path;

var phantom_server = new PhantomServer( phantomjs_path );

phantom_server
    .run( {
        inject_scripts: [
            // Use inject scripts to load your dependencies
            path.join( __dirname, 'd3.min.js' )
        ],
        evaluate_scripts: [
            // Use evaluate scripts to run scripts that return values to you
            path.join( __dirname, 'script.js' )
        ],
        // Use data to pass additional data, this is sent as an argument to each
        // of the evaluate_scripts
        data: {
            size: 40
        }
    } )
    .then( function( evaluate_responses ) {
        console.log( evaluate_responses[ 0 ] ); // true
        phantom_server.stop(); // MAKE SURE YOU STOP THE SERVER WHEN YOU ARE DONE
    } );
