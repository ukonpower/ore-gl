varying vec3 vColor;
uniform float time;
uniform sampler2D texturePosition;

float PI = 3.141592653589793;

highp mat2 rotate(float rad){
    return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
}

void main() {
    vec3 p = position;
    vec4 t = texture2D( texturePosition, uv );
    vec3 pos = t.xyz;
    float len = length(pos);
    p.xz *= rotate(pos.x * uv.x);
    p *= abs(sin(len * 1.0)) + smoothstep(2.0,9.0,len) * 10.0;

    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vColor = vec3(1.0);
}