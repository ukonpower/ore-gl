import * as THREE from 'three';

export default class ObjectController {

    constructor(object) {
        this.object = object;
        
        this.defaultSize = this.object.scale.clone();
        this.defaultPosition = this.object.position.clone();
        this.defaultRotation = this.object.rotation.clone().toVector3();

        this.baseRotation = new THREE.Vector3(0,0,0);
        this.goalRotation = new THREE.Vector3(0,0,0);
        this.currentRotation = this.object.rotation;

        this.basePosition = new THREE.Vector3(0,0,0);
        this.goalPosition = new THREE.Vector3(0,0,0);
        this.currentPosition = this.object.position;

        this.baseSize =  new THREE.Vector3(0,0,0);
        this.goalSize =  new THREE.Vector3(0,0,0);
        this.currentSize = object.scale;

        this.rotateDistance = new THREE.Vector3(0,0,0);
        this.moveDistance = new THREE.Vector3(0,0,0);
        this.sizeDistance = new THREE.Vector3(0,0,0);

        this.rotTime = 1;
        this.posTime = 1;
        this.sizeTime = 1;

        this.timeDelta = 0.01;

        this._moving = false;
    }
    
    set delta(value){
        if(value > 0) this.timeDelta = value;
        else this.timeDelta = 0.01;
    }

    sigmoid(a, x) {
        var e1 = Math.exp(-a * (2 * x - 1));
        var e2 = Math.exp(-a);
        return (1 + (1 - e1) / (1 + e1) * (1 + e2) / (1 - e2)) / 2;
    }

    move(goal){
        this.basePosition = this.currentPosition.clone();
        this.goalPosition = goal.clone();
        this.moveDistance = this.goalPosition.sub(this.basePosition);
        this.posTime = 0;
    }

    sizeChange(size){
        this.baseSize = this.currentSize.clone();
        this.goalSize = size.clone();
        this.sizeDistance = this.goalSize.sub(this.baseSize);
        this.sizeTime = 0;
    }

    rotate(rot){
        this.baseRotation = this.currentRotation.clone();
        this.goalRotation = rot.clone();
        this.rotateDistance = this.goalRotation.sub(this.baseRotation);
        this.rotTime = 0;
    }

    rotateIndex(index, length) {
        var rad = Math.PI * 2;
        this.currentRotation %= rad;
        this.baseRotation = this.currentRotation;
        this.goalRotation = -rad * index / length;

        this.rotateDistance = this.goalRotation - this.currentRotation
        this.rotTime = 0;
    }

    reset(){
        this.move(this.defaultPosition);
        this.sizeChange(this.defaultSize);
        this.rotate(this.defaultRotation)
    }

    update() {
        if (this.rotTime < 1) {
            this.rotTime += this.timeDelta;
			var rw = this.sigmoid(6, this.rotTime);
			this.currentRotation.setFromVector3( new THREE.Vector3().addVectors(this.baseRotation,new THREE.Vector3().multiplyVectors(this.rotateDistance,new THREE.Vector3(rw,rw,rw))));
        }

        if (this.posTime < 1) {
			this.posTime += this.timeDelta;
			var w = this.sigmoid(6, this.posTime);
			this.currentPosition.copy(new THREE.Vector3().addVectors(this.basePosition,new THREE.Vector3().multiplyVectors(this.moveDistance,new THREE.Vector3(w,w,w))));
        }
        
        if (this.sizeTime < 1) {
            this.sizeTime += this.timeDelta;
            var sw = this.sigmoid(6, this.sizeTime);
			this.currentSize.copy(new THREE.Vector3().addVectors(this.baseSize,new THREE.Vector3().multiplyVectors(this.sizeDistance,new THREE.Vector3(sw,sw,sw))));
        } 
    }

    get moving(){
        if(this.rotTime >= 1 && this.posTime >= 1 && this.sizeTime >= 1) return false;
        else return true;
    }

}