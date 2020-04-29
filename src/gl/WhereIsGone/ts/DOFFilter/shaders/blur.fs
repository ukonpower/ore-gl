
varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D depthTexture;
uniform sampler2D sceneTex;
uniform bool direction;

uniform float bokeh;
uniform float focus;
uniform float range;

uniform float near;
uniform float far;

$guassBlur9

#include <packing>

float perspectiveDepthToViewZ( const in float invClipZ ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

float getDepth( vec2 uv ) {
	return unpackRGBAToDepth( texture2D( depthTexture, uv ) );
}

void main(){

	float depth = perspectiveDepthToViewZ( getDepth( vUv ) );
	
	
	float blur = smoothstep( 0.0, range, abs( depth + focus ) ) * 0.3 * texture2D( sceneTex, vUv ).w;

	// blur = 0.1;

	vec4 c = blur9( backbuffer, vUv, resolution, direction ? vec2( bokeh, 0.0 ) * blur : vec2( 0.0, bokeh) * blur );
	
	gl_FragColor = vec4( c );

}