varying vec2 vUv;
uniform float time;
uniform sampler2D tex;

void main(void){
	
	vec2 cuv = vUv * 2.0 - 1.0;
	vec3 c = 1.0 - texture2D( tex, vUv ).xyz;
	
	gl_FragColor = vec4( c, 1.0 );
}