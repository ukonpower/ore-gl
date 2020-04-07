uniform sampler2D posTex;
uniform sampler2D velTex;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec4 mvpPos;

varying vec3 vPosition;
varying vec4 velocity;
varying vec2 vTexUV;
varying float life;
uniform float time;

attribute vec2 texUV;

$constants
$rotate

void main( void ) {
	
	vec3 pos = position;

	vec4 posData = texture2D( posTex, texUV );
	vec4 velData = texture2D( velTex, texUV );
	velocity = velData;

	pos *= sin( ( posData.w / velData.w ) * PI )  * ( texUV.x + 0.1 );

	pos.xy *= rotate( texUV.x * TPI);
	pos.zx *= rotate( texUV.y * TPI );

	vec3 nrml = normal;
	nrml.xy *= rotate( texUV.x * TPI);
	nrml.zx *= rotate( texUV.y * TPI );

	pos += posData.xyz * 10.0;
	
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	mvpPos = gl_Position;
	life = posData.w;
	vUv = uv;
	vNormal = normalMatrix * nrml;
	vViewPosition = -mvPosition.xyz;
	vWorldPosition = vec4( modelMatrix * vec4( pos, 1.0 ) ).xyz;

	gl_PointSize = 10.0 ;
	vPosition = pos;
	vTexUV = texUV;

}