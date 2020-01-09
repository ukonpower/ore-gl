
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
	vColor = vec4( posData.w + 0.1 , velData.w * 0.15, 0.0, 0.5 );
	vColor.xyz += velData.xyz * 0.1;
	
	gl_PointSize = (windowSizeY / 50.0) * smoothstep( 1.0, 0.0,  posData.w );
	// gl_PointSize = 2.0;

	pos *= 0.6;

	vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
	gl_Position = projectionMatrix * mvPosition;
}