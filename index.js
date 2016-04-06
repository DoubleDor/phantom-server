/**
 * @file index.js
 *
 * @description This file is the main entrypoint for the PhantomServer library.
 *              In order to use the library you create and run an instance of
 *              PhantomServer. Make sure you call .stop() when you are finished,
 *              so you don't have rogue PhantomJS processes.
 *
 * Copyright (C) 2016 Dor Technologies
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */

'use strict';

var child_process = require( 'child_process' ),
    path = require( 'path' ),
    q = require( 'q' ),
    _ = require( 'underscore' ),
    assert = require( 'chai' ).assert;

var request = require( 'request' ),
    debug = require( 'debug' )( 'phantom-server' );

var PHANTOM_SERVER_SCRIPT_NAME = 'phantom-server.js';
var PHANTOM_SERVER_HOSTING_MESSAGE = 'hosting\n';
var PHANTOM_SERVER_PORT = 4321;

var PhantomServer = function( phantomjs_path ) {
    this._phantomjs_path = phantomjs_path;
    this._port = PHANTOM_SERVER_PORT;
    this._phantom_server_promise = null;
    this._phantom_child_process = null;

    /**
     * Returns the arguments for the phantomjs process to be ran with
     * @return {Array} Array of arguments to be passed to child_process.spawn
     */
    this._getPhantomJSArguments = function() {
        return [
            path.join( __dirname, PHANTOM_SERVER_SCRIPT_NAME ),
            this._port
        ];
    };

    this.start = function() {
        var _this = this;

        if( _this._phantom_server_promise !== null ) return _this._phantom_server_promise;

        _this._phantom_server_promise = q
            .Promise( function( resolve, reject ) {
                _this._phantom_child_process = child_process
                    .spawn( _this._phantomjs_path, _this._getPhantomJSArguments(), {
                        cwd: __dirname
                    } )

                _this._phantom_child_process.stdout
                    .on( 'data', function( msg ) {
                        debug( msg.toString() );
                        if( msg.toString() === PHANTOM_SERVER_HOSTING_MESSAGE ) {
                            resolve( _this );
                        }
                    } );

                _this._phantom_child_process.stderr
                    .on( 'data', function( err ) {
                        debug( err.toString() );
                        reject( err.toString() );
                    } );
            } );

        return _this._phantom_server_promise;
    };

    this.stop = function() {
        this._phantom_child_process.kill();
        this._phantom_child_process = null;
        this._phantom_server_promise = null;
    };

    this._requestServer = function( data ) {
        var url = 'http://localhost:' + this._port;

        return q
            .Promise( function( resolve, reject ) {
                request( {
                    url: url,
                    method: 'POST',
                    body: data,
                    json: true
                }, function( err, res, body ) {
                    if( err ) return reject( err );
                    if( res.statusCode !== 200 ) return reject( res.body );
                    resolve( body );
                } );
            } );
    };

    /**
     * Runs the given scripts in PhantomJS
     *
     * Will wait for server to start. If not started it will attempt to start it
     *
     * @param  {Object} options Pass information about what should be run here
     * @param  {Array=[]} options.inject_scripts Scripts to be injected on the page, using page.injectJs
     * @param  {Array=[]} options.evaluate_scripts Scripts to be evaluated on the page, using page.evaluate
     * @return {q:Promise}         A promise that will return the results of the evaluated scripts
     */
    this.run = function( options ) {
        var _this = this;

        options = options || {};
        options = _
            .defaults( options, {
                inject_scripts: [],
                evaluate_scripts: [],
                data: {},
                phantomjs_path: _this._phantomjs_path
            } );

        return _this
            .start( options.phantomjs_path )
            .then( function() {
                debug( 'requesting' );
                return _this
                    ._requestServer( options );
            } );
    };
};

module.exports = PhantomServer;
