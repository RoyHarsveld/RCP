import * as THREE from 'three';
import * as INITVAR from './initThree.js';
import { steps } from '/src/index.js';
import { stepData } from '../index.js';
import { staircase } from '/src/index.js';
import { oldAmountOfSteps, currentAmountOfSteps, amountOfSteps } from '../index.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

var  stepMeshCounter = 0, railcounter = 0;
export var stepMesh = [], boxGeometry, railMaterial, stepMaterial, targetMesh, rollOverMesh, raycaster, pointer;

class GEOMETRY{
    constructor(){
        this.loader()
        this.geometry()
        this.material()
        this.mesh()
        this.rollOver()
        this.raycaster()
    }

    loader(){
        const objLoader = new OBJLoader();
        objLoader.load( 'models/rail.obj' , function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh){
                    child.material = railMaterial;
                    child.geometry.translate(45.15, 61.56, 0);
                    child.geometry.scale( 0.01, 0.01, 0.04 );
                }
            });
        staircase.rail = object;
        INITVAR.scene.add( staircase.rail );
        });
    }

    geometry(){
        boxGeometry = new THREE.BoxGeometry(1,1,1);               //create box geometry
        boxGeometry.translate( 0.5, 0.5, 0.5 );
    }

    material(){
        // const textureLoader = new THREE.TextureLoader();
        railMaterial = new THREE.MeshStandardMaterial( { 
            color: 0xffffff,
            emissive: 0x4c4c4c,
            roughness: 0.6, // between 0 and 1
            metalness: 0.8,   // between 0 and 1
        } );

        stepMaterial = new THREE.MeshLambertMaterial( { 
            // map: textureLoader.load('https://images.pexels.com/photos/301378/pexels-photo-301378.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'),
            color: 0x734624, 
        } );
    }

    mesh(){
        //targetmesh
        targetMesh = new THREE.Mesh( boxGeometry, stepMaterial );   //merge geometry and material into mesh
        targetMesh.geometry.computeBoundsTree();
        INITVAR.scene.add( targetMesh );

        //step
        staircase.step = new THREE.Mesh( boxGeometry, stepMaterial );
        staircase.step.geometry.computeBoundsTree();
        INITVAR.scene.add( staircase.step ); 

        // staircase.rail = new THREE.Mesh (boxGeometry, railMaterial);
        // staircase.rail.geometry.computeBoundsTree();
        // INITVAR.scene.add( staircase.rail );
    }

    rollOver(){
        const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
        const rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
        rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
        // INITVAR._scene.add( _rollOverMesh );    
    }

    raycaster(){
        raycaster = new THREE.Raycaster();
		pointer = new THREE.Vector2();
    }
}
export default GEOMETRY;

export function createSteps(){

    for (var i = 0; i < oldAmountOfSteps; i++){
        console.log("DELETING MESH STEPS");
        INITVAR.scene.remove( stepMesh[i] );
    }

    stepMesh.length = currentAmountOfSteps;
    for (stepMeshCounter = 0; stepMeshCounter < currentAmountOfSteps; stepMeshCounter++){
        stepMesh[stepMeshCounter] = new THREE.Mesh( boxGeometry, stepMaterial );

        //set scale  x(width), y(height), z(length)
        stepMesh[stepMeshCounter].scale.x = stepData[stepMeshCounter].width / 100;
        stepMesh[stepMeshCounter].scale.y = -0.3;
        // stepMesh[stepMeshCounter].scale.y = 0;
        stepMesh[stepMeshCounter].scale.z = stepData[stepMeshCounter].length / 100;

        //set position
        stepMesh[stepMeshCounter].position.x = 0;
        if (stepMeshCounter == 0){
            stepMesh[stepMeshCounter].position.y = stepData[stepMeshCounter].height / 100;
            stepMesh[stepMeshCounter].position.z = 0;
        } else {
            stepMesh[stepMeshCounter].position.y = stepMesh[stepMeshCounter -1].position.y + stepData[stepMeshCounter].height / 100;  
            stepMesh[stepMeshCounter].position.z = stepMesh[stepMeshCounter -1].scale.z + stepMesh[stepMeshCounter -1].position.z;
        }

        stepMesh[stepMeshCounter].updateMatrix();
        stepMesh[stepMeshCounter].matrixAutoUpdate = false;

        // console.log(stepMesh[stepMesh.length-1].position);
        
        //add create steps
        console.log("CREATING stepMesh STEPS!!!!");
        INITVAR.scene.add( stepMesh[stepMeshCounter] );


    }
}

export function createRails(){
    // console.log("CREATING RAILS");
    // INITVAR.scene.remove( staircase.rail);
    // staircase.rail = new THREE.Mesh (boxGeometry, material);
    console.log("CREATING RAILS");
    // Math.sqrt((stepMesh[stepMesh.length -1].position.y * stepMesh[stepMesh.length -1].position.y) + (stepMesh[stepMesh.length -1].position.z * stepMesh[stepMesh.length -1].position.z))

    staircase.rail.position.x = 90/100; //from the wall
    // staircase.rail.position.y = stepMesh[stepMesh.length -1].position.y; 
    staircase.rail.position.y = stepMesh[stepMesh.length -1].position.y + 0.03; 
    staircase.rail.position.z = stepMesh[stepMesh.length -1].position.z;

    // staircase.rail.scale.x = 91 / 100; //rail width
    // staircase.rail.scale.y = 110 / 100; //rail heigth

    var railAngle, railLength;
    railAngle = calculateRailAngle();
    railLength = calculateRailLength(railAngle);
    console.log("railLength: ", railLength);
    // var railLength = calcRailLength();
    // var railLength = Math.sqrt(((stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100)) * (stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100))) + (stepMesh[stepMesh.length -1].position.z * stepMesh[stepMesh.length -1].position.z));
    // var railLength = Math.sqrt(((stepMesh[stepMesh.length -1].position.y + ((stepData[0].height / 100) + (30 / 100)) ) * (stepMesh[stepMesh.length -1].position.y) - ((stepData[0].height / 100) + (30 / 100)) ) + ((stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100)) * (stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100))));
    staircase.rail.scale.z = -(railLength);
    
    // var railAngle = calcRailAngle(railLength);
    // var railAngle = Math.acos((stepMesh[stepMesh.length -1].position.z + ((stepData[0].length / 100) + (30 / 100))) / railLength)
    staircase.rail.rotation.x = -railAngle; //angle * PI / 180 for degrees, but its already in radians.
    // staircase.rail.rotation.x;
    staircase.rail.rotation.y;
    staircase.rail.rotation.z;

    staircase.rail.updateMatrix();
    // staircase.rail.matrixAutoUpdate = false;
    
    // INITVAR.scene.add( staircase.rail);
    // INITVAR.scene.add( staircase.rail);

    console.log("END OF RAILCONFIG, STEPMESHLENGTH", stepMesh.length);
}

// function calcRailLength(){
//     console.log('a ',(stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100)), '+ b ',stepMesh[stepMesh.length -1].position.y);
//     // return Math.sqrt( Math.pow( stepMesh[stepMesh.length -1].position.y + (30 / 100) , 2 ) + Math.pow( (stepMesh[stepMesh.length -1].position.z + stepData[0].length) / 100 , 2 ) )
//     return Math.sqrt( Math.pow( (stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100)), 2 ) + Math.pow( stepMesh[stepMesh.length -1].position.y, 2 ))
//     return Math.sqrt( Math.pow( (stepMesh[stepMesh.length -1].position.z + stepMesh[1].position.z), 2 ) + Math.pow( stepMesh[stepMesh.length -1].position.y, 2 ))
    
//     // return Math.sqrt(((stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100)) * (stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100))) + (stepMesh[stepMesh.length -1].position.z * stepMesh[stepMesh.length -1].position.z));
//     return Math.sqrt(((stepMesh[stepMesh.length -1].position.y + (30 / 100)) * (stepMesh[stepMesh.length -1].position.y + (30 / 100))) + ((stepMesh[stepMesh.length -1].position.z + stepData[0].length / 100) * (stepMesh[stepMesh.length -1].position.z + stepData[0].length / 100)));
// }

function calculateRailAngle(){
    var roundToNearest5 = x => Math.round(x/5)*5;
    var radians = Math.atan( stepMesh[stepMesh.length -1].position.y / ( stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100) ));
    var degrees = radians * 180 / Math.PI;
    console.log("railAngleDeg: ", degrees);
    console.log("railAngleDegRounded: ", roundToNearest5(degrees));
    return radians = roundToNearest5(degrees) * Math.PI / 180;
}

function calculateRailLength(railAngle){
    return stepMesh[stepMesh.length -1].position.y / Math.sin(railAngle);
    console.log("railLength: ", radians);
}


