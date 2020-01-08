uniform vec2 resolution;

uniform sampler2D infoTex;
uniform sampler2D velocityTex;
uniform sampler2D positionTex;
uniform sampler2D initPositionTex;

uniform float time;
uniform float fluffPos;
uniform float breath;

$noise4D
$rotate

vec3 noise3D( vec3 p, float time ){
	return vec3( 
		snoise( vec4( p + vec3( 34.,54.,0.) + gl_FragCoord.x, time)),
		snoise( vec4( p + vec3( 0.,454.,0.), time)),
		snoise( vec4( p + vec3( -34.,533.,46.), time))
		);
}

void main( void ){
	
	vec2 uv = gl_FragCoord.xy / resolution;

	vec3 info = texture2D( infoTex, uv ).xyz;
	vec3 pos;

	if( info.x == 0.0){ //待機

		pos = texture2D( initPositionTex, uv ).xyz;
		pos.y += fluffPos;

		pos.yz *= rotate( breath * 1.0 );
		
	}else if ( info.x == 1.0 ){ //空中

		pos = texture2D( positionTex, uv ).xyz;

		pos.xz *= rotate( 0.003 * length(fluffPos) * (snoise(vec4(pos * 0.4, time)) * 0.5 + 0.5) * 2.0 );

		pos += noise3D( pos * 0.6 , time * 0.1  ) * 0.05 + vec3( 0.03, 0.0, -0.1 ) * breath;

	}
	
	gl_FragColor = vec4( pos, 0.0 );

}