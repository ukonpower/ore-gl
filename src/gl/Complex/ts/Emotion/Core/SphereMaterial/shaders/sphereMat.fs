
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform float roughness;
uniform float metalness;

struct Geometry {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
};

struct Material {
	float specularRoughness;
	vec3 diffuseColor;
	vec3 specularColor;
};

struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};

struct IncidentLight {
	vec3 position;
	vec3 direction;
	vec3 color;
	bool visible;
};

$constants
#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

#ifdef USE_ENVMAP

	uniform samplerCube envMap;
	uniform int maxMipLevel;
	uniform float envMapIntensity;
	uniform float flipEnvMap;

#endif

//法線分布関数
float GGX( float nh, float a ) { 

	a = max( 0.005, a );

	float a2 = a * a;
	float nh2 = nh * nh;
	float d = nh2 * ( a2 - 1.0 ) + 1.0;

	return a2 / ( PI * d * d );
	
}

//幾何減衰項
float SmithSchlickGGX( float NV, float NL, float a ) {

	float k = ( a ) / 2.0;

	float v = NV / ( NV * ( 1.0 - k ) + k + 0.0001 );
	float l = NL / ( NL * ( 1.0 - k ) + k + 0.0001 );

	return v * l;

}

//フレネル
vec3 Schlick( vec3 f0, float HV ) {

	return f0 + ( 1.0 - f0 ) * pow( 1.0 - HV, 5.0 );
	
}

vec3 Schlick( vec3 f0, float NV, float roughness ) {
	
	float fresnel = exp2( ( -5.55473 * NV - 6.98316 ) * NV );

	vec3 Fr = max( vec3( 1.0 - roughness ), f0 ) - f0;
	
	return Fr * fresnel + f0;

}

vec3 specularBRDF( Geometry geo, Material mat, IncidentLight light, float NV, float NL ) {
	
	float a = mat.specularRoughness * mat.specularRoughness;
	vec3 H = normalize( geo.viewDir + light.direction );
	
	float NH = saturate( dot( geo.normal, H ) );
	float LH = saturate( dot( light.direction, H ) );
	float VH = saturate( dot( geo.viewDir, H ) );

	float D = GGX( NH, a );
	float G = SmithSchlickGGX( NV, NL, a );
	vec3 F = Schlick( mat.specularColor, VH );

	return ( D * G * F ) / ( 4.0 * NL * NV + 0.0001 );
	
}

vec3 diffuseBRDF( Material mat ) {

	return mat.diffuseColor / PI;

}

void RE_Direct( Geometry geo, Material mat, IncidentLight light, inout ReflectedLight ref ) {

	float NV = saturate( dot( geo.normal, geo.viewDir ) );
	float NL = saturate( dot( geo.normal, light.direction ) );

	vec3 irradiance = NL * light.color;
	irradiance *= PI;

	ref.directSpecular += irradiance * specularBRDF( geo, mat, light, NV, NL );
	ref.directDiffuse += irradiance * diffuseBRDF( mat );

}

float punctualLightIntensityToIrradianceFactor( float lightDistance, float cutoffDistance, float decayExponent) {

	if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {

		return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		
	}
	
	return 1.0;
	
}

#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

	IncidentLight directionalLightToIncidentLight( DirectionalLight dirLight ) {

		IncidentLight light;

		light.color = dirLight.color;
		light.direction = dirLight.direction;
		light.visible = true;
		
		return light;

	}

#endif

#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

	IncidentLight pointLightToincidentLight( PointLight inputLight, Geometry geo ) {

		IncidentLight light;

		vec3 def = inputLight.position - geo.position;
		float distance = length( def );
		light.direction = normalize( def );

		light.color = inputLight.color;
		light.color *= punctualLightIntensityToIrradianceFactor( distance, inputLight.distance, inputLight.decay );
		light.visible = true;
		
		return light;
	
	}

#endif

uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

	vec3 irradiance = ambientLightColor;
	irradiance *= PI;
	
	return irradiance;
	
}

void RE_IndirectDiffuse( const in vec3 irradiance, const in Geometry geometry, const in Material mat, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * diffuseBRDF( mat );

}

vec2 integrateSpecularBRDF( const in float dotNV, const in float roughness ) {
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	return vec2( -1.04, 1.04 ) * a004 + r.zw;
}

void BRDF_Specular_Multiscattering_Environment( const in Geometry geo, const in vec3 specularColor, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
	float NV = saturate( dot( geo.normal, geo.viewDir ) );
	vec3 F = Schlick( specularColor, NV, roughness );
	vec2 brdf = integrateSpecularBRDF( NV, roughness );
	vec3 FssEss = F * brdf.x + brdf.y;
	float Ess = brdf.x + brdf.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = specularColor + ( 1.0 - specularColor ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}

void RE_IndirectSpecular( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in Geometry geo, const in Material mat, inout ReflectedLight ref) {

	float clearcoatDHR = 0.0;
	float clearcoatInv = 1.0 - clearcoatDHR;
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;

	BRDF_Specular_Multiscattering_Environment( geo, mat.specularColor, mat.specularRoughness, singleScattering, multiScattering );
	
	vec3 diffuse = mat.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );
	ref.indirectSpecular += clearcoatInv * radiance * singleScattering;
	ref.indirectSpecular += multiScattering * cosineWeightedIrradiance;
}

vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {

	float x = normal.x, y = normal.y, z = normal.z;
	
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );

	return result;

}

vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in Geometry geo ) {
	
	vec3 worldNormal = inverseTransformDirection( geo.normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );

	return irradiance;

}

#ifdef USE_ENVMAP

vec3 getLightProbeIndirectIrradiance( const in Geometry geo, const in int maxMIPLevel ) {

	vec3 worldNormal = inverseTransformDirection( geo.normal, viewMatrix );
	vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
	vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );
	envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
	
	return PI * envMapColor.rgb * 1.0;

}


float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {

	float maxMIPLevelScalar = float( maxMIPLevel );
	float sigma = PI * roughness * roughness / ( 1.0 + roughness );
	float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );
	return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );
	
}

vec3 getLightProbeIndirectRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {

	vec3 reflectVec = reflect( -viewDir, normal );
	reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
	reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

	float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );

	vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
	vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
	envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

	return envMapColor.rgb * envMapIntensity;
	
}


#endif

void main( void ) {

	vec3 albedo = vec3( 1.0 );

	Geometry geo;
	geo.position = -vViewPosition;
	geo.normal = normalize( vNormal );
	geo.viewDir = normalize( vViewPosition );

	Material mat;
	mat.diffuseColor = mix( albedo, vec3( 0.0 ), metalness );
	mat.specularColor = mix( vec3( 0.04 ), albedo, metalness );
	mat.specularRoughness = roughness;

	ReflectedLight ref;

	//directLight
	#if NUM_DIR_LIGHTS > 0

		for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

			DirectionalLight dirLight = directionalLights[ i ];
			IncidentLight light = directionalLightToIncidentLight( dirLight );
			RE_Direct( geo, mat, light, ref );

		}
	
	#endif

	#if NUM_POINT_LIGHTS > 0

		for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

			PointLight pointLight = pointLights[ i ];
			IncidentLight light = pointLightToincidentLight( pointLight, geo );
			RE_Direct( geo, mat, light, ref );

		}

	#endif

	//indirect light
	
	//emvMap diffuse
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geo );
	RE_IndirectDiffuse( irradiance, geo, mat, ref );

	vec3 clearcoatRadiance = vec3( 0.0 );
	vec3 radiance = vec3( 0.0 );
	vec3 iblIrradiance = vec3( 0.0 );

	#ifdef USE_ENVMAP

		//反射して映るやつ
		radiance += getLightProbeIndirectRadiance( geo.viewDir, geo.normal, mat.specularRoughness, 8 );

		//環境光的な
		iblIrradiance += getLightProbeIndirectIrradiance( geo, 8 );

	#endif

	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geo, mat, ref );

	vec3 outColor = ref.directSpecular + ref.directDiffuse + ref.indirectSpecular + ref.indirectDiffuse;

	gl_FragColor = vec4( vec3( outColor ), 1.0 );

}