precision highp float;

uniform sampler2D preFrameTex;

uniform float time;
uniform vec2 resolution;

vec2 loop(vec2 p,float x){
    p = mod(p,x);
    p *= 1.0 / x;
    return p;
}
void main(){
    float t = time * 8.0;
    vec2 origUV = gl_FragCoord.xy / resolution;
    vec2 loopUV = loop(origUV,0.5);

    vec2 uv = loopUV * 2.0 - 1.0;
    vec3 c = vec3(0.0);
    
    // if(sin(time * 10.0) < 0.0){
        c.x += texture2D(preFrameTex,loopUV - uv * 0.01 + vec2(0.01,0.0)).x * 0.9;
        c.yz += texture2D(preFrameTex,loopUV - uv * 0.01 + vec2(0.0,0.0)).yz * 0.9;
    // }

    float r = 0.4;
    vec2 pos = vec2(sin(t) * r,cos(t) * r);
    float indens = step(0.5,max(0.0,(1.0 - length(uv + pos) * 1.7)));
    c += indens ; //* vec3(sin(origUV.x * 10.0+ t * 0.5),cos(t),tan(t));

    gl_FragColor = vec4(c,1.0);
}