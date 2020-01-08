precision highp float;

attribute float index;
uniform float num;
uniform sampler2D posTexture;
uniform mat4 mvp;
uniform float time;

varying vec3 vColor;

void main(){
    vec2 texPos = vec2(mod(index,num),index / num) / vec2(num);
    vec3 pos = texture2D(posTexture,texPos).xyz;
    gl_Position = mvp * vec4(pos * 1.0,1.0);
    gl_PointSize = 2.0;

    vColor = vec3(1.0);
}
