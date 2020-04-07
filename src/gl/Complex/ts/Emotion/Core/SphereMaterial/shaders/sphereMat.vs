varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

varying vec3 vPosition;
uniform float time;

$noise4D

void main( void ) {

	vec3 pos = position;

	pos *= 1.1 + ( snoise( vec4( pos * 1.2 + time * 0.5, time * 0.2 ) ) ) * ( 0.2 + smoothstep( 0.7, 1.0, sin( time * 0.5 ) ) );

	vec4 modelPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vNormal = normalMatrix * normal;
	vViewPosition = -mvPosition.xyz;
	vWorldPosition = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;

	vPosition = pos;
	

}