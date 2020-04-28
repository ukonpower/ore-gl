precision highp float;

uniform float time;

varying vec2 vUv;

void main( void ){

	vec3 c = vec3( 0.0 );
	c.x -= ( sin( length( vUv - 0.5 ) * 20.0 - time * 0.1 ) );
	c.y -= sin( length( vUv - 0.5 ) * 30.0 - time * 0.3 - 0.4 ) * 0.5;
	c -= sin( length( vUv - 0.5 ) * 15.0 - time * 0.3 - 0.8 ) * 0.5;
	gl_FragColor = vec4( c, 1.0 );
	
}