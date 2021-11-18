import * as THREE from 'three';
import * as INITVAR from './initThree.js';
import { steps } from '/src/index.js';
import { stepData } from '../index.js';
import { staircase } from '/src/index.js';
import { oldAmountOfSteps, currentAmountOfSteps, amountOfSteps } from '../index.js';

var  meshCounter = 0, railcounter = 0;


export var mesh = [], _boxGeometry, _material, _targetMesh, _rollOverMesh, _raycaster, _pointer;

class OBJECT{
    constructor(){
        this.geometry()
        this.material()
        this.mesh()
        this.rollOver()
        this.raycaster()
    }

    geometry(){
        _boxGeometry = new THREE.BoxGeometry(1,1,1);               //create box geometry
        _boxGeometry.translate( 0.5, 0.5, 0.5 );
    }

    material(){
        _material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    }

    mesh(){
        //targetmesh
        _targetMesh = new THREE.Mesh( _boxGeometry, _material );   //merge geometry and material into mesh
        _targetMesh.geometry.computeBoundsTree();
        INITVAR._scene.add( _targetMesh );

        //sphere
        staircase.sphere = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 50, 50 ), _material );
        INITVAR._scene.add( staircase.sphere );
        //step
        staircase.step = new THREE.Mesh( _boxGeometry, _material );
        INITVAR._scene.add( staircase.step ); 
    }

    rollOver(){
        const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
        const rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
        _rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
        // INITVAR._scene.add( _rollOverMesh );    
    }

    raycaster(){
        _raycaster = new THREE.Raycaster();
		_pointer = new THREE.Vector2();
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

        console.log(mesh[mesh.length-1].position);
        
        //add create steps
        console.log("CREATING MESH STEPS!!!!");
        INITVAR._scene.add( mesh[meshCounter] );


    }
}

export function createRails(){
    // console.log("CREATING RAILS")
    //rail
    staircase.rail = new THREE.Mesh (_boxGeometry, _material);

    // Math.sqrt((mesh[mesh.length -1].position.y * mesh[mesh.length -1].position.y) + (mesh[mesh.length -1].position.z * mesh[mesh.length -1].position.z))

    staircase.rail.position.x = 90/100;
    staircase.rail.position.y = mesh[mesh.length -1].position.y + (30 / 100); 
    staircase.rail.position.z = mesh[mesh.length -1].position.z;

    staircase.rail.scale.x;
    staircase.rail.scale.y;
    var railLength = Math.sqrt(((mesh[mesh.length -1].position.y - (stepData[0].height / 100)) * (mesh[mesh.length -1].position.y - (stepData[0].height / 100))) + (mesh[mesh.length -1].position.z * mesh[mesh.length -1].position.z));
    staircase.rail.scale.z = -railLength;
    console.log("railLength: ",railLength);
    
    var railAngle = Math.acos(22 / 27.5);   //Math.acos(mesh[mesh.length -1].position.z / railLength)
    console.log("railAngle: ",railAngle); //(90 - (Math.asin(mesh[mesh.length -1].position.z / railLength))) * Math.PI / 180
    staircase.rail.rotation.x = -railAngle; //angle * PI / 180
    staircase.rail.rotation.y;
    staircase.rail.rotation.z;

    INITVAR._scene.add( staircase.rail);
}

