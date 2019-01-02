import '../style.scss';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import Cursor from './Cursor';
import ObjectController from './ObjectContoller';

//shaders
const standardVert = require("../shader/standard.vs");
const displayFrag = require("../shader/display.fs");

const planeVert = require("../shader/plane.vs");
const planeFrag = require("../shader/plane.fs");

const pcVert = require("../shader/pc.vs");
const pcFrag = require("../shader/pc.fs");

const ptclVert = require("../shader/particle.vs");
const ptclFrag = require("../shader/particle.fs");

var width = window.innerWidth;
var height = window.innerHeight;

var scene = new THREE.Scene();
var loader = new GLTFLoader();
var camera, renderer;

// var cameraBasePos  = new THREE.Vector3(0,2,7);
var cameraBasePos = new THREE.Vector3(0, 2, 8);
var cameraBaseRotate = new THREE.Vector3(-0.1, 0, 0);

var pcBasePos = new THREE.Vector3(0.3,0.3,0);
var pcBaseRotate = new THREE.Vector3(-0.1, 0, 0);
var cursor = new Cursor();
var time = 0;

//models
var keys;
var mouse;
var display;
var displayUni;
var planeUni;
var pcUni;
var particleUni;

//scroll
var scrollPos = 0;

function init() {
	cursor.tapEvent = onTouch.bind(this);

	// render
	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#canvas')
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

	var pLight = new THREE.PointLight();
	pLight.intensity = 1.0;
	pLight.position.set(-0.28, 1.44, -0.40);
	pLight.scale.setScalar(0.2);
	scene.add(pLight);

	var sLight = new THREE.SpotLight();
	sLight.intensity = 0.3;
	sLight.angle = 0.5;
	sLight.penumbra = 0.8;
	sLight.position.set(0, 3, 4);
	sLight.rotation.set(0, 0, 0);
	scene.add(sLight);

	loader.load("./models/ore-gl.glb", function (gltf) {

		pcUni = {
			time: { value: 0 }
		}
		var mat = new THREE.ShaderMaterial({
			vertexShader: pcVert,
			fragmentShader: pcFrag,
			uniforms: pcUni,
			depthTest: true,
			transparent: true
		});
		mat.wireframe = true;

		//table
		// var table = gltf.scene.getObjectByName("table");
		// table.material = mat;

		//keboard
		var keyboard = gltf.scene.getObjectByName("keyboard");
		keyboard.material = mat;

		keys = gltf.scene.getObjectByName("keys").children;
		keys.forEach((k) => {
			k.material = mat;
		});

		//mouse
		mouse = gltf.scene.getObjectByName("mouse");
		mouse.material = mat;

		//display_body
		var displayBody = gltf.scene.getObjectByName("display_body");
		displayBody.material = mat;
		displayBody.renderOrder = -1;

		//display
		displayUni = {
			time: { value: 0 },
		}
		var displayMat = new THREE.ShaderMaterial({
			vertexShader: standardVert,
			fragmentShader: displayFrag,
			uniforms: displayUni,
		});
		display = gltf.scene.getObjectByName("display");
		display.material = displayMat;

		gltf.scene.name = "model";
		gltf.scene.scale.setScalar(1.5);
		gltf.scene.position.copy(pcBasePos);
		gltf.scene.rotateX(0.2);
		scene.add(gltf.scene);
	})

	var planeGeo = new THREE.PlaneGeometry(20, 20, 50, 50);
	planeUni = {
		time: { value: 0 },
	}

	var planeMat = new THREE.ShaderMaterial({
		vertexShader: planeVert,
		fragmentShader: planeFrag,
		uniforms: planeUni,
		transparent: true,
	});

	planeMat.wireframe = true;
	var plane = new THREE.Mesh(planeGeo, planeMat);
	plane.position.set(0, 0.9, 0);
	plane.rotateX(-Math.PI / 2);
	plane.renderOrder = 1;
	scene.add(plane);

	var particleGeo = new THREE.Geometry();
	const ptcles = 500;
	const size = new THREE.Vector3(30, 50, 30);
	for (var i = 0; i < ptcles; i++) {
		particleGeo.vertices.push(
			new THREE.Vector3(
				Math.random() * size.x - size.x / 2,
				Math.random() * size.y - size.y / 2,
				Math.random() * size.z - size.z / 2,
			)
		);
	}

	particleUni = {
		time: {value: 0,}
	}
	var particleMat = new THREE.ShaderMaterial({
		vertexShader: ptclVert,
		fragmentShader: ptclFrag,
		uniforms: particleUni,
		depthTest: true,
		transparent : true
	});

	var particle = new THREE.Points(particleGeo,particleMat);
	particle.renderOrder = 2;
	scene.add(particle);

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

	if (pcUni != null) {
		pcUni.time.value = time;
	}

	if (mouse != null) {
		var mTime = time * 0.1;
		mouse.position.add(new THREE.Vector3(Math.sin(mTime * 3) * 0.003, 0, Math.cos(mTime * 2.0) * 0.003))
	}

	var model = scene.getObjectByName("model");
	if (model != null) {
		model.position.y = pcBasePos.y + Math.sin(time * 0.15) * 0.05;
	}

	planeUni.time.value = time;
	particleUni.time.value = time;


	camera.position.y = window.pageYOffset * -0.004 + cameraBasePos.y;

	renderer.render(scene, camera);
}

function mouseWheel(e) {
	// var movW = 0.0015;
	// if (e.wheelDelta < 0) {
	// 	camera.position.y += e.wheelDelta * movW;
	// } else {
	// 	if (camera.position.y < cameraBasePos.y) {
	// 		camera.position.y += e.wheelDelta * movW;
	// 	}
	// }

}

function scroll(e){
}

function resize() {
	width = window.innerWidth;
	height = document.getElementById("canvas-wrap").offsetHeight;

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	//カメラのアスペクト比を正す
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}

function onTouch(pos) {
}

function touchStart(e) {
	cursor.CursorDown(e);
}

function touchMove(e) {
	cursor.CursorMove(e);
}

function touchEnd(e) {
	cursor.CursorUp(e);
}
//タッチ系
window.addEventListener('touchstart', touchStart.bind(this));
window.addEventListener('touchmove', touchMove.bind(this), { passive: false });
window.addEventListener('touchend', touchEnd.bind(this));
window.addEventListener('mousedown', touchStart.bind(this));
window.addEventListener('mousemove', touchMove.bind(this));
window.addEventListener('mouseup', touchEnd.bind(this));
window.addEventListener('mousewheel', mouseWheel.bind(this));

window.addEventListener("load", init);
window.addEventListener("resize", resize);
window.addEventListener("scroll", scroll);