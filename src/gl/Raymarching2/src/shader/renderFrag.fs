precision highp float;

uniform sampler2D texture;
uniform vec2 resolution;


void main(){
    vec2 uv = gl_FragCoord.xy / resolution;
    vec2 uvs = uv * 2.0 - 1.0;
    float w = max(.0,length(uvs)) * 0.01;

    vec3 c;
    vec2 vig = uvs * w;
    c.x = texture2D(texture,uv + vig).x;
    c.y = texture2D(texture,uv + vig * 0.2).y;
    c.z = texture2D(texture,uv).z;

    gl_FragColor = vec4(c,1.0);
}