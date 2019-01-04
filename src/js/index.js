import '../style.scss';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import Cursor from './Cursor';
import ObjectController from './ObjectContoller';
import WebFont from 'webfontloader';

//shaders
const standardVert = require("../shader/standard.vs");
const displayFrag = require("../shader/display.fs");

const planeVert = require("../shader/plane.vs");
const planeFrag = require("../shader/plane.fs");

const pcVert = require("../shader/pc.vs");
const pcFrag = require("../shader/pc.fs");

const ptclVert = require("../shader/particle.vs");
const ptclFrag = require("../shader/particle.fs");
const ptclLineFrag = require("../shader/particleLine.fs");
const ptclLineVert = require("../shader/particleLine.vs");

const arrowVert = require("../shader/arrow.vs");
const whiteFrag = require("../shader/white.fs");

var width = window.innerWidth;
var height = window.innerHeight;

var scene = new THREE.Scene();
var loader = new GLTFLoader();
var camera, renderer;

// var cameraBasePos  = new THREE.Vector3(0,2,7);
var cameraBasePos = new THREE.Vector3(0, 2, 8);
var cameraBaseRotate = new THREE.Vector3(-0.1, 0, 0);

var pcBasePos = new THREE.Vector3(0.3, -0.0, 0);
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
var arrowUni1;
var arrowUni2;

//scroll
var scrollPos = 0;


function init() {

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

	createPlane();

	loadModels();

	createParticle();

	createArrow();

	resize();

	window.scene = scene;
	window.THREE = THREE;
	document.querySelector('.load').classList.add('hide');
}

function loadModels(){
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

		var displayCanvas = document.createElement('canvas');
		displayCanvas.width = 960;
		displayCanvas.height = 540;

		var ctx = displayCanvas.getContext('2d');
		ctx.font = "bold 200px battleslab, sans-serif";
		// ctx.font = "normal 200px alpine-script";

		ctx.fillStyle  = 'rgb(255, 255, 255)';
		ctx.fillText("Ore-GL",70,340);

		var dispTex = new THREE.Texture(displayCanvas);
		dispTex.needsUpdate = true;

		//display
		displayUni = {
			time: { value: 0 },
			texture: {type:"t" ,value: dispTex},
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
}

function createPlane(){
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
	plane.position.set(0, 0.0, 0);
	plane.rotateX(-Math.PI / 2);
	plane.renderOrder = 1;
	scene.add(plane);
}

function createArrow(){
	var arrowGeo = new THREE.Geometry();
	arrowGeo.vertices.push(
		new THREE.Vector3(-1.0,1.0,0.0),
		new THREE.Vector3(1.0,1.0,0.0),
		new THREE.Vector3(0.0,-0.5,0.0),
	)
	arrowGeo.faces.push(
		new THREE.Face3(2,1,0)
	)

	arrowUni1 = {
		time: {value: 0},
		offset: {value: 0},
	}
	arrowUni2 = {
		time: {value: 0},
		offset: {value: 1},
	}
	var arrowMat1 = new THREE.ShaderMaterial({
		vertexShader: arrowVert,
		fragmentShader: whiteFrag,
		uniforms:arrowUni1
	});

	var arrowMat2 = new THREE.ShaderMaterial({
		vertexShader: arrowVert,
		fragmentShader: whiteFrag,
		uniforms:arrowUni2
	});

	var arrow = new THREE.Mesh(arrowGeo,arrowMat1);
	arrow.scale.setScalar(0.06);
	arrow.position.set(0,0.8,3.5);
	arrow.name = "arrow";
	scene.add(arrow);

	var arrow2 = arrow.clone();
	arrow2.material = arrowMat2;
	arrow2.position.y -= 0.15;
	scene.add(arrow2);
}

function createParticle(){
	var rectParticleGeo = new THREE.Geometry();
	var lineParticleGeo = new THREE.Geometry();
	const size = new THREE.Vector3(30, 50, 30);
	for (var i = 0; i < 100; i++) {
		rectParticleGeo.vertices.push(
			new THREE.Vector3(
				Math.random() * size.x - size.x / 2,
				Math.random() * size.y - size.y / 2,
				Math.random() * size.z - size.z / 2,
			)
		);
	}

	for(var i = 0; i < 50; i++){
		lineParticleGeo.vertices.push(
			new THREE.Vector3(
				Math.random() * size.x - size.x / 2,
				Math.random() * size.y - size.y / 2,
				Math.random() * size.z - size.z / 2,
			)
		);
	}

	particleUni = {
		time: { value: 0 }
	}
	var rectParticleMat = new THREE.ShaderMaterial({
		vertexShader: ptclVert,
		fragmentShader: ptclFrag,
		uniforms: particleUni,
		depthTest: true,
		transparent: true
	});

	var lineParticleMat = new THREE.ShaderMaterial({
		vertexShader: ptclLineVert,
		fragmentShader: ptclLineFrag,
		uniforms: particleUni,
		depthTest: true,
		transparent: true
	});

	var rectParticle = new THREE.Points(rectParticleGeo, rectParticleMat);
	rectParticle.renderOrder = 2;
	scene.add(rectParticle);

	var lineParticle = new THREE.Points(lineParticleGeo, lineParticleMat);
	lineParticle.renderOrder = 3;
	scene.add(lineParticle);
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
	arrowUni1.time.value = time;
	arrowUni2.time.value = time;
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

function scroll(e) {
	var items = document.getElementsByClassName('content-list-item');

	for(var i = 0; i < items.length;i ++){
		const top = items[i].getBoundingClientRect().top + window.pageYOffset;
		if(top < window.pageYOffset + window.innerHeight / 5 * 4){
			items[i].classList.add("active");
		}
	}
}

function resize() {
	width = window.innerWidth;
	height = document.getElementById("canvas-wrap").clientHeight;

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	//カメラのアスペクト比を正す
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
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

document.querySelector('.header-about').addEventListener("click",()=>{
	document.querySelector('.about').classList.add('show');
})

document.querySelector('.about-back-wrap').addEventListener("click",()=>{
	document.querySelector('.about').classList.remove('show');
})

//タッチ系
window.addEventListener('touchstart', touchStart.bind(this));
window.addEventListener('touchmove', touchMove.bind(this), { passive: false });
window.addEventListener('touchend', touchEnd.bind(this));
window.addEventListener('mousedown', touchStart.bind(this));
window.addEventListener('mousemove', touchMove.bind(this));
window.addEventListener('mouseup', touchEnd.bind(this));
window.addEventListener('mousewheel', mouseWheel.bind(this));

window.addEventListener("load", ()=>{
	WebFont.load({
		typekit: {
			id: 'xcw8thg'
		},
		custom :{
			families:["battleslab"],
		},
		fontactive: function(font_family, font_variation_description)
		{
			if(font_family == "battleslab"){
				init();
			}	
		}
	});
});
window.addEventListener("resize", resize);
window.addEventListener("scroll", scroll);