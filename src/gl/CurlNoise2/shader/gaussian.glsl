precision highp float;
#define GSAMPLE 20
#define PI 3.1415926535
uniform sampler2D texture;
uniform vec2 resolution;
uniform float pow;
uniform bool isW;

float gaussian( float _x, float _v ) {
    return 1.0 / sqrt( 2.0 * PI * _v ) * exp( - _x * _x / 2.0 / _v );
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec3 c = texture2D(texture,uv).xyz;
  vec3 sum = vec3(0.0);

  vec2 v = (isW ? vec2(1.0,0.0) : vec2(0.0,1.0)) / resolution;

  for(int i = -GSAMPLE; i <= GSAMPLE; i++ ){
    vec3 p = texture2D(texture,uv + v * float(i)).xyz;
    float mul = gaussian(float(i),50.0 * pow);
    sum += p * mul;
  }

  gl_FragColor = vec4(sum,1.0);
}