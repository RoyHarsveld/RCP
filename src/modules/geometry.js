import * as THREE from 'three';
import * as INITVAR from './initThree.js';
import { steps } from '/src/index.js';
import { stepData } from '../index.js';
import { staircase } from '/src/index.js';
import { oldAmountOfSteps, currentAmountOfSteps, amountOfSteps } from '../index.js';

var mesh = [], meshCounter = 0;
export var _boxGeometry, _material, _targetMesh;

class OBJECT{
    constructor(){
        this.geometry()
        this.material()
        this.mesh()
    }

    geometry(){
        _boxGeometry = new THREE.BoxGeometry(1,1,1);               //create box geometry
        _boxGeometry.translate( 0.5, 0.5, 0.5 );
    }

    material(){
        _material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    }

    mesh(){
        _targetMesh = new THREE.Mesh( _boxGeometry, _material );   //merge geometry and material into mesh
        _targetMesh.geometry.computeBoundsTree();
        INITVAR._scene.add( _targetMesh );

        staircase.sphere = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 50, 50 ), _material );
        INITVAR._scene.add( staircase.sphere );
    
        staircase.step = new THREE.Mesh( _boxGeometry, _material );
        INITVAR._scene.add( staircase.step );
    }
}
export default OBJECT;

export function createMeshSteps(){

    for (var i = 0; i < oldAmountOfSteps; i++){
        console.log("DELETING MESH STEPS");
        INITVAR._scene.remove( mesh[i] );
    }

    for (meshCounter = 0; meshCounter < currentAmountOfSteps; meshCounter++){
        mesh[meshCounter] = new THREE.Mesh( _boxGeometry, _material );

        //set scale  x(width), y(height), z(length)
        mesh[meshCounter].scale.x = stepData[meshCounter].width / 100;
        mesh[meshCounter].scale.y = 30 / 100;
        mesh[meshCounter].scale.z = stepData[meshCounter].length / 100;

        //set position
        mesh[meshCounter].position.x = 0;
        if (meshCounter == 0){
            mesh[meshCounter].position.y = stepData[meshCounter].height / 100;
            mesh[meshCounter].position.z = 0;
        } else {
            mesh[meshCounter].position.y = mesh[meshCounter -1].position.y + stepData[meshCounter].height / 100;  
            mesh[meshCounter].position.z = mesh[meshCounter -1].scale.z + mesh[meshCounter -1].position.z;
        }
        //mesh[meshCounter].position.z = 0;

        mesh[meshCounter].updateMatrix();
        mesh[meshCounter].matrixAutoUpdate = false;
        
        
        //add create steps
        console.log("CREATING MESH STEPS!!!!");
        INITVAR._scene.add( mesh[meshCounter] );
    }
}

