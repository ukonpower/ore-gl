attribute vec3 offsetPos;
attribute float num;
attribute vec2 computeCoord;

uniform float time;
uniform float all;
uniform vec2 computeResolution;
uniform float breath;

uniform sampler2D infoTex;
uniform sampler2D positionTex;

varying vec3 vViewPosition;
varying vec4 vColor;

$rotate
$constants
$atan2

void main() {

	vec2 computeUV = computeCoord;

	vec3 wp = texture2D( positionTex, computeUV ).xyz;
	vec4 info = texture2D( infoTex, computeUV );
	vec3 vp = position;

	vp.xy *= rotate(sin( time * 20.0 - vp.y * 10.0) * 0.1 * breath);
	vp.y -= 0.15;

	float scale =  smoothstep(0.0,0.3,sin(info.y / 5.0 * PI));
	vp.y *= scale;
	
	float len = length(vp.y - 0.1);
	vec3 c = vec3(0.0);

	c.x +=  sin(len * 8.0 + time * 3.3);
	c.y +=  sin(len * 8.0 + time * 3.0 - 0.5);
	c.z +=  sin(len * 8.0 + time * 3.0 - 1.0);

	c = mix( c, vec3(1.0),smoothstep(0.1,0.0,len));

	float rotZ = offsetPos.z;
	float rotY = offsetPos.y;
	
	vp.xy *= rotate( rotZ );
	vp.xz *= rotate( rotY - HPI);

	vp.yz *= rotate( breath * 1.01);

	vec4 mvPosition = modelViewMatrix * vec4(wp + vp, 1.0);
	
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;

	vColor = vec4( c ,1.0);

}