uniform float time;
uniform float breath;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vColor;

$rotate
$constants

void main() {

	vec3 pos = position;

	vec3 c = vec3(1.0);
	// c.x = sin( pos.y * 3. - time * 20.0);
	// c.y = sin( pos.y * 3. - time * 20.0 - 1.0);
	// c.z = sin( pos.y * 3. - time * 20.0 - 2.0);

	pos.y += 1.25;

	pos.yz *= rotate( breath * ( pos.y / 2.5 ) );
	

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;
	vNormal = normal;


	float w = length( pos ) * 0.4;

	vColor = vec3(c);

}