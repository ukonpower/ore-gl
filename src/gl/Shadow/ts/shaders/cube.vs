precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
varying vec3 vColor;

uniform float time;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;


void main( void ){

	vec3 pos = position;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

}