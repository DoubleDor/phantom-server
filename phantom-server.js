/**
 * @file phantom-server.js
 *
 * @description The phantom file to be run. It setups a PhantomJS server that
 *              will receive and run scripts as file paths.
 *
 * Copyright (C) 2016 Dor Technologies
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

var server = require( 'webserver' ).create(),
    fs = require( 'fs' ),
    system = require( 'system' ),
    page = require( 'webpage' ).create();

var page_path = fs.absolute( 'phantom.html' );

/**
 * Parses the payload on the request, and returns it as an Object
 * @param  {Object} req The request object from our phantomjs server listener
 * @return {Object}     If parse success then object, otherwise null
 */
var parsePayload = function( req ) {
    try {
        return JSON.parse( req.post );
    } catch( e ) {
        return null;
    }
};

/**
 * Responds from the server with an error
 * @param  {Object} res The response object for the phantomjs server
 */
var sendError = function( res, code, body ) {
    res.statusCode = code;
    res.write( body );
    res.close();
};

var service = server.listen( 4321 || +system.args[ 1 ], function( req, res ) {
    console.log( 'phantom-server pre-parse', JSON.stringify( req ) );
    var payload = parsePayload( req );

    if( !payload || !payload.data || !payload.evaluate_scripts || !payload.inject_scripts ) return sendError( res, 400, 'Missing required keys' );

    page.open( page_path, function( status ) {
        if( status !== 'success' ) return sendError( res, 500, 'Failed to load page, status: ' + status );

        for( var inject_script_i in payload.inject_scripts ) {
            var script_path = payload.inject_scripts[ inject_script_i ];
            console.log( 'Injecting ->', script_path );
            page.injectJs( script_path );
        }

        var evaluate_responses = payload.evaluate_scripts
            .map( function( script_path ) {
                console.log( 'Evaluating ->', script_path );
                var loaded_script = require( script_path );
                var response = page.evaluate( loaded_script, payload.data );
                return response;
            } );

        console.log( evaluate_responses );
        console.log( JSON.stringify( evaluate_responses ) );

        res.statusCode = 200;
        // res.setHeader( 'Content-Type', 'image/svg+xml' );
        res.write( JSON.stringify( evaluate_responses ) );
        res.close();
    } );
} );

if( service ) {
    console.log( 'hosting' );
}
