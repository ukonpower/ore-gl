uniform sampler2D backbuffer;
varying vec2 vUv;

uniform float time;
uniform float nw;
uniform float splash;
#define N 16

$random
$noise3D

void main(void){
	vec3 c = vec3(0.0);
	vec2 u = vUv * 2.0 - 1.0;
	vec2 uv = vUv;

	float w = max(.0,length(u)) * 0.04;
	
	vec2 vig = u * w;

	float rad = atan( u.y, u.x );
	vec2 dir = vec2( cos(rad), sin(rad)) * 0.02 * length( u );

	float rnd = random(uv + random(vec2(time)));

	float noise = 0.0;

	if(nw > 0.1){
	// if(true){
		// uv.x += sin(uv.y * 500.0) * nw;
		vec2 n = vec2( random( vec2( time ) ) - 0.5, random( vec2( time + 20.0 ) ) - 0.5 );
		uv += n * 0.01;

		noise = step(0.5,snoise(vec3(uv.y * 2.0,uv.y * 2.0,time * 10.0))) * 0.1;

		uv.x += noise * 0.2;

		c += step(0.5,snoise(vec3(uv.y * 2.0 + 100.,uv.y * 2.0,time * 10.0)));
		
	}

	for(int i = 0; i < N; i++){

		vec2 v = vig *( 1.0 + float(i) * (0.01 + splash * 0.02 ));

		c.x += texture2D(backbuffer, uv - ( v + dir * ( 1.0 ) ) + vec2( noise * 0.01, 0.0 ) ).x;
		c.y += texture2D(backbuffer, uv - ( v + dir * ( 1.3 ) ) ).y;
		c.z += texture2D(backbuffer, uv - ( v + dir * ( 1.6 ) ) ).z;
		
	}
	c /= float(N) - 1.0;

	c += rnd * 0.1;
	gl_FragColor = vec4(c,1.0);
}