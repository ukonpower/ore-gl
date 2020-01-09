attribute vec3 offsetPos;
attribute float num;
varying vec3 vViewPosition;
varying vec3 vColor;
uniform float time;
uniform float all;
uniform mat4 rotation;
uniform vec2 rotVec;
uniform vec3 col;

$rotate
$constants
$random

void main() {

	vec3 pos = position;
	vec3 c = vec3( 1.0 );

	pos.xz *= rotate( sin( time ) * 6.0 );

	pos = vec4( rotation * vec4( pos + offsetPos, 1.0 ) ).xyz;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0);
	gl_Position = projectionMatrix * mvPosition;
	vViewPosition = -mvPosition.xyz;

	vColor = c;
}