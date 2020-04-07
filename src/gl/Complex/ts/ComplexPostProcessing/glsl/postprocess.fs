uniform sampler2D backbuffer;
uniform vec2 resolution;
varying vec2 vUv;

uniform float time;

$random

void main(){

	float r, g, b;

	vec2 u = vUv * 2.0 - 1.0;
    float w = max(.0,length(u)) * 0.01;
    vec2 vig = u * w;
	
	for( float i = 0.0;  i < 5.0; i += 1.0 ) {
        vig *= 1.0 + float(i) * 0.03;
        r += texture2D(backbuffer,vUv - vig * 1.0 + vec2( 0.001 * i, 0.0 ) ).x;
        g += texture2D(backbuffer,vUv - vig * 1.4 ).y;
        b += texture2D(backbuffer,vUv - vig * 1.2).z;

	}

	vec3 c = vec3( r, g, b ) / 5.0;

	c += ( random( vUv + sin( time ) ) * 2.0 - 1.0 ) * 0.1;

	gl_FragColor = vec4( c, 1.0 );
	
}