precision highp float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D preFrameTexture; 

#define PI 3.1415926535

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

vec3 fold(vec3 p){
    for(int i = 0; i < 20; i++){
        p.xy = abs(p.xy);
        p -= vec3(0.2,0.2,0.07); 

        p.xy *= rotate(float(i) * 0.03 + 187.2 * 0.5 + .0);
        p.zx *= rotate(float(i) * 0.1 + 182.4 * 0.75);
    }
    return p;
}

float distance(vec3 p){
    float d;
    // p.xz *= rotate(time);
    p = fold(p);
    d = sdSphere(p,0.1);
    return d;
}

vec3 getNormal(vec3 p){
    float delta = 0.001;
	vec3 dx = vec3(delta,0.0,0.0);
	vec3 dy = vec3(0.0,delta,0.0);
	vec3 dz = vec3(0.0,0.0,delta);
    vec3 result;
    result.x = distance(p + dx) - distance(p - dx);
    result.y = distance(p + dy) - distance(p - dy);
    result.z = distance(p + dz) - distance(p - dz);
    
    return normalize(result);
}

void main(void)
{
    const float angle = 60.0;
    const float fov = angle * 0.5 * PI / 180.0;
    vec3 cPos = vec3(0.0,0.0,10.0);

    vec2 uv = (gl_FragCoord.xy * 2.0  - resolution ) / min(resolution.x,resolution.y);
	vec3 ray = normalize(vec3(sin(fov) * uv.x,sin(fov) * uv.y,-1.0));

    float rDistance = 0.0;
    float rLen = 0.0;
    vec3 p = cPos;
    vec3 c = vec3(0.0);
    
    for(int i = 0; i < 32; i++){
    	rDistance = distance(p);
        rLen += rDistance;
        p = cPos + ray * rLen;
    }

    if(abs(rDistance) <= 0.01){
        vec3 normal = getNormal(p);
        float diff = clamp(dot(vec3(0.5,0.5,0.5), normal), 0.1, 1.0);
        c = vec3(normal.z,normal.x,normal.z);
    }else{
        c = vec3(0.0,0.0,0.0);
    }
    
    gl_FragColor = vec4(c,1.0);
}