precision highp float;

uniform vec2 resolution;
uniform float time;
uniform vec3 camera;
uniform bool visible;
varying vec2 vUv;

#define PI 3.1415926535

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

float snoise(float x){
    return snoise(vec3(0.0,0.0,x));
}
vec3 snoise3D(vec3 p){
    return vec3(
        snoise(p + vec3(76.2,35.2,55.2)),
        snoise(p + vec3(52.2,453.3,674.2)),
        snoise(p + vec3(234.2,47.2,85.2))
    );
    
}

/*---------------------
    distance func
----------------------*/

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return length(max(d,0.0)) + min(max(d.x,max(d.y,d.z)),0.0); 
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdCone( vec3 p, vec2 c )
{
    // c must be normalized
    float q = length(p.xy);
    return dot(c,vec2(q,p.z));
}

mat2 rotate(float rad){
    return mat2(cos(rad),sin(rad),-sin(rad),cos(rad));
}

vec3 loop(vec3 p,float s){
    p = mod(p,s) - s / 2.0;
    return p;
}

vec3 fold(vec3 p){
    p.xy *= rotate(exp(-mod(time * 10.0,6.0)));
    p.xz *= rotate(exp(-mod(time * 10.0,8.0)));
    for(int i = 0; i < 3; i++){
        p.zy = abs(p.zy);
        p.xy *= rotate(time * 0.23);
        p.xz = abs(p.xz);
        p.xz *= rotate(time * 0.3);
    }
    return p;
}

float distance(vec3 p){
    float d;
    p = loop(p,8.0);
    p = fold(p);
    d = sdBox(p - vec3(0.0,0.0,0.0),vec3(1.0,1.0,1.0) * 1.2);

    return d;
}

vec3 getNormal(vec3 p,float d){
    vec3 dx = vec3(d,0.0,0.0);
    vec3 dy = vec3(0.0,d,0.0);
    vec3 dz = vec3(0.0,0.0,d);
    vec3 result;
    result.x = distance(p + dx) - distance(p - dx);
    result.y = distance(p + dy) - distance(p - dy);
    result.z = distance(p + dz) - distance(p - dz);
    return normalize(result);
}

void main(void)
{
    if(!visible){
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
        return;
    }

    const float angle = 60.0;
    const float fov = angle * 0.5 * PI / 180.0;
    vec3 cPos = vec3(0.0,0.0,-time * 10.0);

    vec2 uv = ((gl_FragCoord.xy * 2.0) - resolution) / min(resolution.x,resolution.y);
    vec3 ray = normalize(vec3(sin(fov) * uv.x,sin(fov) * uv.y,-1.0));
    ray.xz *= rotate(snoise(time * 0.6 + 303.0) * 0.1);
    ray.yz *= rotate(snoise(time * 0.6 + 394.0) * 0.1);
    ray.xy *= rotate(snoise(time * 0.6 + 990.9) * 0.1);

    float rDistance = 0.0;
    float rLen = 0.0;
    vec3 p = cPos;
    vec3 c = vec3(0.0);
    float light = 0.0;

    for(int i = 0; i < 32; i++){
        rDistance = distance(p);
        rLen += rDistance;
        light += max(0.0,1.0 - rDistance) * .03;
        p = cPos + ray * rLen;
    }

    if(abs(rDistance) <= 0.01){
        vec3 normal = getNormal(p,0.001);
        float diff = clamp(dot(vec3(0.5,0.5,0.5), normal), 0.1, 1.0);
        
        vec3 edge = vec3(length(normal - getNormal(p, 0.09)) * max(0.0,sin(rLen + time * 10.0)) * 10.0);
        edge.y += sin(rLen) * 0.7;
        
        c = vec3(edge + diff * (1.0 - max(0.0,(rLen * 0.03))));
    }else{
        float wrp = sin(length(uv.yx) - time);
        wrp = smoothstep(0.5,1.0,wrp);
        c += wrp;
    }

    
    gl_FragColor = vec4(c,1.0);
    // gl_FragColor = vec4(gl_FragCoord.xy / resolution,0.0,1.0);
}