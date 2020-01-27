varying vec4 vColor;

void main( void ){
	
	gl_FragColor = vec4( vColor.xyz, ( 1.0 - length( gl_PointCoord - 0.5 ) * 2.0 ) * vColor.w );

}