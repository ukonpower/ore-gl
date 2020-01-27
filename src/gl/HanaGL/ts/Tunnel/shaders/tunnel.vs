uniform float time;
uniform float windowY;
uniform float splash;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec4 vColor;

$rotate
$constants
$noise3D

void main() {

	vec3 pos = position;

	float r = 4.0;
	
	pos.yz *= rotate( PI / 2.0 );

	pos.x = sin( uv.x  * TPI) * r;
	pos.y = cos( uv.x  * TPI) * r;

	float size = 15.;
	
	pos.z *= size;
	pos.z = ( mod( pos.z + time * 0.2, 10.0) - size / 2.0 ) * 4.0 - 4.0;

	pos.xy *= snoise( vec3( sin( uv * TPI ) *  0.8, time * 0.07) ) * 0.5 + 1.0;

	pos.xy *= rotate( uv.y * TPI + time * 0.1 );
	// pos.xy *= 1.0 - length( pos.z * 0.025);

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;	
	vNormal = normal;

	gl_PointSize = ( windowY / 200.0 ) * max( 1.0, ( 1.0 - length( pos.z * 0.1 ) + sin( pos.z * ( 0.4 + splash * 2.0 ) - (time + splash * 0.2) * ( 2.0 )) * 1.0 ) * (2.0 + splash * 2.0));

	vColor = vec4( 1.0 + sin( pos.z - time ) , 1.0 - splash * 0.9 + sin( pos.z - time + 30.0) * ( 1.0 - splash ), 1.0 - splash + sin( pos.z - 0.5 + time ) * splash, max( 0.0, (1.0 - length( pos.z * 0.04)) * 0.1 ) );

}