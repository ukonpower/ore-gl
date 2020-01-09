attribute float n;
attribute float round;
attribute float theta;

uniform float allRound;
uniform float allNum;
uniform float time;
uniform vec3 uColor;
uniform float changeW;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec4 vColor;

uniform mat4 rotation;
uniform vec2 rotVec;

$rotate
$constants
$noise3D

void main() {

	vec3 pos = position;
	float group = round / allRound;
	float percent = n / allNum;

	float ttime = max( 0.0, mod( time * 1.5, 4. ) - percent * 2.0);
	
	vColor = vec4( sin( percent * TPI * 2.0) + group, percent, 1.0, 1.0 - changeW);
	vColor.xyz += uColor * 1.0;
	
	pos *= sin( min( ttime * 2.0, PI) ) * (percent);
	pos.xz *= cos( pos.y * PI );
	
	pos.y += ttime + changeW;
	pos.xy *= rotate( theta + PI / 2.0 );
	
	pos.yz *= rotate( percent * TPI );
	pos.xy *= rotate( length( pos ) * 2. * snoise( pos ));

	pos = ( (rotation) * vec4( pos, 1.0 ) ).xyz;

	// pos *= (1.0 - (changeW));

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;
	vNormal = normal;

}