varying vec2 vUv;
uniform float time;

void main(void){
	vec2 cuv = vUv * 2.0 - 1.0;
	vec3 c = vec3(0.15,0.15,0.25);
	c *= 1.0 - length(cuv) * 0.7;
	
	gl_FragColor = vec4(c,1.0);
}