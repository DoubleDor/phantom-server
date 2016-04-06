module.exports = function( data ) {
    var svg = d3
        .select( 'body' )
        .append( 'svg' )
        .attr( 'id', 'circle_svg' )
        .attr( 'width', 100 )
        .attr( 'height', 100 );

    svg
        .append( 'circle' )
        .attr( 'cx', 50 )
        .attr( 'cy', 50 )
        .attr( 'r', data.size )
        .style( 'fill', 'red' );

    // Finally, return the html of the svg
    return document.body.innerHTML;
};
