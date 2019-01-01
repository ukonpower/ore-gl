import '../style.scss';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import Cursor from './Cursor';
import ObjectController from './ObjectContoller';
import CSS3D from 'three-css3drenderer';

var camera, renderer;
var container;
var width = window.innerWidth;
var height = window.innerHeight;

var scene = new THREE.Scene();
var loader = new GLTFLoader();

var cameraBasePos  = new THREE.Vector3(0,1,5);
var cameraBaseRotate = new THREE.Vector3(-0.1,0,0);

var cursor = new Cursor();

function init() {
	cursor.tapEvent = onTouch.bind(this);

	// render
	renderer = new THREE.WebGLRenderer({
		canvas: document.querySelector('#canvas'),
		antialias: true
	});
	renderer.animate(animate.bind(this));

	scene.background = new THREE.Color(0x000000);

	//camera
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
	camera.name = "camera";
	camera.position.copy(cameraBasePos);
	camera.rotation.setFromVector3(cameraBaseRotate);
	scene.add(camera);

	//light
	var light = new THREE.DirectionalLight(0xFFFFFF, 1);
	light.position.set(5,5,-5);
	light.rotation.set(Math.PI / 4,Math.PI / 4,0);
	scene.add(light);

	light = new THREE.AmbientLight();
	scene.add(light);

	var boxGeo = new THREE.BoxGeometry(1,1,1);
	var mat = new THREE.MeshStandardMaterial({color:0xffffff});
	var box = new THREE.Mesh(boxGeo,mat);
	box.name = "box";

	scene.add(box);

	window.scene = scene;
	window.THREE = THREE;	

	resize();
}

function animate(){
	renderer.render(scene, camera);
}

function mouseWheel(e){
	// camera.position.z -= e.wheelDelta * 0.0003;
}

function resize(){
	width = window.innerWidth;
	height = window.innerHeight;

	// renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	// カメラのアスペクト比を正す
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
}

function onTouch(pos){
}

function getHitRayObj(pos) {
	var mouseX = pos.x;
	var mouseY = pos.y;

	mouseX = (mouseX / window.innerWidth) * 2 - 1;
	mouseY = -(mouseY / window.innerHeight) * 2 + 1;

	console.log(mouseX,mouseY);
	
	var pos = new THREE.Vector3(mouseX, mouseY, 1);
	pos.unproject(camera);

	var camWorldPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
	var ray = new THREE.Raycaster(camWorldPos, pos.sub(camWorldPos).normalize());

	var touched = ray.intersectObjects(scene.children,true);
	var obj;
	touched.forEach((n) => {
		if (n.object.name != "plane") {
			obj = n.object;
			return;
		}
	})
	
	return obj;
}

window.addEventListener("load",init);
window.addEventListener("resize",resize);

//タッチ系
window.addEventListener('touchstart',touchStart.bind(this));
window.addEventListener('touchmove',touchMove.bind(this),{passive: false});
window.addEventListener('touchend',touchEnd.bind(this));
window.addEventListener('mousedown',touchStart.bind(this));
window.addEventListener('mousemove',touchMove.bind(this));
window.addEventListener('mouseup',touchEnd.bind(this));
window.addEventListener('mousewheel',mouseWheel.bind(this));

function touchStart(e){
	cursor.CursorDown(e);
}

function touchMove(e){
	cursor.CursorMove(e);
	// e.preventDefault();
}

function touchEnd(e){
	cursor.CursorUp(e);
}
