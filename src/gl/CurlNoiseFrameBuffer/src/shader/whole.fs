precision highp float;

uniform sampler2D tex1;
uniform sampler2D tex2;

uniform float time;
uniform vec2 resolution;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 uv2 = uv * 2.0 - 1.0;
    uv2 = uv + uv2 * 0.01;
    vec3 c = texture2D(tex2,uv2).xyz * 1.0;
    c += texture2D(tex1,uv).xyz;
    gl_FragColor = vec4(c,1.0);
}