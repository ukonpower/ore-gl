precision highp float;
uniform vec2 resolution;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 c = vec3(uv - 0.5,0.0);
    // vec3 c = vec3((gl_FragCoord.x * gl_FragCoord.y + gl_FragCoord.x) * 0.0001 - 4.0,0.0 ,0.0);
    gl_FragColor = vec4(c,1.0);
}