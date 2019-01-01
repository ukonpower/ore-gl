precision lowp float;

uniform vec3 color;
uniform sampler2D texture;

varying vec2 vTexUv;

void main() {
  vec2 uv = gl_PointCoord;
  
  uv += vTexUv;
  uv /= 8.0;

  uv.y = 1.0 - uv.y; 
  gl_FragColor = texture2D( texture, uv );
  // gl_FragColor = vec4(uv ,1.0,1.0);
}