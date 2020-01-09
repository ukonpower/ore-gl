attribute vec3 offsetPos;
attribute vec2 offsetUV;

attribute float num;
uniform float all;

uniform float time;
uniform mat4 rotation;
uniform vec2 rotVec;
uniform sampler2D fluid;


varying vec3 vViewPosition;
varying vec3 vColor;

$constants
$noise3D
$rotate
$random

void main() {
	vec3 c = vec3(1.0,1.0,1.0);
	vec3 vp = position * 0.01;
	vec3 wp = offsetPos * 15.0;
	float n = num / all * TPI;

	float d = n / 2.0 * TPI;

	//scale
	vec3 fluid = texture2D(fluid, offsetUV).xyz;
	vp *= 1.0 + min(20.0, length(fluid.xy));
	vp *= 1.0 - smoothstep( 0.0, 1.0, length( offsetUV * 2.0 - 1.0 ) * 1.0);

	//move
	// wp.xyz += smoothstep(-10.0,10.0,fluid.xyz) * 1.0;
	wp.xyz += vec3(fluid.xy,0.0);
	// wp.xy -= 0.5;

	//color
	c.xyz = 0.5 + vec3(abs(fluid.xyz)) * 1.0;
	// c.xyz += 1.0;

	//vertex rotator
	vec4 p = vec4(wp + vp,1.0);
	mat4 mv = modelViewMatrix;
	vec4 mvPosition = mv * p;

	gl_Position = projectionMatrix * mvPosition;
	vViewPosition = -mvPosition.xyz;

	vColor = c;
} 