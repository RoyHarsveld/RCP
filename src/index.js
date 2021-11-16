import "./styles.css";
import * as THREE from 'three';

import INITTHREE from './modules/initThree.js';
import * as INITVAR from './modules/initThree.js';

import OBJECT from './modules/geometry.js';
import * as OBJECTVAR from './modules/geometry.js';
import { createMeshSteps } from "./modules/geometry.js";

import { createDiv } from "./modules/div";

// import guitest from './modules/gui.js';
// import initThree from "./modules/initThree.js";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'three-mesh-bvh';
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/*three-mesh-bvh setup*/
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

const params = {
    speed: 1,
    visualizeBounds: true,
    visualBoundsDepth: 10,
    shape: 'step',
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3( 1, 1, 1),
}; export {params};

/*Declare Variables*/

var boundsViz;
// var stepGeometry, geometryMaterial, targetMesh;

export var currentAmountOfSteps = 0, oldAmountOfSteps = 0, amountOfSteps;
// export var stepLength, stepWidth, stepHeight, stepAngle;
export var staircase = {};

export var steps = [];
    steps.depth;
    steps.width;
    steps.height;
    steps.angle;

// function Step(length, width, height, angle){
//     this.length = length;
//     this.width = width;
//     this.height= height;
//     this.angle = angle;
// }

/*CALL MODULES*/
const initThree = new INITTHREE();
const object = new OBJECT();

render(); 

function render() {
    // console.log("Render");
    
	if ( boundsViz ) boundsViz.update();
    INITVAR._controls.update();
	INITVAR._renderer.render( INITVAR._scene, INITVAR._camera );

	// casts
	for ( const shape in staircase ) staircase[ shape ].visible = false;

	const s = params.shape;
	const shape = staircase[ s ];
	shape.visible = true;
	shape.position.copy( params.position );
	shape.rotation.copy( params.rotation );
	shape.scale.copy( params.scale );

	const transformMatrix =
		new THREE.Matrix4()
		    .copy( OBJECTVAR._targetMesh.matrixWorld ).invert()
			.multiply( shape.matrixWorld );

	// if ( s === 'sphere' ) {
	// 	const sphere = new THREE.Sphere( undefined, 1 );
	// 	sphere.applyMatrix4( transformMatrix );

	// 	const hit = targetMesh.geometry.boundsTree.intersectsSphere( sphere );
	// 	shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
	// 	shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );

	// } else 

    if ( s === 'step' ) {
		const box = new THREE.Box3();
		box.min.set( - 0.5, - 0.5, - 0.5 );
		box.max.set( 0.5, 0.5, 0.5 );

		const hit = OBJECTVAR._targetMesh.geometry.boundsTree.intersectsBox( box, transformMatrix );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );

	}

	if ( INITVAR._transformControls.object !== shape ) { 
        INITVAR._transformControls.attach( shape ); 
    }

    getData();
	requestAnimationFrame( render );

}

function getData(){
    // console.log("GetData");

    const amountOfStepsButton = document.getElementById('amountOfStepsButton');
    // Add event listener for gathering the amount of steps
    amountOfStepsButton.addEventListener("click", () => {
        amountOfSteps = document.getElementById('amountOfSteps');   //get the amount of steps

        if (amountOfSteps.value > 100){
            amountOfSteps.value = 100;
        }
        currentAmountOfSteps = amountOfSteps.value;
    });
    // Create html step buttons
    if (oldAmountOfSteps != currentAmountOfSteps && currentAmountOfSteps > 0){
        createDiv();
    }

    const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {}))
    const item = Struct("length","width","height","angle");

    var stepData = [];
    // for 0 until current amount of steps:
    for (var i = 0; i < currentAmountOfSteps; i++){
        //console.log("GATHERING DATA FROM STEP1 FORM");
        // elms = data from  step 1
        var elms = document.getElementById('step' + (i + 1)).getElementsByTagName("*");      

        var tempLength, tempWidth, tempHeight, tempAngle;
        for (var j = 0; j < elms.length; j++) {

            if (elms[j].id === "L") {
                tempLength = elms[j].value
                // steps[i].depth = elms[j].value;
                // params.scale.z = step1Length / 100;
            }
            if (elms[j].id === "W") {
                tempWidth = elms[j].value

                // steps[i].width = elms[j].value;
                // params.scale.x = step1Width / 100;
            }
            if (elms[j].id === "H") {
                tempHeight = elms[j].value

                // steps[i].height = elms[j].value;
                // params.scale.y = step1Height / 100;
            }
            if (elms[j].id === "A") {
                tempAngle = elms[j].value

                // steps[i].angle = elms[j].value;
            }
        }
        stepData.push(item(tempLength, tempWidth, tempHeight, tempAngle));
        //TODO: Stop the createMeshSteps when all steps drawed
        // if (oldAmountOfSteps != currentAmountOfSteps){
        //     console.log("COMPARISON NOT EQUAL");
            // console.log("PENIS", steps[i].depth);
        createMeshSteps(tempLength, tempWidth, tempHeight, tempAngle);
        // }
        // if (currentAmountOfSteps >= 1){
            oldAmountOfSteps = currentAmountOfSteps;
        // }

        // console.log("Step 1:", step1Length,step1Width,step1Height,step1Angle);
        // console.log("oldAmountOfSteps:", oldAmountOfSteps);
    }
    console.log(stepData);

}