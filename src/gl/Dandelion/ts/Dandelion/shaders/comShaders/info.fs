uniform vec2 resolution;

uniform sampler2D infoTex;
uniform sampler2D velocityTex;
uniform sampler2D positionTex;

uniform float time;
uniform float breath;
uniform float deltaTime;

$noise4D

void main( void ){
	
	vec2 uv = gl_FragCoord.xy / resolution;

	vec4 info = texture2D( infoTex, uv );
	vec3 pos = texture2D( positionTex, uv ).xyz;
	vec3 vel = texture2D( velocityTex, uv ).xyz;

	//state 0: 初期
	//state 1: ぶっ飛び
	float state = info.x;
	float lifeTime = info.y;
	float pow = info.z;
	float colW = info.w;

	if( state == 0.0 ){

		pow += ( snoise( vec4( pos, time ) ) + 0.2 )  * smoothstep( 0.4, 1.5, abs(breath));

		if( pow >= 1.0 ){

			state = 1.0;

		}

		if( lifeTime < 1.5 ){
			lifeTime = lifeTime + deltaTime;
		}

	}else if( state == 1.0 ){

		lifeTime += deltaTime;

		if( lifeTime >= 5.0 ){

			state = 0.0;

			pow = 0.0;

			lifeTime = 0.0;

		}

	}

	
	gl_FragColor = vec4( state, lifeTime, pow, colW );

}