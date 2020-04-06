uniform sampler2D posTex;
uniform sampler2D velTex;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;


attribute vec2 texUV;

$constants

void main( void ) {
	
	vec3 pos = position;

	vec4 posData = texture2D( posTex, texUV );
	vec4 velData = texture2D( velTex, texUV );

	pos *= sin( ( posData.w / velData.w ) * PI );
	pos += posData.xyz * 10.0;
	
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;
	vNormal = normalMatrix * normal;
	vViewPosition = -mvPosition.xyz;
	vWorldPosition = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;

	gl_PointSize = 10.0 ;


}