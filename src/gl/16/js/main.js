/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/gl/js/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/gl16/js/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/*! exports provided: WebGLMultisampleRenderTarget, WebGLRenderTargetCube, WebGLRenderTarget, WebGLRenderer, ShaderLib, UniformsLib, UniformsUtils, ShaderChunk, FogExp2, Fog, Scene, Sprite, LOD, SkinnedMesh, Skeleton, Bone, Mesh, LineSegments, LineLoop, Line, Points, Group, VideoTexture, DataTexture, DataTexture3D, CompressedTexture, CubeTexture, CanvasTexture, DepthTexture, Texture, AnimationLoader, CompressedTextureLoader, DataTextureLoader, CubeTextureLoader, TextureLoader, ObjectLoader, MaterialLoader, BufferGeometryLoader, DefaultLoadingManager, LoadingManager, ImageLoader, ImageBitmapLoader, FontLoader, FileLoader, Loader, LoaderUtils, Cache, AudioLoader, SpotLightShadow, SpotLight, PointLight, RectAreaLight, HemisphereLight, DirectionalLightShadow, DirectionalLight, AmbientLight, LightShadow, Light, StereoCamera, PerspectiveCamera, OrthographicCamera, CubeCamera, ArrayCamera, Camera, AudioListener, PositionalAudio, AudioContext, AudioAnalyser, Audio, VectorKeyframeTrack, StringKeyframeTrack, QuaternionKeyframeTrack, NumberKeyframeTrack, ColorKeyframeTrack, BooleanKeyframeTrack, PropertyMixer, PropertyBinding, KeyframeTrack, AnimationUtils, AnimationObjectGroup, AnimationMixer, AnimationClip, Uniform, InstancedBufferGeometry, BufferGeometry, Geometry, InterleavedBufferAttribute, InstancedInterleavedBuffer, InterleavedBuffer, InstancedBufferAttribute, Face3, Object3D, Raycaster, Layers, EventDispatcher, Clock, QuaternionLinearInterpolant, LinearInterpolant, DiscreteInterpolant, CubicInterpolant, Interpolant, Triangle, Math, Spherical, Cylindrical, Plane, Frustum, Sphere, Ray, Matrix4, Matrix3, Box3, Box2, Line3, Euler, Vector4, Vector3, Vector2, Quaternion, Color, ImmediateRenderObject, VertexNormalsHelper, SpotLightHelper, SkeletonHelper, PointLightHelper, RectAreaLightHelper, HemisphereLightHelper, GridHelper, PolarGridHelper, FaceNormalsHelper, DirectionalLightHelper, CameraHelper, BoxHelper, Box3Helper, PlaneHelper, ArrowHelper, AxesHelper, Shape, Path, ShapePath, Font, CurvePath, Curve, ImageUtils, ShapeUtils, WebGLUtils, WireframeGeometry, ParametricGeometry, ParametricBufferGeometry, TetrahedronGeometry, TetrahedronBufferGeometry, OctahedronGeometry, OctahedronBufferGeometry, IcosahedronGeometry, IcosahedronBufferGeometry, DodecahedronGeometry, DodecahedronBufferGeometry, PolyhedronGeometry, PolyhedronBufferGeometry, TubeGeometry, TubeBufferGeometry, TorusKnotGeometry, TorusKnotBufferGeometry, TorusGeometry, TorusBufferGeometry, TextGeometry, TextBufferGeometry, SphereGeometry, SphereBufferGeometry, RingGeometry, RingBufferGeometry, PlaneGeometry, PlaneBufferGeometry, LatheGeometry, LatheBufferGeometry, ShapeGeometry, ShapeBufferGeometry, ExtrudeGeometry, ExtrudeBufferGeometry, EdgesGeometry, ConeGeometry, ConeBufferGeometry, CylinderGeometry, CylinderBufferGeometry, CircleGeometry, CircleBufferGeometry, BoxGeometry, CubeGeometry, BoxBufferGeometry, ShadowMaterial, SpriteMaterial, RawShaderMaterial, ShaderMaterial, PointsMaterial, MeshPhysicalMaterial, MeshStandardMaterial, MeshPhongMaterial, MeshToonMaterial, MeshNormalMaterial, MeshLambertMaterial, MeshDepthMaterial, MeshDistanceMaterial, MeshBasicMaterial, MeshMatcapMaterial, LineDashedMaterial, LineBasicMaterial, Material, Float64BufferAttribute, Float32BufferAttribute, Uint32BufferAttribute, Int32BufferAttribute, Uint16BufferAttribute, Int16BufferAttribute, Uint8ClampedBufferAttribute, Uint8BufferAttribute, Int8BufferAttribute, BufferAttribute, ArcCurve, CatmullRomCurve3, CubicBezierCurve, CubicBezierCurve3, EllipseCurve, LineCurve, LineCurve3, QuadraticBezierCurve, QuadraticBezierCurve3, SplineCurve, REVISION, MOUSE, CullFaceNone, CullFaceBack, CullFaceFront, CullFaceFrontBack, FrontFaceDirectionCW, FrontFaceDirectionCCW, BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, FrontSide, BackSide, DoubleSide, FlatShading, SmoothShading, NoColors, FaceColors, VertexColors, NoBlending, NormalBlending, AdditiveBlending, SubtractiveBlending, MultiplyBlending, CustomBlending, AddEquation, SubtractEquation, ReverseSubtractEquation, MinEquation, MaxEquation, ZeroFactor, OneFactor, SrcColorFactor, OneMinusSrcColorFactor, SrcAlphaFactor, OneMinusSrcAlphaFactor, DstAlphaFactor, OneMinusDstAlphaFactor, DstColorFactor, OneMinusDstColorFactor, SrcAlphaSaturateFactor, NeverDepth, AlwaysDepth, LessDepth, LessEqualDepth, EqualDepth, GreaterEqualDepth, GreaterDepth, NotEqualDepth, MultiplyOperation, MixOperation, AddOperation, NoToneMapping, LinearToneMapping, ReinhardToneMapping, Uncharted2ToneMapping, CineonToneMapping, ACESFilmicToneMapping, UVMapping, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, SphericalReflectionMapping, CubeUVReflectionMapping, CubeUVRefractionMapping, RepeatWrapping, ClampToEdgeWrapping, MirroredRepeatWrapping, NearestFilter, NearestMipMapNearestFilter, NearestMipMapLinearFilter, LinearFilter, LinearMipMapNearestFilter, LinearMipMapLinearFilter, UnsignedByteType, ByteType, ShortType, UnsignedShortType, IntType, UnsignedIntType, FloatType, HalfFloatType, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedShort565Type, UnsignedInt248Type, AlphaFormat, RGBFormat, RGBAFormat, LuminanceFormat, LuminanceAlphaFormat, RGBEFormat, DepthFormat, DepthStencilFormat, RedFormat, RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGB_PVRTC_4BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_PVRTC_2BPPV1_Format, RGB_ETC1_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, LoopOnce, LoopRepeat, LoopPingPong, InterpolateDiscrete, InterpolateLinear, InterpolateSmooth, ZeroCurvatureEnding, ZeroSlopeEnding, WrapAroundEnding, TrianglesDrawMode, TriangleStripDrawMode, TriangleFanDrawMode, LinearEncoding, sRGBEncoding, GammaEncoding, RGBEEncoding, LogLuvEncoding, RGBM7Encoding, RGBM16Encoding, RGBDEncoding, BasicDepthPacking, RGBADepthPacking, TangentSpaceNormalMap, ObjectSpaceNormalMap, Face4, LineStrip, LinePieces, MeshFaceMaterial, MultiMaterial, PointCloud, Particle, ParticleSystem, PointCloudMaterial, ParticleBasicMaterial, ParticleSystemMaterial, Vertex, DynamicBufferAttribute, Int8Attribute, Uint8Attribute, Uint8ClampedAttribute, Int16Attribute, Uint16Attribute, Int32Attribute, Uint32Attribute, Float32Attribute, Float64Attribute, ClosedSplineCurve3, SplineCurve3, Spline, AxisHelper, BoundingBoxHelper, EdgesHelper, WireframeHelper, XHRLoader, BinaryTextureLoader, GeometryUtils, Projector, CanvasRenderer, JSONLoader, SceneUtils, LensFlare */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

/***/ }),

/***/ "./src/gl16/js/MainScene.js":
/*!**********************************!*\
  !*** ./src/gl16/js/MainScene.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MainScene; });\n/* harmony import */ var _utils_BaseScene__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/BaseScene */ \"./src/gl16/js/utils/BaseScene.js\");\n/* harmony import */ var _utils_Trails_Trails__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/Trails/Trails */ \"./src/gl16/js/utils/Trails/Trails.js\");\n/* harmony import */ var _shaders_pp_vs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shaders/pp.vs */ \"./src/gl16/js/shaders/pp.vs\");\n/* harmony import */ var _shaders_pp_vs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_shaders_pp_vs__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _shaders_pp_fs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/pp.fs */ \"./src/gl16/js/shaders/pp.fs\");\n/* harmony import */ var _shaders_pp_fs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_shaders_pp_fs__WEBPACK_IMPORTED_MODULE_3__);\n\n\n\n\n\n\nclass MainScene extends _utils_BaseScene__WEBPACK_IMPORTED_MODULE_0__[\"default\"] {\n\n    constructor(renderer) {\n        super(renderer);\n        this.init();\n        this.animate();\n    }\n\n    init() {\n        this.time = Math.random() * 100;\n        this.clock = new THREE.Clock();\n        this.camera.position.set(0,1,3);\n\n        this.trails = new _utils_Trails_Trails__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this.renderer,2000,30);\n        this.scene.add(this.trails.obj);\n    }\n\n    animate() {\n        this.time += this.clock.getDelta();\n\n        let r = 13;\n        this.camera.position.set(Math.sin(this.time * 0.5) * r,0,Math.cos(this.time * 0.5) * r);\n        this.camera.lookAt(0,0,0);\n        this.trails.update();\n\n        this.renderer.render(this.scene,this.camera);\n    }\n\n    Resize(width,height){\n        this.camera.aspect = width / height;\n        this.camera.updateProjectionMatrix();\n    }\n    \n    onTouchStart(){\n    }\n\n    onTouchMove(){\n    }\n\n    onTouchEnd(){\n\n    }\n\n}\n\n//# sourceURL=webpack:///./src/gl16/js/MainScene.js?");

/***/ }),

/***/ "./src/gl16/js/main.js":
/*!*****************************!*\
  !*** ./src/gl16/js/main.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _MainScene__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./MainScene */ \"./src/gl16/js/MainScene.js\");\n/* harmony import */ var _utils_ThreeController__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/ThreeController */ \"./src/gl16/js/utils/ThreeController.js\");\n\n\nclass App {\n    constructor() {\n        this.init();\n    }\n\n    init() {\n        this.tc = new _utils_ThreeController__WEBPACK_IMPORTED_MODULE_1__[\"default\"]();\n        this.scene = new _MainScene__WEBPACK_IMPORTED_MODULE_0__[\"default\"](this.tc.renderer);\n        this.tc.setScene(this.scene);\n    }\n}\n\ndocument.addEventListener('load',new App());\n\n//# sourceURL=webpack:///./src/gl16/js/main.js?");

/***/ }),

/***/ "./src/gl16/js/plugins/GPUComputationRenderer.js":
/*!*******************************************************!*\
  !*** ./src/gl16/js/plugins/GPUComputationRenderer.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return GPUComputationRenderer; });\n/**\n * @author yomboprime https://github.com/yomboprime\n *\n * GPUComputationRenderer, based on SimulationRenderer by zz85\n *\n * The GPUComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats\n * for each compute element (texel)\n *\n * Each variable has a fragment shader that defines the computation made to obtain the variable in question.\n * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader\n * (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.\n *\n * The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used\n * as inputs to render the textures of the next frame.\n *\n * The render targets of the variables can be used as input textures for your visualization shaders.\n *\n * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.\n * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...\n *\n * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:\n * #DEFINE resolution vec2( 1024.0, 1024.0 )\n *\n * -------------\n *\n * Basic use:\n *\n * // Initialization...\n *\n * // Create computation renderer\n * var gpuCompute = new GPUComputationRenderer( 1024, 1024, renderer );\n *\n * // Create initial state float textures\n * var pos0 = gpuCompute.createTexture();\n * var vel0 = gpuCompute.createTexture();\n * // and fill in here the texture data...\n *\n * // Add texture variables\n * var velVar = gpuCompute.addVariable( \"textureVelocity\", fragmentShaderVel, pos0 );\n * var posVar = gpuCompute.addVariable( \"texturePosition\", fragmentShaderPos, vel0 );\n *\n * // Add variable dependencies\n * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );\n * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );\n *\n * // Add custom uniforms\n * velVar.material.uniforms.time = { value: 0.0 };\n *\n * // Check for completeness\n * var error = gpuCompute.init();\n * if ( error !== null ) {\n *\t\tconsole.error( error );\n  * }\n *\n *\n * // In each frame...\n *\n * // Compute!\n * gpuCompute.compute();\n *\n * // Update texture uniforms in your visualization materials with the gpu renderer output\n * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;\n *\n * // Do your rendering\n * renderer.render( myScene, myCamera );\n *\n * -------------\n *\n * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)\n * Note that the shaders can have multiple input textures.\n *\n * var myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );\n * var myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );\n *\n * var inputTexture = gpuCompute.createTexture();\n *\n * // Fill in here inputTexture...\n *\n * myFilter1.uniforms.theTexture.value = inputTexture;\n *\n * var myRenderTarget = gpuCompute.createRenderTarget();\n * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;\n *\n * var outputRenderTarget = gpuCompute.createRenderTarget();\n *\n * // Now use the output texture where you want:\n * myMaterial.uniforms.map.value = outputRenderTarget.texture;\n *\n * // And compute each frame, before rendering to screen:\n * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );\n * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );\n * \n *\n *\n * @param {int} sizeX Computation problem size is always 2d: sizeX * sizeY elements.\n * @param {int} sizeY Computation problem size is always 2d: sizeX * sizeY elements.\n * @param {WebGLRenderer} renderer The renderer\n  */\n\nfunction GPUComputationRenderer( sizeX, sizeY, renderer ) {\n\n\tthis.variables = [];\n\n\tthis.currentTextureIndex = 0;\n\n\tvar scene = new THREE.Scene();\n\n\tvar camera = new THREE.Camera();\n\tcamera.position.z = 1;\n\n\tvar passThruUniforms = {\n\t\ttexture: { value: null }\n\t};\n\n\tvar passThruShader = createShaderMaterial( getPassThroughFragmentShader(), passThruUniforms );\n\n\tvar mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), passThruShader );\n\tscene.add( mesh );\n\n\n\tthis.addVariable = function( variableName, computeFragmentShader, initialValueTexture ) {\n\n\t\tvar material = this.createShaderMaterial( computeFragmentShader );\n\n\t\tvar variable = {\n\t\t\tname: variableName,\n\t\t\tinitialValueTexture: initialValueTexture,\n\t\t\tmaterial: material,\n\t\t\tdependencies: null,\n\t\t\trenderTargets: [],\n\t\t\twrapS: null,\n\t\t\twrapT: null,\n\t\t\tminFilter: THREE.NearestFilter,\n\t\t\tmagFilter: THREE.NearestFilter\n\t\t};\n\n\t\tthis.variables.push( variable );\n\n\t\treturn variable;\n\t\t\n\t};\n\n\tthis.setVariableDependencies = function( variable, dependencies ) {\n\n\t\tvariable.dependencies = dependencies;\n\n\t};\n\n\tthis.init = function() {\n\n\t\tif ( ! renderer.extensions.get( \"OES_texture_float\" ) ) {\n\n\t\t\treturn \"No OES_texture_float support for float textures.\";\n\n\t\t}\n\n\t\tif ( renderer.capabilities.maxVertexTextures === 0 ) {\n\n\t\t\treturn \"No support for vertex shader textures.\";\n\n\t\t}\n\n\t\tfor ( var i = 0; i < this.variables.length; i++ ) {\n\n\t\t\tvar variable = this.variables[ i ];\n\n\t\t\t// Creates rendertargets and initialize them with input texture\n\t\t\tvariable.renderTargets[ 0 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );\n\t\t\tvariable.renderTargets[ 1 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );\n\t\t\tthis.renderTexture( variable.initialValueTexture, variable.renderTargets[ 0 ] );\n\t\t\tthis.renderTexture( variable.initialValueTexture, variable.renderTargets[ 1 ] );\n\n\t\t\t// Adds dependencies uniforms to the ShaderMaterial\n\t\t\tvar material = variable.material;\n\t\t\tvar uniforms = material.uniforms;\n\t\t\tif ( variable.dependencies !== null ) {\n\n\t\t\t\tfor ( var d = 0; d < variable.dependencies.length; d++ ) {\n\n\t\t\t\t\tvar depVar = variable.dependencies[ d ];\n\n\t\t\t\t\tif ( depVar.name !== variable.name ) {\n\n\t\t\t\t\t\t// Checks if variable exists\n\t\t\t\t\t\tvar found = false;\n\t\t\t\t\t\tfor ( var j = 0; j < this.variables.length; j++ ) {\n\n\t\t\t\t\t\t\tif ( depVar.name === this.variables[ j ].name ) {\n\t\t\t\t\t\t\t\tfound = true;\n\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t}\n\t\t\t\t\t\tif ( ! found ) {\n\t\t\t\t\t\t\treturn \"Variable dependency not found. Variable=\" + variable.name + \", dependency=\" + depVar.name;\n\t\t\t\t\t\t}\n\n\t\t\t\t\t}\n\n\t\t\t\t\tuniforms[ depVar.name ] = { value: null };\n\n\t\t\t\t\tmaterial.fragmentShader = \"\\nuniform sampler2D \" + depVar.name + \";\\n\" + material.fragmentShader;\n\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\n\t\tthis.currentTextureIndex = 0;\n\n\t\treturn null;\n\n\t};\n\n\tthis.compute = function() {\n\n\t\tvar currentTextureIndex = this.currentTextureIndex;\n\t\tvar nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;\n\n\t\tfor ( var i = 0, il = this.variables.length; i < il; i++ ) {\n\n\t\t\tvar variable = this.variables[ i ];\n\n\t\t\t// Sets texture dependencies uniforms\n\t\t\tif ( variable.dependencies !== null ) {\n\n\t\t\t\tvar uniforms = variable.material.uniforms;\n\t\t\t\tfor ( var d = 0, dl = variable.dependencies.length; d < dl; d++ ) {\n\n\t\t\t\t\tvar depVar = variable.dependencies[ d ];\n\n\t\t\t\t\tuniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture;\n\n\t\t\t\t}\n\n\t\t\t}\n\n\t\t\t// Performs the computation for this variable\n\t\t\tthis.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );\n\n\t\t}\n\n\t\tthis.currentTextureIndex = nextTextureIndex;\n\t};\n\n\tthis.getCurrentRenderTarget = function( variable ) {\n\n\t\treturn variable.renderTargets[ this.currentTextureIndex ];\n\n\t};\n\n\tthis.getAlternateRenderTarget = function( variable ) {\n\n\t\treturn variable.renderTargets[ this.currentTextureIndex === 0 ? 1 : 0 ];\n\n\t};\n\n\tfunction addResolutionDefine( materialShader ) {\n\n\t\tmaterialShader.defines.resolution = 'vec2( ' + sizeX.toFixed( 1 ) + ', ' + sizeY.toFixed( 1 ) + \" )\";\n\n\t}\n\tthis.addResolutionDefine = addResolutionDefine;\n\n\n\t// The following functions can be used to compute things manually\n\n\tfunction createShaderMaterial( computeFragmentShader, uniforms ) {\n\n\t\tuniforms = uniforms || {};\n\n\t\tvar material = new THREE.ShaderMaterial( {\n\t\t\tuniforms: uniforms,\n\t\t\tvertexShader: getPassThroughVertexShader(),\n\t\t\tfragmentShader: computeFragmentShader\n\t\t} );\n\n\t\taddResolutionDefine( material );\n\n\t\treturn material;\n\t}\n\tthis.createShaderMaterial = createShaderMaterial;\n\n\tthis.createRenderTarget = function( sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter ) {\n\n\t\tsizeXTexture = sizeXTexture || sizeX;\n\t\tsizeYTexture = sizeYTexture || sizeY;\n\n\t\twrapS = wrapS || THREE.ClampToEdgeWrapping;\n\t\twrapT = wrapT || THREE.ClampToEdgeWrapping;\n\n\t\tminFilter = minFilter || THREE.NearestFilter;\n\t\tmagFilter = magFilter || THREE.NearestFilter;\n\n\t\tvar renderTarget = new THREE.WebGLRenderTarget( sizeXTexture, sizeYTexture, {\n\t\t\twrapS: wrapS,\n\t\t\twrapT: wrapT,\n\t\t\tminFilter: minFilter,\n\t\t\tmagFilter: magFilter,\n\t\t\tformat: THREE.RGBAFormat,\n\t\t\ttype: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,\n\t\t\tstencilBuffer: false,\n\t\t\tdepthBuffer: false\n\t\t} );\n\n\t\treturn renderTarget;\n\n\t};\n\n\tthis.createTexture = function() {\n\n\t\tvar a = new Float32Array( sizeX * sizeY * 4 );\n\t\tvar texture = new THREE.DataTexture( a, sizeX, sizeY, THREE.RGBAFormat, THREE.FloatType );\n\t\ttexture.needsUpdate = true;\n\n\t\treturn texture;\n\n\t};\n\n\n\tthis.renderTexture = function( input, output ) {\n\n\t\t// Takes a texture, and render out in rendertarget\n\t\t// input = Texture\n\t\t// output = RenderTarget\n\n\t\tpassThruUniforms.texture.value = input;\n\n\t\tthis.doRenderTarget( passThruShader, output);\n\n\t\tpassThruUniforms.texture.value = null;\n\n\t};\n\n\tthis.doRenderTarget = function( material, output ) {\n\n\t\tmesh.material = material;\n\t\trenderer.render( scene, camera, output );\n\t\tmesh.material = passThruShader;\n\n\t};\n\n\t// Shaders\n\n\tfunction getPassThroughVertexShader() {\n\n\t\treturn\t\"void main()\t{\\n\" +\n\t\t\t\t\"\\n\" +\n\t\t\t\t\"\tgl_Position = vec4( position, 1.0 );\\n\" +\n\t\t\t\t\"\\n\" +\n\t\t\t\t\"}\\n\";\n\n\t}\n\n\tfunction getPassThroughFragmentShader() {\n\n\t\treturn\t\"uniform sampler2D texture;\\n\" +\n\t\t\t\t\"\\n\" +\n\t\t\t\t\"void main() {\\n\" +\n\t\t\t\t\"\\n\" +\n\t\t\t\t\"\tvec2 uv = gl_FragCoord.xy / resolution.xy;\\n\" +\n\t\t\t\t\"\\n\" +\n\t\t\t\t\"\tgl_FragColor = texture2D( texture, uv );\\n\" +\n\t\t\t\t\"\\n\" +\n\t\t\t\t\"}\\n\";\n\n\t}\n\n}\n\n\n//# sourceURL=webpack:///./src/gl16/js/plugins/GPUComputationRenderer.js?");

/***/ }),

/***/ "./src/gl16/js/shaders/pp.fs":
/*!***********************************!*\
  !*** ./src/gl16/js/shaders/pp.fs ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"uniform float time;\\nuniform sampler2D tDiffuse;\\nvarying vec2 vUv;\\n#define N 16\\n\\nvoid main() {\\n    vec2 uv = vUv;\\n    vec2 u = uv * 2.0 - 1.0;\\n    vec3 c;\\n\\n    float w = -max(.0,length(u)) * 0.01;\\n    // w *= smoothstep(0.5,1.0,sin(10.0 * 15.0)) * 5.0;\\n    // w += .01;\\n\\n    vec2 vig = u * w;\\n\\n    for(int i = 0; i < N; i++){\\n        vig *= 1.0 + float(i) * 0.01;\\n        c.x += texture2D(tDiffuse,uv + vec2(float(i) * 0.0005,0)).x;\\n        c.y += texture2D(tDiffuse,uv).y;\\n        c.z += texture2D(tDiffuse,uv).z;\\n    }\\n    c /= float(N) - 5.0;\\n    gl_FragColor = vec4(c,1.0);\\n}\"\n\n//# sourceURL=webpack:///./src/gl16/js/shaders/pp.fs?");

/***/ }),

/***/ "./src/gl16/js/shaders/pp.vs":
/*!***********************************!*\
  !*** ./src/gl16/js/shaders/pp.vs ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"varying vec2 vUv;\\nvoid main() {\\n    vUv = uv;\\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\\n}\"\n\n//# sourceURL=webpack:///./src/gl16/js/shaders/pp.vs?");

/***/ }),

/***/ "./src/gl16/js/utils/BaseScene.js":
/*!****************************************!*\
  !*** ./src/gl16/js/utils/BaseScene.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return BaseScene; });\nclass BaseScene {\n    constructor(renderer) {\n        this.renderer = renderer;\n        this.scene = new THREE.Scene();\n        this.camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);\n    }\n\n    animate(){\n    }\n\n    onTouchStart(){\n    }\n\n    onTouchMove(){\n    }\n\n    onTouchEnd(){\n    }\n}\n\n//# sourceURL=webpack:///./src/gl16/js/utils/BaseScene.js?");

/***/ }),

/***/ "./src/gl16/js/utils/Cursor.js":
/*!*************************************!*\
  !*** ./src/gl16/js/utils/Cursor.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Cursor; });\nclass Cursor {\n    constructor() {\n        this._x = -1;\n        this._y = -1;\n        this._deltaY;\n        this._deltaX\n        this._touchDown = false;\n    }\n\n    set x(x) {\n        if (this._x == -1) this._deltaX = 0;\n        else this._deltaX = x - this._x\n        this._x = x;\n    }\n    get x() {\n        return this._x;\n    }\n\n    set y(y) {\n        if (this._y == -1) this._deltaY = 0;\n        else this._deltaY = y - this._y\n        this._y = y;\n    }\n\n    get y() {\n        return this._y;\n    }\n\n    get deltaX() {\n        if (this._deltaX != null) return this._deltaX;\n        else return 0;\n    }\n\n    get deltaY() {\n        if (this._deltaY != null) return this._deltaY;\n        else return 0;\n    }\n\n    TouchStart(cursor) {\n        this._touchDown = true;\n        if (cursor.pageX) {\n            this.x = cursor.pageX;\n            this.y = cursor.pageY;\n        } else {\n            this.x = cursor.touches[0].clientX;\n            this.y = cursor.touches[0].clientY;\n        }\n    }\n\n    TouchMove(cursor) {\n        if (this._touchDown == true) {\n            if (cursor.pageX) {\n                this.x = cursor.pageX;\n                this.y = cursor.pageY;\n            } else {\n                this.x = cursor.touches[0].clientX;\n                this.y = cursor.touches[0].clientY;\n            }\n        }\n    }\n\n    TouchEnd() {\n        this._touchDown = false;\n        this._x = -1;\n        this._y = -1;\n    }\n}\n\n//# sourceURL=webpack:///./src/gl16/js/utils/Cursor.js?");

/***/ }),

/***/ "./src/gl16/js/utils/ThreeController.js":
/*!**********************************************!*\
  !*** ./src/gl16/js/utils/ThreeController.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return ThreeGraphic; });\n/* harmony import */ var _Cursor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Cursor */ \"./src/gl16/js/utils/Cursor.js\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\n\n\nwindow.THREE = three__WEBPACK_IMPORTED_MODULE_1__;\n\nclass ThreeGraphic{\n        constructor(){\n        this.currentScene;\n        this.canvas = document.querySelector('#canvas');\n\n        this.renderer = new three__WEBPACK_IMPORTED_MODULE_1__[\"WebGLRenderer\"]({\n            canvas: this.canvas,\n        });\n        \n        this.renderer.setSize(window.innerWidth,window.innerHeight);\n        this.renderer.setPixelRatio(1);\n\n        this.cursor = new _Cursor__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.userAgent = navigator.userAgent;    \n        this.isTouch = false;\n    \n        this.init();\n        this.animate();\n    }\n\n    init(){ \n        if(this.userAgent.indexOf('iPhone') >= 0 || this.userAgent.indexOf('iPad') >= 0 || this.userAgent.indexOf('Android') >= 0){    \n            window.addEventListener('touchstart',this.onTouchStart.bind(this));\n            window.addEventListener('touchmove',this.onTouchMove.bind(this),{passive: false});\n            window.addEventListener('touchend',this.onTouchEnd.bind(this));\n        }else{\n            window.addEventListener('mousedown',this.onTouchStart.bind(this));\n            window.addEventListener('mousemove',this.onTouchMove.bind(this));\n            window.addEventListener('mouseup',this.onTouchEnd.bind(this));\n        }\n        window.addEventListener('orientationchange',this.onOrientationDevice.bind(this));\n        window.addEventListener('resize',this.onWindowResize.bind(this));\n    }\n    \n    animate(){\n        if(this.currentScene){\n            this.currentScene.animate();\n        }\n        requestAnimationFrame(this.animate.bind(this));\n    }\n\n    setScene(scene){\n        console.log('setScene');\n        this.currentScene = scene;\n    }\n\n    onWindowResize(){\n        \n        var width = window.innerWidth;\n        var height = window.innerHeight;\n        this.renderer.setSize(width,height);\n\n        if(this.currentScene){\n\n        console.log(\"resize\");\n            this.currentScene.Resize(width,height);\n        }\n    }\n\n    onOrientationDevice(){\n        this.onWindowResize();\n    }\n\n    onTouchStart(event){\n        this.isTouch = true;\n\n        if(this.cursor){\n            this.cursor.TouchStart(event);\n        }\n\n        if(this.currentScene){\n            this.currentScene.onTouchStart(this.cursor);\n        }\n    }\n\n    onTouchMove(event){\n        event.preventDefault();\n        if(!this.isTouch) return;\n        if(this.cursor){\n            this.cursor.TouchMove(event);\n        }\n\n        if(this.currentScene){\n            this.currentScene.onTouchMove(this.cursor);\n        }\n    }\n\n    onTouchEnd(event){\n        this.isTouch = false;\n\n        if(this.cursor){\n            this.cursor.TouchEnd(event);\n        }\n\n        if(this.currentScene){\n            this.currentScene.onTouchEnd(this.cursor);\n        }\n    }\n}\n\n//# sourceURL=webpack:///./src/gl16/js/utils/ThreeController.js?");

/***/ }),

/***/ "./src/gl16/js/utils/Trails/Trails.js":
/*!********************************************!*\
  !*** ./src/gl16/js/utils/Trails/Trails.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Trails; });\n/* harmony import */ var _shaders_computePosition_glsl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./shaders/computePosition.glsl */ \"./src/gl16/js/utils/Trails/shaders/computePosition.glsl\");\n/* harmony import */ var _shaders_computePosition_glsl__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_shaders_computePosition_glsl__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _shaders_computeVelocity_glsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shaders/computeVelocity.glsl */ \"./src/gl16/js/utils/Trails/shaders/computeVelocity.glsl\");\n/* harmony import */ var _shaders_computeVelocity_glsl__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_shaders_computeVelocity_glsl__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _shaders_trails_fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shaders/trails.fs */ \"./src/gl16/js/utils/Trails/shaders/trails.fs\");\n/* harmony import */ var _shaders_trails_fs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_shaders_trails_fs__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _shaders_trails_vs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shaders/trails.vs */ \"./src/gl16/js/utils/Trails/shaders/trails.vs\");\n/* harmony import */ var _shaders_trails_vs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_shaders_trails_vs__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _plugins_GPUComputationRenderer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../plugins/GPUComputationRenderer */ \"./src/gl16/js/plugins/GPUComputationRenderer.js\");\n\n\n\n\n\n\n\nclass Trails{\n\n    constructor(renderer,num,length){\n        this.renderer = renderer;\n\n        this.computeRenderer;\n        this.num = num;\n        this.length = length;\n        \n        this.obj;\n\n        this.time = 0;\n        this.clock = new THREE.Clock();\n\n        this.comTexs = {\n            position:{\n                texture: null,\n                uniforms: null,\n            },\n            velocity:{\n                texture: null,\n                uniforms: null,\n            },\n        }\n\n        this.initComputeRenderer();\n        this.createTrails();\n    }\n\n    initComputeRenderer(){        \n        this.computeRenderer = new _plugins_GPUComputationRenderer__WEBPACK_IMPORTED_MODULE_4__[\"default\"](this.length,this.num,this.renderer);\n        \n        let initPositionTex = this.computeRenderer.createTexture();\n        let initVelocityTex = this.computeRenderer.createTexture();\n\n        this.initPosition(initPositionTex);\n        // this.initVelocity(initVelocityTex);\n    \n        this.comTexs.position.texture = this.computeRenderer.addVariable(\"texturePosition\",_shaders_computePosition_glsl__WEBPACK_IMPORTED_MODULE_0___default.a,initPositionTex);\n        this.comTexs.velocity.texture = this.computeRenderer.addVariable(\"textureVelocity\",_shaders_computeVelocity_glsl__WEBPACK_IMPORTED_MODULE_1___default.a,initVelocityTex);\n\n        this.computeRenderer.setVariableDependencies( this.comTexs.position.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );\n        this.comTexs.position.uniforms = this.comTexs.position.texture.material.uniforms;\n\n        this.computeRenderer.setVariableDependencies( this.comTexs.velocity.texture, [ this.comTexs.position.texture, this.comTexs.velocity.texture] );  \n        this.comTexs.velocity.uniforms = this.comTexs.velocity.texture.material.uniforms;\n        this.comTexs.velocity.uniforms.time =  { type:\"f\", value : 0};\n\n        this.computeRenderer.init();\n    }\n\n    update(){\n        this.time += this.clock.getDelta();\n\n        this.computeRenderer.compute();\n        this.comTexs.velocity.uniforms.time.value = this.time;\n        this.uni.texturePosition.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.position.texture).texture;\n        this.uni.textureVelocity.value = this.computeRenderer.getCurrentRenderTarget(this.comTexs.velocity.texture).texture;\n    }\n\n    initPosition(tex){\n        var texArray = tex.image.data;\n        let range = new THREE.Vector3(10,10,10);\n        for(var i = 0; i < texArray.length; i += this.length * 4){\n            let x = Math.random() * range.x - range.x / 2;\n            let y = Math.random() * range.y - range.y / 2;\n            let z = Math.random() * range.z - range.z / 2;\n            for(let j = 0; j < this.length * 4; j += 4){\n                texArray[i + j + 0] = x;\n                texArray[i + j + 1] = y;\n                texArray[i + j + 2] = z;\n                texArray[i + j + 3] = 0.0;\n            }\n        }\n    }\n\n    // initVelocity(tex){\n    //     var texArray = tex.image.data;\n    //     for(var i = 0; i < texArray.length; i += this.length * 4){\n    //         texArray[i + 0] = 0;\n    //         texArray[i + 1] = 0;\n    //         texArray[i + 2] = 0;\n    //         texArray[i + 3] = 0;\n    //     }\n    // }\n\n    createTrails(){\n        let geo = new THREE.BufferGeometry();\n\n        let pArray = new Float32Array(this.num * this.length * 3);\n        let indices = new Uint32Array((this.num * this.length - 1) * 3);\n        let uv = new Float32Array(this.num * this.length * 2);\n\n        let max = this.length * this.n;\n\n        for(let i = 0; i < this.num; i++){\n            for(let j = 0; j < this.length; j++){\n                let c = i * this.length + j;\n                let n = (c) * 3;\n                pArray[n] = 0;\n                pArray[n + 1] = 0;\n                pArray[n + 2] = 0;\n\n                uv[c * 2] = j / this.length;\n                uv[c * 2 + 1] = i / this.num;\n\n                indices[n] = c;\n                indices[n + 1] = Math.min(c + 1,i * this.length + this.length - 1);\n                indices[n + 2] = Math.min(c + 1,i * this.length + this.length - 1);\n            }\n        }\n        \n        geo.addAttribute('position', new THREE.BufferAttribute( pArray, 3 ) );\n        geo.addAttribute('uv', new THREE.BufferAttribute( uv, 2 ) );\n        geo.setIndex(new THREE.BufferAttribute(indices,1));\n\n        this.uni = {\n            texturePosition : {value: null},\n            textureVelocity : {value: null},\n        }\n\n        let mat = new THREE.ShaderMaterial({\n            uniforms: this.uni,\n            vertexShader: _shaders_trails_vs__WEBPACK_IMPORTED_MODULE_3___default.a,\n            fragmentShader: _shaders_trails_fs__WEBPACK_IMPORTED_MODULE_2___default.a,\n        });\n        mat.wireframe = true;\n\n        this.obj = new THREE.Mesh(geo,mat);\n        this.obj.matrixAutoUpdate = false;\n        this.obj.updateMatrix();\n    }\n}\n\n//# sourceURL=webpack:///./src/gl16/js/utils/Trails/Trails.js?");

/***/ }),

/***/ "./src/gl16/js/utils/Trails/shaders/computePosition.glsl":
/*!***************************************************************!*\
  !*** ./src/gl16/js/utils/Trails/shaders/computePosition.glsl ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"void main() {\\n    \\n    if(gl_FragCoord.x <= 1.0){\\n        vec2 uv = gl_FragCoord.xy / resolution.xy;\\n        vec3 pos = texture2D( texturePosition, uv ).xyz;\\n        vec3 vel = texture2D( textureVelocity, uv ).xyz;\\n\\n        pos += vel * 0.01;\\n        gl_FragColor = vec4(pos,1.0);\\n        \\n    }else{\\n        vec2 bUV = (gl_FragCoord.xy - vec2(1.0,0.0)) / resolution.xy;\\n        vec3 bPos = texture2D( texturePosition, bUV ).xyz;  \\n        gl_FragColor = vec4(bPos,1.0);\\n    }\\n}\"\n\n//# sourceURL=webpack:///./src/gl16/js/utils/Trails/shaders/computePosition.glsl?");

/***/ }),

/***/ "./src/gl16/js/utils/Trails/shaders/computeVelocity.glsl":
/*!***************************************************************!*\
  !*** ./src/gl16/js/utils/Trails/shaders/computeVelocity.glsl ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"uniform float time;\\n\\n// Description : Array and textureless GLSL 2D/3D/4D simplex \\n//               noise functions.\\n//      Author : Ian McEwan, Ashima Arts.\\n//  Maintainer : stegu\\n//     Lastmod : 20110822 (ijm)\\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\\n//               Distributed under the MIT License. See LICENSE file.\\n//               https://github.com/ashima/webgl-noise\\n//               https://github.com/stegu/webgl-noise\\n// \\n\\nvec4 mod289(vec4 x) {\\n  return x - floor(x * (1.0 / 289.0)) * 289.0; }\\n\\nfloat mod289(float x) {\\n  return x - floor(x * (1.0 / 289.0)) * 289.0; }\\n\\nvec4 permute(vec4 x) {\\n     return mod289(((x*34.0)+1.0)*x);\\n}\\n\\nfloat permute(float x) {\\n     return mod289(((x*34.0)+1.0)*x);\\n}\\n\\nvec4 taylorInvSqrt(vec4 r)\\n{\\n  return 1.79284291400159 - 0.85373472095314 * r;\\n}\\n\\nfloat taylorInvSqrt(float r)\\n{\\n  return 1.79284291400159 - 0.85373472095314 * r;\\n}\\n\\nvec4 grad4(float j, vec4 ip)\\n  {\\n  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\\n  vec4 p,s;\\n\\n  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\\n  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\\n  s = vec4(lessThan(p, vec4(0.0)));\\n  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; \\n\\n  return p;\\n  }\\n\\t\\t\\t\\t\\t\\t\\n// (sqrt(5) - 1)/4 = F4, used once below\\n#define F4 0.309016994374947451\\n\\nfloat snoise(vec4 v)\\n  {\\n  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4\\n                        0.276393202250021,  // 2 * G4\\n                        0.414589803375032,  // 3 * G4\\n                       -0.447213595499958); // -1 + 4 * G4\\n\\n// First corner\\n  vec4 i  = floor(v + dot(v, vec4(F4)) );\\n  vec4 x0 = v -   i + dot(i, C.xxxx);\\n\\n// Other corners\\n\\n// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)\\n  vec4 i0;\\n  vec3 isX = step( x0.yzw, x0.xxx );\\n  vec3 isYZ = step( x0.zww, x0.yyz );\\n//  i0.x = dot( isX, vec3( 1.0 ) );\\n  i0.x = isX.x + isX.y + isX.z;\\n  i0.yzw = 1.0 - isX;\\n//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );\\n  i0.y += isYZ.x + isYZ.y;\\n  i0.zw += 1.0 - isYZ.xy;\\n  i0.z += isYZ.z;\\n  i0.w += 1.0 - isYZ.z;\\n\\n  // i0 now contains the unique values 0,1,2,3 in each channel\\n  vec4 i3 = clamp( i0, 0.0, 1.0 );\\n  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );\\n  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );\\n\\n  //  x0 = x0 - 0.0 + 0.0 * C.xxxx\\n  //  x1 = x0 - i1  + 1.0 * C.xxxx\\n  //  x2 = x0 - i2  + 2.0 * C.xxxx\\n  //  x3 = x0 - i3  + 3.0 * C.xxxx\\n  //  x4 = x0 - 1.0 + 4.0 * C.xxxx\\n  vec4 x1 = x0 - i1 + C.xxxx;\\n  vec4 x2 = x0 - i2 + C.yyyy;\\n  vec4 x3 = x0 - i3 + C.zzzz;\\n  vec4 x4 = x0 + C.wwww;\\n\\n// Permutations\\n  i = mod289(i); \\n  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);\\n  vec4 j1 = permute( permute( permute( permute (\\n             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))\\n           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))\\n           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))\\n           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));\\n\\n// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope\\n// 7*7*6 = 294, which is close to the ring size 17*17 = 289.\\n  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;\\n\\n  vec4 p0 = grad4(j0,   ip);\\n  vec4 p1 = grad4(j1.x, ip);\\n  vec4 p2 = grad4(j1.y, ip);\\n  vec4 p3 = grad4(j1.z, ip);\\n  vec4 p4 = grad4(j1.w, ip);\\n\\n// Normalise gradients\\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\\n  p0 *= norm.x;\\n  p1 *= norm.y;\\n  p2 *= norm.z;\\n  p3 *= norm.w;\\n  p4 *= taylorInvSqrt(dot(p4,p4));\\n\\n// Mix contributions from the five corners\\n  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);\\n  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);\\n  m0 = m0 * m0;\\n  m1 = m1 * m1;\\n  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))\\n               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;\\n\\n  }\\n\\n\\n// vec3 snoiseDelta(vec3 pos){\\n//     float dlt = 0.0001;\\n//     vec3 a = snoise3D(pos);\\n//     vec3 b = snoise3D(vec3(pos.x + dlt,pos.y + dlt,pos.z + dlt));\\n//     vec3 dt = vec3(a.x - b.x,a.y - b.y,a.z - b.z) / dlt;\\n//     return dt;\\n// }\\n\\n\\nvoid main() {\\n    if(gl_FragCoord.x >= 1.0) return;    \\n    \\n    vec2 uv = gl_FragCoord.xy / resolution.xy;\\n    vec3 pos = texture2D( texturePosition, uv ).xyz;\\n    vec3 vel = texture2D( textureVelocity, uv ).xyz;\\n    float idParticle = uv.y * resolution.x + uv.x;\\n\\n    vel.xyz += 40.0 * vec3(\\n      snoise( vec4( 0.1 * pos.xyz, 7.225 + 0.5 * time ) ),\\n      snoise( vec4( 0.1 * pos.xyz, 3.553 + 0.5 * time ) ),\\n      snoise( vec4( 0.1 * pos.xyz, 1.259 + 0.5 * time ) )\\n    ) * 0.2;\\n    vel += -pos * length(pos) * 0.1;\\n    vel.xyz *= 0.9 + abs(sin(uv.y * 9.0)) * 0.03;\\n\\n    gl_FragColor = vec4( vel.xyz, 1.0 );\\n}\"\n\n//# sourceURL=webpack:///./src/gl16/js/utils/Trails/shaders/computeVelocity.glsl?");

/***/ }),

/***/ "./src/gl16/js/utils/Trails/shaders/trails.fs":
/*!****************************************************!*\
  !*** ./src/gl16/js/utils/Trails/shaders/trails.fs ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"varying vec4 vColor;\\nvoid main() {\\n    gl_FragColor = vColor;\\n}\"\n\n//# sourceURL=webpack:///./src/gl16/js/utils/Trails/shaders/trails.fs?");

/***/ }),

/***/ "./src/gl16/js/utils/Trails/shaders/trails.vs":
/*!****************************************************!*\
  !*** ./src/gl16/js/utils/Trails/shaders/trails.vs ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = \"#include <common>\\nuniform sampler2D texturePosition;\\nvarying vec4 vColor;\\n\\nvoid main() {\\n    vec3 pos = texture2D( texturePosition, uv ).xyz;\\n    \\n    vec3 c = vec3(uv.y,sin(uv.y * 3.0),1.0); \\n    vColor = vec4(c,1.0);\\n\\n    vec4 mvPosition = modelViewMatrix * vec4( pos + position, 1.0 );\\n    gl_PointSize = 2.0;\\n\\n    gl_Position = projectionMatrix * mvPosition;\\n}\"\n\n//# sourceURL=webpack:///./src/gl16/js/utils/Trails/shaders/trails.vs?");

/***/ })

/******/ });