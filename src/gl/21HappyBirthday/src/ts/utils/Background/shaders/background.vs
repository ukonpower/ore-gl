varying vec2 u;
uniform float aspect;

void main() {
    vec3 pos = position;
    pos.z = 1.0;
    gl_Position = vec4(pos,1.0);
    u = uv * vec2(aspect,1.0);
}


