
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
uniform sampler2D texturePosition;
uniform float uvDiff;
uniform float lineWidth;

float PI = 3.141592653589793;

highp float atan2(in float y, in float x)
{
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

highp mat2 rotate(float rad){
    return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
}

void main() {
    vec2 nUV = uv + vec2(uvDiff,0.0);
    if(nUV.x >= 1.0){
        nUV = uv - vec2(uvDiff,0.0);
    }
    vec3 p = position;
    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 nPos = texture2D( texturePosition, nUV).xyz;

    vec3 vec = normalize(nPos - pos);
    float rotX = atan2(vec.y,vec.z);
    
    p.xy *= lineWidth * (abs(sin(uv.y * 2.0)) + 0.1);
    p.yz *= rotate(rotX);

    vec4 mvPosition = modelViewMatrix * vec4(p + pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;

    vec4 worldPosition = modelMatrix * vec4(p + pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    vViewPosition = -mvPosition.xyz; 
}


