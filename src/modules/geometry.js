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
}
export default GEOMETRY;

export function createSteps(){

    for (var i = 0; i < oldAmountOfSteps; i++){
        // console.log("DELETING MESH STEPS");
        INITVAR.scene.remove( stepMesh[i] );
    }

    stepMesh.length = currentAmountOfSteps;
    for (stepMeshCounter = 0; stepMeshCounter < currentAmountOfSteps; stepMeshCounter++){
        stepMesh[stepMeshCounter] = new THREE.Mesh( boxGeometry, stepMaterial );

        //set scale     x(width), y(height), z(length)
        stepMesh[stepMeshCounter].scale.x = stepData[stepMeshCounter].width / 100;
        stepMesh[stepMeshCounter].scale.y = -0.3; //dikte van de trede
        stepMesh[stepMeshCounter].scale.z = stepData[stepMeshCounter].length / 100;

        //set position
        stepMesh[stepMeshCounter].position.x = 0;
        if (stepMeshCounter == 0){
            stepMesh[stepMeshCounter].position.y = stepData[stepMeshCounter].height / 100;
            stepMesh[stepMeshCounter].position.z = stepData[stepMeshCounter].length / 100;
        } else {
            stepMesh[stepMeshCounter].position.y = stepMesh[stepMeshCounter -1].position.y + stepData[stepMeshCounter].height / 100;  
            stepMesh[stepMeshCounter].position.z = stepMesh[stepMeshCounter -1].scale.z + stepMesh[stepMeshCounter -1].position.z;
        }

        stepMesh[stepMeshCounter].updateMatrix();
        stepMesh[stepMeshCounter].matrixAutoUpdate = false;

        
        //add create steps
        // console.log("CREATING stepMesh STEPS!!!!");
        INITVAR.scene.add( stepMesh[stepMeshCounter] );
    }
}

export function createRails(){
    // console.log("CREATING RAILS");

    /*CALCULATE RAIL ANGLE*/
    var railAngle, railLength;

    var calcRailLength = x => stepMesh[stepMesh.length -1].position.y / Math.sin(x); //function to calculate the rail length
    var floorToNearest5 = x => Math.floor(x/5)*5;
    var roundToNearest5 = x => Math.round(x/5)*5;
    var ceilToNearest5 = x => Math.ceil(x/5)*5;

    var correctRadian, biggestRadian = 6.283, smallestRadian = 0, radians;
    var kromming = false, bolling = false, linear = false;


    var stairsDegr = ( Math.atan( stepMesh[stepMesh.length-1].position.y / ( stepMesh[stepMesh.length-1].position.z ) ) ) * 180 / Math.PI ; //for angle α
    var stairsRad =  Math.atan( stepMesh[stepMesh.length-1].position.y / ( stepMesh[stepMesh.length-1].position.z ) ) ; //for angle α
    console.log(" ");
    console.log("TotalStairsDegree: ", stairsDegr);

    var averageStepLength = ( stepMesh[stepMesh.length-1].position.z / currentAmountOfSteps * 100 ) ;
    // console.log("averageStepLength", averageStepLength);
    // console.log("stepMesh[stepMesh.length-1].position.z", stepMesh[stepMesh.length-1].position.z);
    // console.log("amountOfSteps", currentAmountOfSteps);

    for (var i = 0; i < stepMesh.length; i++){

        // var radians = Math.atan( stepData[i].height / stepData[i].length ); //for angle α
        // var radians = Math.atan( ( stepMesh[i].position.z ) / stepMesh[i].position.y); //for angle β
        
        radians = Math.atan( stepData[i].height / stepData[i].length );
        
        if (radians < biggestRadian){
            biggestRadian = radians;
        }
        
        if (radians > smallestRadian){
            smallestRadian = radians;
        }

        if (i > 0) {                                     
            if (stepData[i].length < stepData[i-1].length){         //hol, pak de trap angle: stairsrad
            //    stairsRad = Math.atan( stepMesh[stepMesh.length-1].position.y / ( stepMesh[stepMesh.length-1].position.z ) ) ;
            //    correctRadian = stairsRad;
            kromming = true;
            bolling = false;
            linear = false;
            
            //    break;
            }

            else if (stepData[i].length > stepData[i-1].length){    //bol, pak de meest voorkomende angle van de trap: 
                // radians = Math.atan( stepData[i].height / stepData[i].length );
                kromming = false;
                bolling = true;
                linear = false;
                // if ( radians > smallestRadian ){ //grootste hoek wordt opgeslagen
                    // correctRadian = radians; //correctradian = biggest 
                    // smallestRadian = radians;
                
            }

            else if (stepData[i].length == stepData[i-1].length){   //linear
                // radians = Math.atan( stepData[i].height / stepData[i].length );
                // if ( radians < biggestRadian ){ //kleinste hoek wordt opgeslagen
                    // biggestRadian = radians;
                    // correctRadian = radians;
                // kromming = false;
                // bolling = false;
                linear = true;
                    
            }
        }
        if (kromming == true){
            correctRadian = stairsRad;
            console.log("KROMMING");
        } else if (bolling == true){
            correctRadian = smallestRadian;
            console.log("BOLLING"); 
        } else {
            correctRadian = radians;
            console.log("LINEAR");
        }
        
    }
    // var degrees = (stairsRadian * 180 / Math.PI) ;
    var degrees = (correctRadian * 180 / Math.PI) ;
    console.log("   railAngleDeg: ", degrees, "railAngleDegfloored: ", floorToNearest5(degrees) );
    if (bolling = true || (degrees - floorToNearest5(degrees))  > (ceilToNearest5(degrees) - degrees)){
        railAngle = (ceilToNearest5(degrees) * Math.PI / 180);
        console.log("       Selected Rail Angle rounded: ", railAngle * 180 / Math.PI);

        railLength = stepMesh[stepMesh.length -1].position.y / Math.sin(railAngle);
        staircase.rail.position.y = 0.03; 
        staircase.rail.position.z = 0;
        staircase.rail.scale.z = (railLength);
        staircase.rail.rotation.x = -railAngle; //angle * PI / 180 for degrees, but its already in radians.

    } else {
        railAngle = (floorToNearest5(degrees) * Math.PI / 180);
        console.log("       Selected Rail Angle floored: ", railAngle * 180 / Math.PI);

        railLength = stepMesh[stepMesh.length -1].position.y / Math.sin(railAngle);
        staircase.rail.position.y = stepMesh[stepMesh.length -1].position.y + 0.03; 
        staircase.rail.position.z = stepMesh[stepMesh.length -1].position.z;
        staircase.rail.scale.z = -(railLength);
        staircase.rail.rotation.x = -railAngle; //angle * PI / 180 for degrees, but its already in radians.

    }

    railLength = stepMesh[stepMesh.length -1].position.y / Math.sin(railAngle); // voor boven naar benden

    staircase.rail.position.x = 90/100; //from the wall

    // console.log("railLength: ", railLength);
    // var railLength = calcRailLength();
    // var railLength = Math.sqrt(((stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100)) * (stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100))) + (stepMesh[stepMesh.length -1].position.z * stepMesh[stepMesh.length -1].position.z));
    // var railLength = Math.sqrt(((stepMesh[stepMesh.length -1].position.y + ((stepData[0].height / 100) + (30 / 100)) ) * (stepMesh[stepMesh.length -1].position.y) - ((stepData[0].height / 100) + (30 / 100)) ) + ((stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100)) * (stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100))));
    // staircase.rail.scale.z = -(railLength);
    
    // var railAngle = calcRailAngle(railLength);
    // var railAngle = Math.acos((stepMesh[stepMesh.length -1].position.z + ((stepData[0].length / 100) + (30 / 100))) / railLength)
    // staircase.rail.rotation.x = -railAngle; //angle * PI / 180 for degrees, but its already in radians.
    // staircase.rail.rotation.x;
    staircase.rail.rotation.y;
    staircase.rail.rotation.z;


    staircase.rail.updateMatrix();
    // staircase.rail.matrixAutoUpdate = false;
    
    // INITVAR.scene.add( staircase.rail);
    // INITVAR.scene.add( staircase.rail);

    // console.log("END OF RAILCONFIG, STEPMESHLENGTH", stepMesh.length);
}

// function calcRailLength(){
//     console.log('a ',(stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100)), '+ b ',stepMesh[stepMesh.length -1].position.y);
//     // return Math.sqrt( Math.pow( stepMesh[stepMesh.length -1].position.y + (30 / 100) , 2 ) + Math.pow( (stepMesh[stepMesh.length -1].position.z + stepData[0].length) / 100 , 2 ) )
//     return Math.sqrt( Math.pow( (stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100)), 2 ) + Math.pow( stepMesh[stepMesh.length -1].position.y, 2 ))
//     return Math.sqrt( Math.pow( (stepMesh[stepMesh.length -1].position.z + stepMesh[1].position.z), 2 ) + Math.pow( stepMesh[stepMesh.length -1].position.y, 2 ))
    
//     // return Math.sqrt(((stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100)) * (stepMesh[stepMesh.length -1].position.y - (stepData[0].height / 100))) + (stepMesh[stepMesh.length -1].position.z * stepMesh[stepMesh.length -1].position.z));
//     return Math.sqrt(((stepMesh[stepMesh.length -1].position.y + (30 / 100)) * (stepMesh[stepMesh.length -1].position.y + (30 / 100))) + ((stepMesh[stepMesh.length -1].position.z + stepData[0].length / 100) * (stepMesh[stepMesh.length -1].position.z + stepData[0].length / 100)));
// }

// function calculateRailAngle(){
//     //function to round down to 5. 34 becomes 30, 28 becomes 25.
//     var roundToNearest5 = x => Math.floor(x/5)*5;
    
//     //calc the radians and convert it to degrees to be able to round down.
//     var radians = Math.atan( stepMesh[stepMesh.length -1].position.y / ( stepMesh[stepMesh.length -1].position.z + (stepData[0].length / 100) ));
//     var degrees = radians * 180 / Math.PI;
//     console.log("railAngleDeg: ", degrees);
//     console.log("railAngleDegRounded: ", roundToNearest5(degrees));
    
//     //return the radians because Math library calculates in radians.
//     return radians = roundToNearest5(degrees) * Math.PI / 180;
// }

// function calculateRailAngle(){
//     //function to round down to 5. 34 becomes 30, 28 becomes 25.
//     var roundToNearest5 = x => Math.round(x/5)*5;
//     var correctRadian = 7;

//     var stairsDegr = ( Math.atan( stepMesh[stepMesh.length-1].position.y / ( stepMesh[stepMesh.length-1].position.z ) ) ) * 180 / Math.PI ; //for angle α
//     var stairsRad =  Math.atan( stepMesh[stepMesh.length-1].position.y / ( stepMesh[stepMesh.length-1].position.z ) ) ; //for angle α
//     console.log("TotalStairsDegree: ", stairsDegr);

//     var averageStepLength = ( stepMesh[stepMesh.length-1].position.z / currentAmountOfSteps * 100 ) ;
//     console.log("averageStepLength", averageStepLength);
//     console.log("stepMesh[stepMesh.length-1].position.z", stepMesh[stepMesh.length-1].position.z);
//     console.log("amountOfSteps", currentAmountOfSteps);

//     for (var i = 0; i < stepMesh.length; i++){

//         // var radians = Math.atan( stepData[i].height / stepData[i].length ); //for angle α
//         // var radians = Math.atan( ( stepMesh[i].position.z ) / stepMesh[i].position.y); //for angle β
        
//         if (i > 0) {                                     
//             if (stepData[i].length < stepData[i-1].length){     //kromming
//                correctRadian = Math.atan( stepMesh[stepMesh.length-1].position.y / ( stepMesh[stepMesh.length-1].position.z ) ) ;
//                console.log("KROMMING")
//                break;
//             }

//             else if (stepData[i].length >= stepData[i-1].length){    //linear
//                 var radians = Math.atan( stepData[i].height / stepData[i].length );
//                 if (radians < correctRadian){
//                     correctRadian = radians;
//                     console.log("step with smallest angle: ", i+1);
//                 }
//             }
//         }
//     }
    
//     // var degrees = (stairsRadian * 180 / Math.PI) ;
//     var degrees = (correctRadian * 180 / Math.PI) ;

//     console.log("railAngleDeg: ", degrees, "railAngleDegRounded: ", roundToNearest5(degrees) );

//     return (roundToNearest5(degrees) * Math.PI / 180);    
//     // return degrees * Math.PI / 180;    
// }

// function calculateRailLength(railAngle){
//     return stepMesh[stepMesh.length -1].position.y / Math.sin(railAngle);
//     console.log("railLength: ", radians);
// }


