uniform vec2 resolution;
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float time;
uniform float seed;

$noise4D
$random

#define NOISE_SCALE 1.5
#define TIME_SCALE 2.5


vec3 snoise3D( vec3 p ){
	return vec3(
      snoise( vec4( NOISE_SCALE * p, 7.225 * seed + TIME_SCALE * time ) ),
      snoise( vec4( NOISE_SCALE * p, 3.553 * seed + TIME_SCALE * time ) ),
      snoise( vec4( NOISE_SCALE * p, 1.259 * seed + TIME_SCALE * time ) )
    ) * 0.6;
}

void main( void ){

	vec2 uv = gl_FragCoord.xy / (resolution);

	vec4 posData = texture2D( texturePosition, uv );
	vec3 pos = posData.xyz;
	float time = posData.w;

	vec4 velData = texture2D( textureVelocity, uv );
	vec3 vel = velData.xyz;
	float lifeTime = velData.w;

	if( time == 0.0 ){

		lifeTime = snoise( vec4( uv.xyy * 10.0, time * 10.0 ) ) * 5.0 + 0.3;
		vel = vec3( 0.0, -12.0 - 2.0 * abs( snoise( vec4( uv.xxy * 1.0, time ) ) ), 0.0 );
		vel.x += pos.x * 15.0;
		
	}

	if( time < lifeTime ){

		vel *= 0.95;
		vel += snoise3D( pos * 0.65 * ( 1.0 - ( posData.w / velData.w) + 0.2 ) );
		vel.y += 0.15;
		
	}else{


		vel *= 0.0;

	}



	gl_FragColor = vec4( vel, lifeTime );

}