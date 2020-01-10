precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform float time;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;


mat2 rotate(float rad) {
  return mat2(cos(rad), sin(rad), -sin(rad), cos(rad));
}

void main( void ){

	vec3 pos = position;
	pos.z = 1.0;

	vUv = uv;

    gl_Position = vec4( pos, 1.0 );

}