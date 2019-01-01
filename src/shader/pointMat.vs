attribute float size;
attribute vec2 texUv;
attribute float imgIndex;

uniform float time;
uniform vec2 mouse;
uniform float pCount;
uniform float posSwitch;
uniform float aspect;

varying vec2 vTexUv;
varying float vSwitch;

#define PI 3.1415926535

void main() {
  // float sizeWeight = sin(position.x / 10.0 + time * 0.5);
  vec3 bakuPos = position;
  // bakuPos += normal * exp(-(time - 10.0) * 0.4) * abs(sin(position.z )) * 100.0;

  vec3 tilePos;
  // float height = 80.0; 
  // float offset = height / 2.0 + 3.0;

  float r = 10.0;
  float row = 55.0;
  float heightWeight = 1.15;
  // tilePos.x = floor(imgIndex / height) + mod(imgIndex,2.0) * 0.5 - offset;
  // tilePos.y = mod(imgIndex,height) - (height - 1.0) / 2.0;
  // tilePos.y += sin(length(tilePos) + time) * 0.01;

  tilePos.x = sin(2.0 * PI * imgIndex / row + time * 0.003) * r;
  tilePos.z = cos(2.0 * PI * imgIndex / row+ time * 0.003) * r;
  tilePos.y = floor(imgIndex / row + 0.001) * heightWeight  - (pCount / row) * heightWeight  / 2.0;

  vec3 pos = bakuPos * posSwitch + tilePos * (1.0 - posSwitch);

  vec2 m = mouse * 20.0;

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  vec4 mvpPosition = projectionMatrix * mvPosition;
  gl_Position = mvpPosition;

  gl_PointSize = size * ( 30.0 / -mvPosition.z ) * ( 5.0 * (1.0 - posSwitch) + 2.0 * posSwitch );

  vTexUv = texUv;
  vSwitch = posSwitch;
}