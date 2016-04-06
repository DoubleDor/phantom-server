require( 'mocha-runnable-generators' );

var path = require( 'path' );

var request = require( 'request' ),
    q = require( 'q' ),
    assert = require( 'chai' ).assert;

var PhantomServer = require( '../' );

it( 'smoke', function() {
    assert( true );
} );

var ping = function( url, expect_fail ) {
    return q
        .Promise( function( resolve, reject ) {
            request( {
                url: url,
                method: 'get'
            }, function( err, res, body ) {
                if( err && !expect_fail ) reject( err );
                if( err && expect_fail ) resolve();
                if( !err && expect_fail ) reject( err );
                if( !err && !expect_fail ) resolve();
            } );
        } );
};

it( 'Should server lifetime properly', function *() {
    var phantom_server = new PhantomServer( require( 'phantomjs-prebuilt' ).path );
    assert.isDefined( phantom_server );

    yield phantom_server.start();
    yield ping( 'http://localhost:4321' );
    yield phantom_server.stop();
    yield ping( 'http://localhost:4321', true )
    yield phantom_server.start();
    yield ping( 'http://localhost:4321' );
    yield phantom_server.stop();
    yield ping( 'http://localhost:4321', true )
} );

it( 'Should see window defined', function *() {
    var phantom_server = new PhantomServer( require( 'phantomjs-prebuilt' ).path );
    assert.isDefined( phantom_server );

    var results = yield phantom_server
        .run( {
            evaluate_scripts: [
                path.join( __dirname, 'test_scripts/window_defined.js' )
            ]
        } );

    assert.equal( results.length, 1, 'results.length = 1' );
    assert.equal( results[ 0 ], true, 'results[ 0 ] = true' );

    phantom_server.stop();
} );
