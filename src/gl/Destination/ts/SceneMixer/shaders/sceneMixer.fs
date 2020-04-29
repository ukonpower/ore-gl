varying vec2 vUv;
uniform sampler2D sceneTex1;
uniform sampler2D sceneTex2;

uniform float near;
uniform float far;

uniform sampler2D depthTex1;
uniform sampler2D depthTex2;

uniform bool order;

#include <packing>

float perspectiveDepthToViewZ( const in float invClipZ ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

float getDepth( vec2 uv, sampler2D depthTexture ) {
	return perspectiveDepthToViewZ( unpackRGBAToDepth( texture2D( depthTexture, uv ) ) );
}


void main( void ) {

	vec4 scene1 = texture2D( sceneTex1, vUv );
	
	float depthValue = getDepth( vUv, depthTex1 );
	depthValue = smoothstep( 6.0, 0.0, depthValue + 8.0);
	scene1.xyz = mix( scene1.xyz, vec3( 0.1, 0.1, 0.1 ), depthValue );

	vec4 scene2 = texture2D( sceneTex2, vUv );

	depthValue = getDepth( vUv, depthTex2 );
	depthValue = smoothstep( 6.0, 0.0, depthValue + 8.0);
	scene2.xyz = mix( scene2.xyz, vec3( 0.1, 0.1, 0.1 ), depthValue );
	
	// scene1.yz *= 0.2;
	// scene2.xz *= 0.2;

	vec4 c = mix( scene2, scene1, order ? 1.0 - scene2.w : scene1.w );
	// c += scene1 * ( 1.0 - scene2.a);
	// c += scene2 * ( 1.0 - scene1.a);
	// c *= 1.5;
	c.w = 1.0;
	gl_FragColor = c;
	// gl_FragColor = vec4( vec3( depth2 ), 1.0 );

}