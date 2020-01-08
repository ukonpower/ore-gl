#include <common>
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform sampler2D textureTime;
uniform float cameraConstant;
uniform float density;
uniform vec3 color;
varying vec4 vColor;
varying vec2 vUv;
uniform float radius;

void main() {
    vec4 posTemp = texture2D( texturePosition, uv );
    vec3 pos = posTemp.xyz;
    
    vec4 velTmp = texture2D( textureVelocity, uv );
    vec3 vel = velTmp.xyz;

    vec4 timeTmp = texture2D( textureTime, uv );
    vec3 time = timeTmp.xyz;
    vColor = vec4(color,1.0);

    vec4 mvPosition = modelViewMatrix * vec4( pos + position, 1.0 );
    gl_PointSize = 2.0;

    // uv情報の引き渡し
    vUv = uv;

    // 変換して格納
    gl_Position = projectionMatrix * mvPosition;
}