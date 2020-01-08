uniform float time;
uniform float breath;

varying vec3 vViewPosition;
varying vec3 vColor;

$rotate
$constants

void main() {

	vec3 pos = position;	
	vec3 c = vec3( 0.0 );

	pos.yz *= rotate( HPI );

	c += smoothstep( 0.2, .4, length( pos.z ) );

	float len = length( pos );
	
	c.y += abs(sin( len - time)) * 0.6;
	c.z += abs(sin( len - time + 0.5)) * 0.5;

	float lenX = length( pos.x );
	pos.z *= (sin( lenX * PI )) * 0.7 * ( 1.5 - abs( sin( lenX * PI * 3.0 )) * 0.8);
	pos.y += sin( lenX * HPI ) + sin( lenX * 3.0 - time ) * 0.3 * lenX -  ( sin(length( pos.z ) * 0.3));
	
	pos.x *= 1.5;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;

	vColor = vec3(c);
}