precision highp float;

attribute vec3 position;
attribute vec3 offsetPos;
attribute vec3 normal;
attribute vec2 uv;
attribute float num;

varying vec3 vColor;

uniform float time;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

mat2 rotate(float rad) {
  return mat2(cos(rad), sin(rad), -sin(rad), cos(rad));
}

float random(vec2 p){
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main( void ){

	vec3 pos = position;

	vec3 oPos = offsetPos;

	float mpos = 50.0;

	pos *= ( sin( num * 0.1 + time * 0.01 ) + 1.0 ) * 0.5 + 0.1;

	pos.yz *= rotate( sin( pos.x * 1.0 + time * 0.1 ) * 0.5 );

	oPos.z = mod( oPos.z + time * 0.1, mpos) - ( ( mpos / 2.0 ) + 20.0 );

	vec3 gPos = pos + oPos;

	gPos.xy *= rotate( ( gPos.z * ( sin( time * 0.005 ) * 0.2 ) ) + offsetPos.z  * 10.0);

	float res = (sin( time * 0.05 + num ) + 1.0 ) * 19.0 + 0.5;

	gPos = floor( gPos * res ) / res;
	gPos += (1.0 / res) / 2.0;


	vec4 mvPosition = modelViewMatrix * vec4( gPos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

	vColor = vec3( sin( num * 2.0 + time * 0.1 ), sin( num * 2.0 + time * 0.01 ), sin( num + 0.1 ) );

}