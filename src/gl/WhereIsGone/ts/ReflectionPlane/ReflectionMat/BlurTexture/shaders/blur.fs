varying vec2 vUv;

uniform sampler2D backbuffer;
uniform vec2 texResolution;

uniform float blurWeight;
uniform bool direction;
uniform float gaussVar;



vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
	
	vec4 color = vec4(0.0);
	vec2 off1 = vec2(1.3846153846) * direction;
	vec2 off2 = vec2(3.2307692308) * direction;

	float alpha = 0.0;

	vec4 t0 = texture2D(image, uv);
	float a0 = 1.0 - t0.w;
	float o0 = 0.2270270270;
	
	vec4 t1 = texture2D(image, uv + (off1 / resolution));
	float a1 = 1.0 - t1.w;
	float o1 = 0.3162162162;
	
	vec4 t2 = texture2D(image, uv - (off1 / resolution));
	float a2 = 1.0 - t2.w;
	float o2 = 0.3162162162;
	
	vec4 t3 = texture2D(image, uv + (off2 / resolution));
	float a3 = 1.0 - t3.w;
	float o3 = 0.0702702703;
	
	vec4 t4 = texture2D(image, uv - (off2 / resolution));
	float a4 = 1.0 - t4.w;
	float o4 = 0.0702702703;

	float w0 = o0 * t0.w + (o1 * a1) / 4.0 + (o2 * a2) / 4.0 + (o3 * a3) / 4.0 + (o4 * a4) / 4.0;
	float w1 = o1 * t1.w + (o0 * a0) / 4.0 + (o2 * a2) / 4.0 + (o3 * a3) / 4.0 + (o4 * a4) / 4.0;
	float w2 = o2 * t2.w + (o0 * a0) / 4.0 + (o1 * a1) / 4.0 + (o3 * a3) / 4.0 + (o4 * a4) / 4.0;
	float w3 = o3 * t3.w + (o0 * a0) / 4.0 + (o1 * a1) / 4.0 + (o2 * a2) / 4.0 + (o4 * a4) / 4.0;
	float w4 = o4 * t4.w + (o0 * a0) / 4.0 + (o1 * a1) / 4.0 + (o2 * a2) / 4.0 + (o3 * a3) / 4.0;
	
	color.xyz = 
		t0.xyz * w0 +
		t1.xyz * w1 +
		t2.xyz * w2 +
		t3.xyz * w3 +
		t4.xyz * w4 ;

	color.w = 
		( t0.w ) * o0 +
		( t1.w ) * o1 +
		( t2.w ) * o2 +
		( t3.w ) * o3 +
		( t4.w ) * o4;

	return color;
}

void main(){

	vec4 c = blur9( backbuffer, vUv, texResolution, vec2( 0.0, 0.3 ) );

	gl_FragColor = vec4( c );
	
}	