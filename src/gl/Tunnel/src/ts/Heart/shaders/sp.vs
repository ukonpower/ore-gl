uniform mat4 rotation;
uniform vec2 rotVec;

$rotate
$constants
$noise3D

void main() {

	vec3 pos = position;

	pos = (rotation * vec4(pos,1.0)).xyz;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

}