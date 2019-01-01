import '../style.scss';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import Cursor from './Cursor';
import ObjectController from './ObjectContoller';

//shaders
const standardVert = require("../shader/standard.vs");
const displayFrag = require("../shader/display.fs");

var camera, renderer;
var width = window.innerWidth;
var height = window.innerHeight;

var scene = new THREE.Scene();
var loader = new GLTFLoader();

// var cameraBasePos  = new THREE.Vector3(0,2,7);
var cameraBasePos = new THREE.Vector3(0, 2, 5);
var cameraBaseRotate = new THREE.Vector3(-0.25, 0, 0);

var cursor = new Cursor();

var time = 0;

//models
var keys;
var mouse;
var display;
var displayUni;

var pLight;

function init() {
	cursor.tapEvent = onTouch.bind(this);

	// render
	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#canvas'),
		antialias: true
	});
	renderer.shadowMap.enabled = true;
	renderer.animate(animate.bind(this));

	scene.background = new THREE.Color(0x000000);

	//camera
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
	camera.name = "camera";
	camera.position.copy(cameraBasePos);
	camera.rotation.setFromVector3(cameraBaseRotate);
	scene.add(camera);

	//light
	// var aLight = new THREE.AmbientLight();
	// aLight.intensity = 1;
	// aLight.color = new THREE.Color(0x444444);
	// scene.add(aLight);

	pLight = new THREE.PointLight();
	pLight.intensity = 1.0;
	pLight.position.set(-0.28, 1.44, -0.40);
	pLight.scale.setScalar(0.2);
	pLight.castShadow = true;
	scene.add(pLight);

	// scene.add(new THREE.PointLightHelper(pLight));

	var sLight = new THREE.SpotLight();
	sLight.intensity = 0.3;
	sLight.angle = 0.5;
	sLight.penumbra = 0.8;
	sLight.position.set(0, 3, 4);
	sLight.rotation.set(0, 0, 0);
	// sLight.castShadow = true;
	sLight.shadowMapHeight = 2048;
	sLight.shadowMapWidth = 2048;
	scene.add(sLight);

	// var slightHelper = new THREE.SpotLightHelper(sLight);
	// scene.add(slightHelper)

	loader.load("./models/ore-gl.glb", function (gltf) {
		const mat = new THREE.MeshStandardMaterial();

		//table
		var table = gltf.scene.getObjectByName("table");
		const tableMat = new THREE.MeshStandardMaterial();
		tableMat.roughness = 1.0;
		table.material = tableMat;
		table.castShadow = true;
		table.receiveShadow = true;

		//keboard
		var keyboard = gltf.scene.getObjectByName("keyboard");
		const keyboardMat = new THREE.MeshStandardMaterial();
		keyboard.material = keyboardMat;
		keyboard.receiveShadow = true;
		keyboard.castShadow = true;
		keys = gltf.scene.getObjectByName("keys").children;
		keys.forEach((k) => {
			k.material = mat;
			k.castShadow = true;
		});

		sLight.target = keyboard;

		//mouse
		mouse = gltf.scene.getObjectByName("mouse");
		mouse.castShadow = true;
		var mouseMat = new THREE.MeshStandardMaterial();
		mouseMat.flatShading = false;
		mouseMat.metalness = 0.0;
		mouseMat.roughness = 0.5;
		mouse.material = mouseMat;

		//display_body
		var displayBody = gltf.scene.getObjectByName("display_body");
		var displayBodyMat = new THREE.MeshStandardMaterial();
		displayBodyMat.color = new THREE.Color(0xffffff);
		displayBodyMat.roughness = 0.5;
		displayBody.material = displayBodyMat;
		// displayBody.castShadow = true;

		//display
		displayUni = {
			time: { value: 0 },
		}
		var displayMat = new THREE.ShaderMaterial({
			vertexShader: standardVert,
			fragmentShader: displayFrag,
			uniforms: displayUni
		});
		display = gltf.scene.getObjectByName("display");
		display.material = displayMat;

		scene.add(gltf.scene);
	})

	// var planeGeo = new THREE.PlaneGeometry(50,50);
	// var planeMat = new THREE.MeshStandardMaterial();
	// planeMat.roughness = 1.0;
	// planeMat.emissive = new THREE.Color(0x888888);
	// var plane = new THREE.Mesh(planeGeo,planeMat);
	// plane.receiveShadow = true;
	// plane.position.set(0,0,0);
	// plane.rotateX(-Math.PI / 2);
	// scene.add(plane);

	window.scene = scene;
	window.THREE = THREE;

	resize();
}

function animate() {
	time += 0.1666;
	if (keys != null) {
		keys.forEach((k) => {
			k.position.y = Math.abs(Math.sin(time * 0.1 + k.id)) < 0.2 ? 0.0 : 0.008;
		});
	}

	if (display != null) {
		displayUni.time.value = time;
	}

	if (mouse != null) {
		var mTime = time * 0.2;
		mouse.position.add(new THREE.Vector3(Math.sin(mTime * 3) * 0.003, 0, Math.cos(mTime * 2.0) * 0.003))
	}

	pLight.intensity = 0.7 + Math.abs(Math.sin(time * 2) + Math.cos(time * 0.5) + Math.cos(time * 1.6)) / 3 * 0.3;
	renderer.render(scene, camera);
}

function mouseWheel(e) {
	// camera.position.z -= e.wheelDelta * 0.0003;
}

function resize() {
	width = window.innerWidth;
	height = window.innerHeight;

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	// // カメラのアスペクト比を正す
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}

function onTouch(pos) {
}

function getHitRayObj(pos) {
	var mouseX = pos.x;
	var mouseY = pos.y;

	mouseX = (mouseX / window.innerWidth) * 2 - 1;
	mouseY = -(mouseY / window.innerHeight) * 2 + 1;

	console.log(mouseX, mouseY);

	var pos = new THREE.Vector3(mouseX, mouseY, 1);
	pos.unproject(camera);

	var camWorldPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
	var ray = new THREE.Raycaster(camWorldPos, pos.sub(camWorldPos).normalize());

	var touched = ray.intersectObjects(scene.children, true);
	var obj;
	touched.forEach((n) => {
		if (n.object.name != "plane") {
			obj = n.object;
			return;
		}
	})

	return obj;
}

window.addEventListener("load", init);
window.addEventListener("resize", resize);

//タッチ系
window.addEventListener('touchstart', touchStart.bind(this));
window.addEventListener('touchmove', touchMove.bind(this), { passive: false });
window.addEventListener('touchend', touchEnd.bind(this));
window.addEventListener('mousedown', touchStart.bind(this));
window.addEventListener('mousemove', touchMove.bind(this));
window.addEventListener('mouseup', touchEnd.bind(this));
window.addEventListener('mousewheel', mouseWheel.bind(this));

function touchStart(e) {
	cursor.CursorDown(e);
}

function touchMove(e) {
	cursor.CursorMove(e);
	// e.preventDefault();
}

function touchEnd(e) {
	cursor.CursorUp(e);
}
