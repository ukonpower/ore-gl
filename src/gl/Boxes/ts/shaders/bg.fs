varying vec2 vUv;
uniform float time;

void main(void){
	vec3 c = vec3(vUv,1.0);
	gl_FragColor = vec4(c,1.0);
}