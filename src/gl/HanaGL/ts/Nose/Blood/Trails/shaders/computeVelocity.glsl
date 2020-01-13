uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform vec2 resolution;
uniform float time;
uniform float seed;

$noise4D

#define NOISE_SCALE 3.0
#define TIME_SCALE 2.0

vec3 snoise3D( vec3 p ){
	return vec3(
      snoise( vec4( NOISE_SCALE * p, 7.225 * seed + TIME_SCALE * time ) ),
      snoise( vec4( NOISE_SCALE * p, 3.553 * seed + TIME_SCALE * time ) ),
      snoise( vec4( NOISE_SCALE * p, 1.259 * seed + TIME_SCALE * time ) )
    ) * 0.6;
}

void main() {
  if(gl_FragCoord.x >= 1.0) return;    

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 posData = texture2D( texturePosition, uv );
  vec3 pos = posData.xyz;
  float time = posData.w;

  vec4 velData = texture2D( textureVelocity, uv );
  vec3 vel = velData.xyz;
  float lifeTime = velData.w;

  float idParticle = uv.y * resolution.x + uv.x;

  if( time > 0.0 ){

    float scale = 0.08;
    vel += snoise3D( pos * 0.1 );
    vel.y += 0.6;
    vel *= 0.94;

  }else{

    lifeTime = 1.0 + snoise( vec4( uv.xyy * 100.0, time ) ) * 3.0;
    vel = vec3( pos.x * 20., -20.0, 0.0 );

  }
  

  gl_FragColor = vec4( vel.xyz, lifeTime );
}