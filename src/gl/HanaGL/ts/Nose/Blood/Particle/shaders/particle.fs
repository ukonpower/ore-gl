varying vec4 vColor;

void main( void ){
	// vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
	// float w = smoothstep( 1.0, .9, (length(uv)));
	// gl_FragColor = vColor * vec4(1.0,1.0,1.0, w );
	gl_FragColor = vColor;
}