attribute vec3 offsetPos;
attribute float num;
uniform mat4 rotation;
uniform float time;
varying vec3 vViewPosition;
varying vec3 vColor;

mat2 rotate(float rad) {
  return mat2(cos(rad), sin(rad), -sin(rad), cos(rad));
}

float random(vec2 p){
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

    vec3 pos = position;

    float sizeRnd = random( vec2( num ) );
    float rotRnd = random( vec2( num + 10.0 ) );

    pos.yz *= cos( offsetPos.y + time * 1.0 + sizeRnd * 3.0 ) * 0.4;
    pos.x *=  6.0 * sin( offsetPos.y + time * 1.0 + sizeRnd * 4.0 );

    //position.xを足すことでしなやかさを作る
    pos.xz *= rotate( sin( offsetPos.y + time * 2.0 + rotRnd * 0.5 + ( position.x + 0.5 ) * 5.0 ) * 3.0 );
    pos.yz *= rotate( sin( offsetPos.y + time * 2.0 + rotRnd * 1.0 ) * 3.0 + ( position.x + 0.5 ) * 5.0 );

    pos = vec4( rotation * vec4( pos + offsetPos * 1.5, 1.0 ) ).xyz;

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;

    vColor = vec3( 1.0 );

}