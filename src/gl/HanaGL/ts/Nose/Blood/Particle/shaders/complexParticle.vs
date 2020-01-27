
attribute vec2 computeCoord;

uniform float windowSizeY;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;

uniform float num;

varying vec4 vColor;

void main(void){

	vec4 posData = texture2D( texturePosition, computeCoord / num );
	vec3 pos = vec3( posData.xyz );

	vec4 velData = texture2D( textureVelocity, computeCoord / num );

	vec3 c = vec3(0.0);
	vColor = vec4( posData.w + 0.4 , velData.w * 0.00, 0.0, 0.9 );
	vColor.xyz += normalize( velData.xyz ) * ( posData.w / velData.w ) * 0.7 ;
	
	gl_PointSize = max( 1.0, ( windowSizeY / 70.0 ) * ( 1.0 - ( posData.w / (velData.w  + 0.1)) * 1.0 ) );
	// gl_PointSize = 1.0;
	// gl_PointSize = 2.0;

	pos *= 0.6;

	vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
	gl_Position = projectionMatrix * mvPosition;
}