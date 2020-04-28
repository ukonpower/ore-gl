#define STANDARD
#ifdef PHYSICAL
	#define REFLECTIVITY
	#define CLEARCOAT
	#define TRANSPARENCY
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
float roughness;
float metalness = 0.2;
uniform float opacity;
uniform sampler2D roughnessTex;
uniform sampler2D normalTex;
uniform sampler2D reflectionTex;
uniform vec2 winResolution;
varying vec4 mvpPos;
varying vec3 vPosition;

varying vec2 vUv;
#ifdef TRANSPARENCY
	uniform float transparency;
#endif
#ifdef REFLECTIVITY
	uniform float reflectivity;
#endif
#ifdef CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheen;
#endif
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <lights_physical_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

$rotate

uniform float time;

void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( vec3( 1.0 ), opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	roughness = texture2D( roughnessTex, vUv * 40.0 ).x * 0.3;
	
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	
	#include <normal_fragment_begin>

	normal.xy *= rotate( roughness * 0.2 );
	normal.zy *= rotate( roughness * 0.2 );
	
	#include <normal_fragment_maps>
	
	
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	vec2 refUV = gl_FragCoord.xy / winResolution.xy;
	refUV.y = 1.0 - refUV.y;

	vec3 ref = texture2D( reflectionTex, refUV ).xyz;

	outgoingLight = outgoingLight * 0.7 + ref * 0.2;

	#ifdef TRANSPARENCY
		diffuseColor.a *= saturate( 1. - transparency + linearToRelativeLuminance( reflectedLight.directSpecular + reflectedLight.indirectSpecular ) );
	#endif

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

}