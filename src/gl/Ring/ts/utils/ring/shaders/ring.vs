attribute float num;
varying vec3 vViewPosition;
varying vec3 vColor;
varying vec3 vNormal;
uniform float time;
uniform float res;

$constants
$noise2D
$rotate
$atan2

void main() {
  vec3 vp = position;
  vec3 op;
  float r = 2.0;
  float n = 2.0;
  float rad = num / res * TPI * 3.0;
  float g = floor(rad / TPI);

  //position
  r *= 1.5;
  op.x = sin(rad) * r;
  op.z = cos(rad) * r;
  
  //scale
  vp *= abs(sin((rad * 4.0)) * 1.0);
  vp.y *= 1.2;

  //rotate
  float rz = snoise(vec2(num * 0.06,time * 0.5)) * 10.0;
  vp.yz *= rotate(HPI);
  vp.xy *= rotate(rz);
  vp.xz *= rotate((rad - HPI));

  //world position
  vec3 wp = op + vp;

  //world roatate
  wp.yz *= rotate(g * HPI);
  wp.xy *= rotate(max(0.0, g - 1.0) * HPI);

  vec4 mvPosition = modelViewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vViewPosition = -mvPosition.xyz;

  vec3 c = vec3(0.0);
  c.x += rz * 0.1;
  c.y += 1.0 -rz * 0.1;
  c.z += 2.0;
  c -= vp.y;
  vColor = c;


  vNormal = normal;
}