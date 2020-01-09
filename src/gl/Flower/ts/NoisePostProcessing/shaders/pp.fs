uniform sampler2D backbuffer;
varying vec2 vUv;

uniform float time;
uniform float nw;

#define N 16


$random
$noise3D

void main(void){
	vec3 c = vec3(0.0);
    vec2 u = vUv * 2.0 - 1.0;
    vec2 uv = vUv;
    
    if(nw > 0.01){
        // uv.x += sin(uv.y * 500.0) * nw;
        uv.x += step(0.5,snoise(vec3(uv.y * 2.0,uv.y * 2.0,time * 10.0))) * 0.1;
        uv.x += sin(uv.y * 9999.0) * snoise(vec3(uv.y * 1.0,uv.y * 1.0,time * 1.0)) * 0.4 * nw;
        uv.x += sin(uv.y * 9999.0) * 0.02 * nw;

        c += step(0.5,snoise(vec3(uv.y * 2.0 + 100.,uv.y * 2.0,time * 10.0)));
    }

    float w = max(.0,length(u)) * 0.03;
    vec2 vig = u * w;
    for(int i = 0; i < N; i++){
        vig *= 1.0 + float(i) * 0.01;
        c.x += texture2D(backbuffer,uv - vig).x;
        c.y += texture2D(backbuffer,uv - vig * 0.5).y;
        c.z += texture2D(backbuffer,uv - vig * 1.0).z;
    }
    c /= float(N) - 3.0;

	c += random(uv + random(vec2(time))) * (0.02 + 0.3 * nw);
	gl_FragColor = vec4(c,1.0);
}