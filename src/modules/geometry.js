import * as THREE from 'three';
import * as INITVAR from './initThree.js';
// import { steps } from '/src/index.js';
// import { stepData } from '../index.js';
import { staircase } from '/src/index.js';
import { oldAmountOfSteps, currentAmountOfSteps} from '../index.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// var  stepCounter = 0, railcounter = 0;
var boxGeometry, railMaterial, stepMaterial, targetMesh, rollOverMesh, raycaster, pointer;

class GEOMETRY{
    constructor(){
        this.boxGeometry

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

export function createSteps(stepData){
    var stepCounter;
    for (var i = 0; i < oldAmountOfSteps; i++){
        // console.log("DELETING MESH STEPS");
        INITVAR.scene.remove( staircase.step[i] );
    }

    staircase.step.length = currentAmountOfSteps;
    for (stepCounter = 0; stepCounter < currentAmountOfSteps; stepCounter++){
        staircase.step[stepCounter] = new THREE.Mesh( boxGeometry, stepMaterial );

        //set scale     x(width), y(height), z(length)
        staircase.step[stepCounter].scale.x = stepData[stepCounter].width / 100;
        staircase.step[stepCounter].scale.y = -0.3; //dikte van de trede
        staircase.step[stepCounter].scale.z = stepData[stepCounter].length / 100;

        //set position
        staircase.step[stepCounter].position.x = 0;
        if (stepCounter == 0){
            staircase.step[stepCounter].position.y = stepData[stepCounter].height / 100;
            staircase.step[stepCounter].position.z = stepData[stepCounter].length / 100;
        } else {
            staircase.step[stepCounter].position.y = staircase.step[stepCounter -1].position.y + stepData[stepCounter].height / 100;  
            staircase.step[stepCounter].position.z = staircase.step[stepCounter -1].scale.z + staircase.step[stepCounter -1].position.z;
        }

        staircase.step[stepCounter].updateMatrix();
        staircase.step[stepCounter].matrixAutoUpdate = false;

        
        //add create steps
        // console.log("CREATING staircase.step STEPS!!!!");
        INITVAR.scene.add( staircase.step[stepCounter] );
    }
}

export function createRails(stepData){
    // console.log("CREATING RAILS");

    /*CALCULATE RAIL ANGLE*/
    var railAngle, railLength;

    var calcRailLength = x => staircase.step[staircase.step.length -1].position.y / Math.sin(x); //function to calculate the rail length
    var floorToNearest5 = x => Math.floor(x/5)*5;
    var roundToNearest5 = x => Math.round(x/5)*5;
    var ceilToNearest5 = x => Math.ceil(x/5)*5;

    var correctRadian, biggestRadian = 0, smallestRadian = 6.283, radians;
    var kromming = false, bolling = false, linear = false;


    var stairsDegr = ( Math.atan( staircase.step[staircase.step.length-1].position.y / ( staircase.step[staircase.step.length-1].position.z ) ) ) * 180 / Math.PI ; //for angle α
    var stairsRad =  Math.atan( staircase.step[staircase.step.length-1].position.y / ( staircase.step[staircase.step.length-1].position.z ) ) ; //for angle α
    console.log(" ");
    console.log("TotalStairsDegree: ", stairsDegr);

    var averageStepLength = ( staircase.step[staircase.step.length-1].position.z / currentAmountOfSteps * 100 ) ;
    // console.log("averageStepLength", averageStepLength);
    // console.log("staircase.step[staircase.step.length-1].position.z", staircase.step[staircase.step.length-1].position.z);
    // console.log("amountOfSteps", currentAmountOfSteps);

    for (var i = 0; i < staircase.step.length; i++){

        // var radians = Math.atan( stepData[i].height / stepData[i].length ); //for angle α
        // var radians = Math.atan( ( staircase.step[i].position.z ) / staircase.step[i].position.y); //for angle β
        
        radians = Math.atan( stepData[i].height / stepData[i].length );
        // 5 < 6 6=5
        if (radians > biggestRadian){
            biggestRadian = radians;
            console.log("Biggest Step Angle: ", biggestRadian * 180 / Math.PI, "Step: ", i);
        }
        
        if (radians < smallestRadian){
            smallestRadian = radians;
            console.log("Smallest Step Angle: ", smallestRadian * 180 / Math.PI, "Step: ", i);
        }

        if (i > 0) {                                     
            if (stepData[i].length < stepData[i-1].length){         //hol, pak de trap angle: stairsrad
            //    stairsRad = Math.atan( staircase.step[staircase.step.length-1].position.y / ( staircase.step[staircase.step.length-1].position.z ) ) ;
            //    correctRadian = stairsRad;
            kromming = true;
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
            if (stairsRad < biggestRadian){
                correctRadian = stairsRad;
            } else {
                correctRadian = biggestRadian;
            }
            console.log("KROMMING");

        } else if (bolling == true){
            correctRadian = biggestRadian;
            console.log("BOLLING"); 
        } else {
            correctRadian = radians;
            console.log("LINEAR");
        }
        
    }
    // var degrees = (stairsRadian * 180 / Math.PI) ;
    var degrees = (correctRadian * 180 / Math.PI) ;
    console.log("   railAngleDeg: ", degrees, "railAngleDegfloored: ", floorToNearest5(degrees) );

    if ( ((degrees - floorToNearest5(degrees))  > (ceilToNearest5(degrees) - degrees))){
        
        railAngle = (ceilToNearest5(degrees) * Math.PI / 180);
        console.log("       Selected Rail Angle rounded: ", railAngle * 180 / Math.PI);

        railLength = staircase.step[staircase.step.length -1].position.y / Math.sin(railAngle);
        staircase.rail.position.y = staircase.step[0].position.y - staircase.step[0].position.y + 0.03; 
        staircase.rail.position.z = staircase.step[0].position.z - staircase.step[0].position.z;
        staircase.rail.scale.z = (railLength);
        staircase.rail.rotation.x = -railAngle; //angle * PI / 180 for degrees, but its already in radians.

    } else {
        
        railAngle = (floorToNearest5(degrees) * Math.PI / 180);
        console.log("       Selected Rail Angle floored: ", railAngle * 180 / Math.PI);

        railLength = staircase.step[staircase.step.length -1].position.y / Math.sin(railAngle);
        staircase.rail.position.y = staircase.step[staircase.step.length -1].position.y + 0.03; 
        staircase.rail.position.z = staircase.step[staircase.step.length -1].position.z;
        staircase.rail.scale.z = -(railLength);
        staircase.rail.rotation.x = -railAngle; //angle * PI / 180 for degrees, but its already in radians.

    }

    railLength = staircase.step[staircase.step.length -1].position.y / Math.sin(railAngle); // voor boven naar benden

    staircase.rail.position.x = 90/100; //from the wall

    // console.log("railLength: ", railLength);
    // var railLength = calcRailLength();
    // var railLength = Math.sqrt(((staircase.step[staircase.step.length -1].position.y - (stepData[0].height / 100)) * (staircase.step[staircase.step.length -1].position.y - (stepData[0].height / 100))) + (staircase.step[staircase.step.length -1].position.z * staircase.step[staircase.step.length -1].position.z));
    // var railLength = Math.sqrt(((staircase.step[staircase.step.length -1].position.y + ((stepData[0].height / 100) + (30 / 100)) ) * (staircase.step[staircase.step.length -1].position.y) - ((stepData[0].height / 100) + (30 / 100)) ) + ((staircase.step[staircase.step.length -1].position.z + (stepData[0].length / 100)) * (staircase.step[staircase.step.length -1].position.z + (stepData[0].length / 100))));
    // staircase.rail.scale.z = -(railLength);
    
    // var railAngle = calcRailAngle(railLength);
    // var railAngle = Math.acos((staircase.step[staircase.step.length -1].position.z + ((stepData[0].length / 100) + (30 / 100))) / railLength)
    // staircase.rail.rotation.x = -railAngle; //angle * PI / 180 for degrees, but its already in radians.
    // staircase.rail.rotation.x;
    staircase.rail.rotation.y;
    staircase.rail.rotation.z;


    staircase.rail.updateMatrix();
    // staircase.rail.matrixAutoUpdate = false;
    
    // INITVAR.scene.add( staircase.rail);
    // INITVAR.scene.add( staircase.rail);

    // console.log("END OF RAILCONFIG, staircase.stepLENGTH", staircase.step.length);
}

// function calcRailLength(){
//     console.log('a ',(staircase.step[staircase.step.length -1].position.z + (stepData[0].length / 100)), '+ b ',staircase.step[staircase.step.length -1].position.y);
//     // return Math.sqrt( Math.pow( staircase.step[staircase.step.length -1].position.y + (30 / 100) , 2 ) + Math.pow( (staircase.step[staircase.step.length -1].position.z + stepData[0].length) / 100 , 2 ) )
//     return Math.sqrt( Math.pow( (staircase.step[staircase.step.length -1].position.z + (stepData[0].length / 100)), 2 ) + Math.pow( staircase.step[staircase.step.length -1].position.y, 2 ))
//     return Math.sqrt( Math.pow( (staircase.step[staircase.step.length -1].position.z + staircase.step[1].position.z), 2 ) + Math.pow( staircase.step[staircase.step.length -1].position.y, 2 ))
    
//     // return Math.sqrt(((staircase.step[staircase.step.length -1].position.y - (stepData[0].height / 100)) * (staircase.step[staircase.step.length -1].position.y - (stepData[0].height / 100))) + (staircase.step[staircase.step.length -1].position.z * staircase.step[staircase.step.length -1].position.z));
//     return Math.sqrt(((staircase.step[staircase.step.length -1].position.y + (30 / 100)) * (staircase.step[staircase.step.length -1].position.y + (30 / 100))) + ((staircase.step[staircase.step.length -1].position.z + stepData[0].length / 100) * (staircase.step[staircase.step.length -1].position.z + stepData[0].length / 100)));
// }

// function calculateRailAngle(){
//     //function to round down to 5. 34 becomes 30, 28 becomes 25.
//     var roundToNearest5 = x => Math.floor(x/5)*5;
    
//     //calc the radians and convert it to degrees to be able to round down.
//     var radians = Math.atan( staircase.step[staircase.step.length -1].position.y / ( staircase.step[staircase.step.length -1].position.z + (stepData[0].length / 100) ));
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

//     var stairsDegr = ( Math.atan( staircase.step[staircase.step.length-1].position.y / ( staircase.step[staircase.step.length-1].position.z ) ) ) * 180 / Math.PI ; //for angle α
//     var stairsRad =  Math.atan( staircase.step[staircase.step.length-1].position.y / ( staircase.step[staircase.step.length-1].position.z ) ) ; //for angle α
//     console.log("TotalStairsDegree: ", stairsDegr);

//     var averageStepLength = ( staircase.step[staircase.step.length-1].position.z / currentAmountOfSteps * 100 ) ;
//     console.log("averageStepLength", averageStepLength);
//     console.log("staircase.step[staircase.step.length-1].position.z", staircase.step[staircase.step.length-1].position.z);
//     console.log("amountOfSteps", currentAmountOfSteps);

//     for (var i = 0; i < staircase.step.length; i++){

//         // var radians = Math.atan( stepData[i].height / stepData[i].length ); //for angle α
//         // var radians = Math.atan( ( staircase.step[i].position.z ) / staircase.step[i].position.y); //for angle β
        
//         if (i > 0) {                                     
//             if (stepData[i].length < stepData[i-1].length){     //kromming
//                correctRadian = Math.atan( staircase.step[staircase.step.length-1].position.y / ( staircase.step[staircase.step.length-1].position.z ) ) ;
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
//     return staircase.step[staircase.step.length -1].position.y / Math.sin(railAngle);
//     console.log("railLength: ", radians);
// }


