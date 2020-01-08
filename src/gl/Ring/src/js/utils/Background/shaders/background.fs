uniform float time;
varying vec2 u;

$noise3D

void main(){
    vec3 c = vec3(0.2,0.2,0.2);
    vec2 uv = u * 2.0 - 1.0;
    c -= length(uv) * 0.1;
    gl_FragColor = vec4(c,1.0);
}