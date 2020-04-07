varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec4 mvpPos;
varying vec3 vPosition;

void main( void ) {

	vec3 pos = position;

	vec4 modelPosition = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * modelPosition;
	gl_Position = projectionMatrix * mvPosition;

	vPosition = pos;

	vUv = uv;
	vNormal = normalMatrix * normal;
	vViewPosition = -mvPosition.xyz;
	vWorldPosition = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;
	mvpPos = gl_Position;
}