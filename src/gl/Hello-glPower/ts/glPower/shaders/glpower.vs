precision highp float;

attribute vec3 position;
attribute vec3 offsetPos;
attribute vec3 color;
attribute vec3 normal;
attribute vec2 uv;
attribute vec2 offsetUV;

uniform float time;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D tex;

varying vec3 vColor;

attribute float ind;

mat2 rotate(float rad) {
  return mat2(cos(rad), sin(rad), -sin(rad), cos(rad));
}

float random(vec2 p){
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main( void ){

	vec3 pos = position;

	float n = random( vec2( ind, time ) ) * 1.0 + 0.9;

	float theta = time * 0.03;

	pos *= ( sin( time * 0.1 ) + 1.0 ) * 0.1 + 0.9;

	pos.xz *= rotate( sin( theta) * 0.5 );
	pos.yz *= rotate( sin( -theta * 1.5 ) * 0.2 );

	vec4 mvPosition = modelViewMatrix * vec4( pos + offsetPos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = 5.0;

	vColor = vec3( normal );

}