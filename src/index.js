import "./styles.css";
import * as THREE from 'three';

import INITTHREE from './modules/initThree.js';
import * as INITVAR from './modules/initThree.js';

import GEOMETRY from './modules/geometry.js';
import * as GEOVAR from './modules/geometry.js';
import { createSteps } from "./modules/geometry.js";
import { createRails } from "./modules/geometry.js";

import { stepMesh, boxGeometry, material, targetMesh } from "./modules/geometry.js";

import { createDiv } from "./modules/div";

// import guitest from './modules/gui.js';
// import initThree from "./modules/initThree.js";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'three-mesh-bvh';
import { Object3D } from "three";
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
const Struct = (...keys) => ((...v) => keys.reduce((o, k, i) => {o[k] = v[i]; return o} , {}))
const item = Struct("length","width","height","angle");

var stepsCreated, railCreated;

var boundsViz;
export var stepData = [];
export var currentAmountOfSteps = 0, oldAmountOfSteps = 0, amountOfSteps;
export var staircase = {};

/*CALL MODULES*/
const initThree = new INITTHREE();
const geometry = new GEOMETRY();

render(); 
function render() {
    // console.log("Render");
    
	if ( boundsViz ) boundsViz.update();
    INITVAR.controls.update();
	INITVAR.renderer.render( INITVAR.scene, INITVAR.camera );

	// casts
	// for ( const shape in staircase ) staircase[ shape ].visible = false; //set all shapes invisible

	const s = params.shape;
	const shape = staircase[ s ];
	shape.visible = true;
	// shape.position.copy( params.position );
	// shape.rotation.copy( params.rotation );
	// shape.scale.copy( params.scale );

	const transformMatrix =
		new THREE.Matrix4()
		    .copy( GEOVAR.targetMesh.matrixWorld ).invert()
			.multiply( shape.matrixWorld );

	if ( s === 'sphere' ) {
		const sphere = new THREE.Sphere( undefined, 1 );
		sphere.applyMatrix4( transformMatrix );

		const hit = GEOVAR.targetMesh.geometry.boundsTree.intersectsSphere( sphere );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );

	}

    if ( s === 'step' ) {
		const box = new THREE.Box3();
		box.min.set( - 0.5, - 0.5, - 0.5 );
		box.max.set( 0.5, 0.5, 0.5 );

		const hit = GEOVAR.targetMesh.geometry.boundsTree.intersectsBox( box, transformMatrix );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );
	}

    if ( s === 'rail' ) {
		const box = new THREE.Box3();
		box.min.set( - 0.5, - 0.5, - 0.5 );
		box.max.set( 0.5, 0.5, 0.5 );

		const hit = GEOVAR.targetMesh.geometry.boundsTree.intersectsBox( box, transformMatrix );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );
	}

	if ( INITVAR.transformControls.object !== shape ) { 
        INITVAR.transformControls.attach( shape ); 
    }

    getData();
	requestAnimationFrame( render );

}

function getData(){
    // Add button event listener for gathering the amount of steps
    const amountOfStepsButton = document.getElementById('amountOfStepsButton');
    amountOfStepsButton.addEventListener("click", () => {
        amountOfSteps = document.getElementById('amountOfSteps');   //get the amount of steps
        if (amountOfSteps.value > 100){
            amountOfSteps.value = 100;
        }
        currentAmountOfSteps = amountOfSteps.value;
    });

    if (oldAmountOfSteps != currentAmountOfSteps && currentAmountOfSteps > 0){
        stepsCreated = false;
        railCreated = false;
        createDiv();
    }
    stepData = [];
    for (var i = 0; i < currentAmountOfSteps; i++){
        
        var elms = document.getElementById('step' + (i + 1)).getElementsByTagName("*");      
        var tempLength, tempWidth, tempHeight, tempAngle;

        for (var j = 0; j < elms.length; j++) {

            if (elms[j].id === "L") {
                tempLength = elms[j].value
            }
            if (elms[j].id === "W") {
                tempWidth = elms[j].value
            }
            if (elms[j].id === "H") {
                tempHeight = elms[j].value
            }
            if (elms[j].id === "A") {
                tempAngle = elms[j].value
            }
        }
        stepData.push(item(tempLength, tempWidth, tempHeight, tempAngle));
    }
    
    if (!stepsCreated && stepData.length > 0 && stepData[0].height > 0) {
        createSteps();
        stepsCreated = true;
    }

    if (!railCreated && stepMesh.length > 1) {
        createRails();
        railCreated = true;
    }  
    // if (stepMesh.length > 1) {
    //     createRails();
    // }    

    // console.log("Update OLD amount of Steps");
    
    oldAmountOfSteps = currentAmountOfSteps; //update old amount of steps 
    // console.log("   Current Amount of steps:", currentAmountOfSteps);
    // console.log("   OLD Amount of steps:", oldAmountOfSteps);

}