precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;


void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 c = texture2D(texture,uv).xyz;

    gl_FragColor = vec4(c,1.0);
}