uniform sampler2D dataTex;
uniform float time;

uniform vec4 rotationQ;
uniform vec2 rotVec;
uniform vec2 resolution;

varying vec2 vUv;

$noise2D

void main( void ){

	float pixel = 1.0 / resolution.x;
	vec4 data;

	if( vUv.x >= 1.0 - pixel ){

		data = rotationQ;

	}else{
		
		data = texture2D( dataTex, vec2( max( 0.0, vUv.x + pixel * 0.2), vUv.y ) );
		
	}

	gl_FragColor = data;


	//init
	if( time == 0.0 ){
		gl_FragColor = vec4( 0.0 );
	}
}