uniform float time;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec4 vColor;

$rotate
$constants
$noise3D

void main() {

	vec3 pos = position;

	float r = 2.0;
	
	pos.yz *= rotate( PI / 2.0 );

	pos.x = sin( uv.x  * TPI) * r;
	pos.y = cos( uv.x  * TPI) * r;

	float size = 15.;
	
	pos.z *= size;
	pos.z = mod( pos.z + time, 10.0) - size / 2.0;

	pos.xy *= snoise( vec3( sin( uv * TPI ) *  0.8, time * 0.07) ) * 0.5 + 1.0;

	// pos.xy *= (snoise( vec3(sin(uv * PI) * 40.0, time * 0.5) ) * 0.1 + 1.0);

	pos.xy *= rotate( uv.y * TPI + time * 0.1 );

	// pos.xy *= snoise( vec3(( pos.xy ) * 7.0, time * 0.05) ) * 0.05 + 1.0;

	vColor = vec4( 1.0 - length( pos.z ) * 0.2 );

	gl_PointSize = 2.;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;
	vNormal = normal;

}