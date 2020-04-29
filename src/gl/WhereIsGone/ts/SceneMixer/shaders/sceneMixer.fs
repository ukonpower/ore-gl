varying vec2 vUv;
uniform sampler2D sceneTex1;
uniform sampler2D sceneTex2;
uniform bool order;

void main( void ) {

	vec4 scene1 = texture2D( sceneTex1, vUv );
	vec4 scene2 = texture2D( sceneTex2, vUv );

	// scene1.yz *= 0.2;
	// scene2.xz *= 0.2;

	vec4 c = mix( scene2, scene1, order ? 1.0 - scene2.w : scene1.w );
	// c += scene1 * ( 1.0 - scene2.a);
	// c += scene2 * ( 1.0 - scene1.a);

	gl_FragColor = c;

}