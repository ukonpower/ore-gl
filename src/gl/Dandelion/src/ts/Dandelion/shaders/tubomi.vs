uniform float time;
uniform float breath;

varying vec3 vViewPosition;
varying vec3 vColor;

$rotate
$constants

void main() {

	vec3 pos = position;

	pos.y += 2.5;

	pos.yz *= rotate( breath );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;

	vColor = vec3(0.1);
}