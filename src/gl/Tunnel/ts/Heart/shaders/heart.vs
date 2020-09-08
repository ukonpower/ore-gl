attribute float n;
attribute float group;

uniform float allNum;
uniform float time;

uniform mat4 rotation;
uniform vec2 rotVec;

uniform sampler2D dataTex;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec4 vColor;

$rotate
$constants
$noise3D
$quaternion2mat4

void main() {

	float percentage = n / allNum;

	vec4 data = texture2D( dataTex, vec2( percentage, 0.0 ));

	vec3 pos = position;

	float x = (pos.x + 0.05) * 10.0;

	vec4 c = vec4(1.0);
	// c.x += ( 1.0 + 10.0 * smoothstep( 0.005, 0.049, abs(percentage)) );
	// c.y += ( 1.0 + 10.0 * smoothstep( 0.03, 0.05, abs(percentage)) );
	// c.z += ( 1.0 + 10.0 * smoothstep( 0.0, 0.05, abs(percentage)) );
	c.x += data.x * 4.0;
	c.y += data.y * 4.0 * data.w;
	c.z += data.z * 4.0;

	c += smoothstep( 0.04, 0.05, abs(pos.x)) * 2.0;
	c.w = 1.0;

	pos.yz *= smoothstep( 0.0, 1.0, abs( pos.x ) * 10.0 ) * (percentage + 0.1);

	pos.y +=  percentage * 1.0 + data.x;// + length( rotVec ) * 3.0 ;

	// pos.x *= 1.0 + snoise( vec3( percentage * 1000.0 )) * length( rotVec ) * 10.0;
	// pos.y += snoise( vec3( percentage * 1000.0 )) * length( rotVec ) * 10.0;

	pos.xy *= rotate( percentage * TPI + (pos.x * 10.0 * (sin( time + percentage * TPI ) + 1.0 ) * PI ) + time + group * PI );
	pos.xz *= rotate( percentage * TPI + group * PI / 2.0);
	// pos.xz *= rotate( pos.x );

	pos.xz *= rotate( time * 0.5);

	pos = (qua2mat(data) * vec4(pos,1.0)).xyz;
	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	
	vViewPosition = -mvPosition.xyz;
	vNormal = normal;

	vColor = c;

}