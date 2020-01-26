varying vec2 vUv;
uniform float time;
uniform sampler2D tex;

void main(void){
	
	vec2 cuv = vUv * 2.0 - 1.0;
	vec4 c = texture2D( tex, vUv );
	
	gl_FragColor = c;
}