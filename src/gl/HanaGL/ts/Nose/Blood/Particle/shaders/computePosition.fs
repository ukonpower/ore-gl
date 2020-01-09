uniform vec2 resolution;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float deltaTime;

uniform bool isSplash;
uniform vec3 eruptionPos;

$random

void main( void ){

	vec2 uv = gl_FragCoord.xy / (resolution);

	vec4 posData = texture2D( texturePosition, uv );
	vec3 pos = posData.xyz;
	float time = posData.w;

	vec4 velData = texture2D( textureVelocity, uv );
	vec3 vel = velData.xyz;
	float lifeTime = velData.w;

	if( time < lifeTime ){
		
		pos += vel * deltaTime;
		posData.w += 1.0 * deltaTime;

	}else{

		vec3 rndOffset = vec3(
			random( vec2( time ) ),
			random( vec2( time + vec2(4.,655.) ) ),
			random( vec2( time + vec2( 44.39,49. ) ) )
		) - 0.5;

		pos = eruptionPos + rndOffset * 0.3;

		if( isSplash ){
			
			posData.w = 0.0;
			
		}

	}

	gl_FragColor = vec4( pos, posData.w );

}