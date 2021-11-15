import "./styles.css";
import * as THREE from 'three';

import INITTHREE from './modules/initThree.js';
import * as INITVAR from './modules/initThree.js';

import OBJECT from './modules/object.js';
import * as OBJECTVAR from './modules/object.js';
import { createMeshSteps } from "./modules/object.js";

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
export var stepLength, stepWidth, stepHeight, stepAngle;
export var staircase = {};

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
    amountOfStepsButton.addEventListener("click", () => {
        amountOfSteps = document.getElementById('amountOfSteps');               //get the amount of steps

        if (amountOfSteps.value > 100){
            amountOfSteps.value = 100;
        }
        currentAmountOfSteps = amountOfSteps.value
    });

    if (oldAmountOfSteps != currentAmountOfSteps && currentAmountOfSteps > 0){
        createDiv();
    }

    for (var i = 0; i < currentAmountOfSteps; i++){

        var elms = document.getElementById('step1').getElementsByTagName("*");      

        for (var j = 0; j < elms.length; j++) {
            if (elms[j].id === "L") {
                stepLength = elms[j].value;
                // params.scale.z = step1Length / 100;
            }
            if (elms[j].id === "W") {
                stepWidth = elms[j].value;
                // params.scale.x = step1Width / 100;
            }
            if (elms[j].id === "H") {
                stepHeight = elms[j].value;
                // params.scale.y = step1Height / 100;
            }
            if (elms[j].id === "A") {
                stepAngle = elms[j].value;
            }
        }
        //TODO: Stop the createMeshSteps when all steps drawed
        if (oldAmountOfSteps != currentAmountOfSteps){
        //     console.log("COMPARISON NOT EQUAL");
            createMeshSteps();
        }
        // if (currentAmountOfSteps >= 1){
            oldAmountOfSteps = currentAmountOfSteps;
        // }

        // console.log("Step 1:", step1Length,step1Width,step1Height,step1Angle);
        // console.log("oldAmountOfSteps:", oldAmountOfSteps);
    }
}

function createDiv(){
    
    var buttonText = "";
    var iDivIdText = "";

    console.log("   Current Amount of steps:", currentAmountOfSteps);
    console.log("   OLD Amount of steps:", oldAmountOfSteps);

    //DELETING INPUT FORMS
    if((currentAmountOfSteps - oldAmountOfSteps) < 0){
        console.log("       DELETING INPUT FORMS");
        const buttonId = document.getElementsByClassName("collapsible");
        const divId = document.getElementsByClassName("content")
        
        var x = oldAmountOfSteps;
        console.log("x: ", x);
        for (x; (x - currentAmountOfSteps) > 0; x--){
            // console.log(x);
            var lastButtonElement = buttonId[buttonId.length - 1];
            // var lastDivElement = divId[divId.length - 1];
            buttonId[buttonId.length - 1].remove(); 
            divId[divId.length - 1].remove();
            console.log(lastButtonElement);
        }
        
    }
    //CREATING INPUT FORMS
    if ((oldAmountOfSteps - currentAmountOfSteps) < 0) {
        console.log("       CREATING INPUT FORMS");
        for (var i = oldAmountOfSteps; i < currentAmountOfSteps; i++ ){
            var stepCounter = parseInt(i) + 1;
            buttonText = "Step " + stepCounter;
            iDivIdText = "step" + stepCounter;

            //create buttons
            var Button = document.createElement('button');
            Button.type = 'button';
            Button.className = 'collapsible';
            document.getElementById('stepInput').appendChild(Button);
            Button.innerHTML = buttonText;
            console.log(Button);

            //create button content
            var iDiv = document.createElement('div');
            iDiv.id = iDivIdText;
            iDiv.className = 'content';
            document.getElementById('stepInput').appendChild(iDiv);
            
            // Now create input forms and append to iDiv
            var inputLength = document.createElement('input');
            inputLength.type = 'text';
            inputLength.className = 'form-control';
            inputLength.id = 'L';
            inputLength.placeholder = 'Length'
            iDiv.appendChild(inputLength);

            var inputWidth = document.createElement('input');
            inputWidth.type = 'text';
            inputWidth.className = 'form-control';
            inputWidth.id = 'W';
            inputWidth.placeholder = 'Width'
            iDiv.appendChild(inputWidth);

            var inputHeigth = document.createElement('input');
            inputHeigth.type = 'text';
            inputHeigth.className = 'form-control';
            inputHeigth.id = 'H';
            inputHeigth.placeholder = 'Height'
            iDiv.appendChild(inputHeigth);

            var inputAngle = document.createElement('input');
            inputAngle.type = 'text';
            inputAngle.className = 'form-control';
            inputAngle.id = 'A';
            inputAngle.placeholder = 'Angle'
            iDiv.appendChild(inputAngle);
        }
    }
    //loop to add collapsible buttons
    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
}