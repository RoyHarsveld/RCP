import * as THREE from 'three';
import * as INITVAR from './initThree.js';
import { steps } from '/src/index.js';
import { staircase } from '/src/index.js';
import { oldAmountOfSteps, currentAmountOfSteps, amountOfSteps } from '../index.js';


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

export function createMeshSteps(){

    var mesh = [], meshCounter = 0;
    // var step1Length = 1, step1Width =1 , step1Height=1, step1Angle=1;
    // var stepGeometry, geometryMaterial, targetMesh;

    /*mesh setup*/
    console.log("CREATING MESH STEPS");

    for (var meshCounter = 0; meshCounter < oldAmountOfSteps; meshCounter++){
        INITVAR._scene.remove(mesh[meshCounter]);
    }

    for (meshCounter = 0; meshCounter < currentAmountOfSteps; meshCounter++){
        
        mesh[meshCounter] = new THREE.Mesh( _boxGeometry, _material );

        //set scale  x(width), y(height), z(length)
        mesh[meshCounter].scale.x = steps[meshCounter].width / 100;
        mesh[meshCounter].scale.y = 30 / 100;
        mesh[meshCounter].scale.z = stepLength / 100;

        //set position
        mesh[meshCounter].position.x = 0;
        if (meshCounter == 0){
            mesh[meshCounter].position.y = stepHeight / 100;
            mesh[meshCounter].position.z = 0;
        } else {
            mesh[meshCounter].position.y = mesh[meshCounter -1].position.y + stepHeight / 100;  
            mesh[meshCounter].position.z = mesh[meshCounter -1].scale.z + mesh[meshCounter -1].position.z;
        }
        //mesh[meshCounter].position.z = 0;

        mesh[meshCounter].updateMatrix();
        mesh[meshCounter].matrixAutoUpdate = false;
        
        
        //add create steps
        INITVAR._scene.add( mesh[meshCounter] );
    }
}

export default OBJECT;