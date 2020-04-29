varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D depthTexture;

uniform float near;
uniform float far;
uniform float focus;
uniform float range;

#include <packing>

float perspectiveDepthToViewZ( const in float invClipZ ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

float getDepth( vec2 uv ) {
	return unpackRGBAToDepth( texture2D( depthTexture, uv ) );
}

void main(){

	vec4 scene = texture2D( sceneTex, vUv );
	vec4 b = texture2D( backbuffer, vUv );
	
	float depth = perspectiveDepthToViewZ( getDepth( vUv ) );
	
	float blur = smoothstep( 0.0, range, abs( depth + focus ) );
	vec4 c = mix( scene, b, clamp( blur, 0.0, 1.0 ) );
	
	gl_FragColor = vec4( c.xyz, 1.0 );
	// gl_FragColor = vec4( vec3( b.w ), 1.0 );

	
}