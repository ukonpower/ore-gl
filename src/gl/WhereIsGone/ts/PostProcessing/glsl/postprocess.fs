uniform sampler2D backbuffer;
uniform vec2 resolution;
varying vec2 vUv;

uniform sampler2D depthTexture;
uniform float time;

$random

void main(){

	float r, g, b;

	vec2 u = vUv * 2.0 - 1.0;
    float w = max( .0 ,length(u) ) * 0.02;
    vec2 vig = u * w * 0.0;

	vec3 c =  texture2D(backbuffer,vUv ).xyz;

	c *= 1.0 - smoothstep( 0.5, 1.0, length( u ) ) * 0.2;
	// c += ( random( vUv + sin( time ) ) * 2.0 - 1.0 ) * 0.04;


	float depth = texture2D( depthTexture, vUv ).x;
	depth -= 0.95;
	depth = smoothstep( 0.03, 0.05, depth );

	c = mix( c, vec3( 0.0 ), depth );

	gl_FragColor = vec4( c, 1.0 );
	
}