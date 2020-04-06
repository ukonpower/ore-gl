uniform sampler2D posTex;
uniform sampler2D velTex;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec4 vMVPPosition;


attribute vec2 texUV;

$constants
$rotate

void main( void ) {
	
	vec3 pos = position;

	vec4 posData = texture2D( posTex, texUV );
	vec4 velData = texture2D( velTex, texUV );

	pos *= sin( ( posData.w / velData.w ) * PI );

	pos.xy *= rotate( texUV.x * TPI);
	pos.zx *= rotate( texUV.y * TPI );

	vec3 nrml = normal;
	nrml.xy *= rotate( texUV.x * TPI);
	nrml.zx *= rotate( texUV.y * TPI );

	pos += posData.xyz * 10.0;
	
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vMVPPosition = gl_Position;
	vUv = uv;
	vNormal = normalMatrix * nrml;
	vViewPosition = -mvPosition.xyz;
	vWorldPosition = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;

	gl_PointSize = 10.0 ;


}