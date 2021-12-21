import "./styles.css";
import * as THREE from 'three';
import INITTHREE from './modules/initThree.js';
import * as INITVAR from './modules/initThree.js';
import GEOMETRY from './modules/geometry.js';
import * as GEOVAR from './modules/geometry.js';
import { createSteps } from "./modules/geometry.js";
import { createRails } from "./modules/geometry.js";
import { stepMesh } from "./modules/geometry.js";
import { createDiv } from "./modules/div";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'three-mesh-bvh';
import { jsPDF } from "jspdf";

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
var INTERSECTED;
const color = new THREE.Color();

export var stepData = [];
var averageStepLength, averageStepHeight;
export var currentAmountOfSteps = 0, oldAmountOfSteps = 0, amountOfSteps;
export var staircase = {}, shape;
export var transformControlsVisible = 0;

/*CALL MODULES*/
const initThree = new INITTHREE();
const geometry = new GEOMETRY();
const PDF = new jsPDF();

const pdfButton = document.getElementById('pdfButton');
const amountOfStepsButton = document.getElementById('amountOfStepsButton');
pdfButton.addEventListener("click", createPDF, false);
amountOfStepsButton.addEventListener("click", getAmountOfSteps, false);

animate();
// render(); 

/*Rendering the scene.
 This function is a render/animatation loop*/
function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    // console.log("Render");
    /*Transformcontrols, make visible*/
	shape = staircase[ params.shape ];
	shape.visible = true;

    // if (!transformControlsVisible){
        // if ( INITVAR.transformControls.object !== shape ) { 
        //     INITVAR.transformControls.attach( shape ); 
        // }
    // }

    getStepData();

    INITVAR.orbitControl.update();
	INITVAR.renderer.render( INITVAR.scene, INITVAR.camera );
}


function createPDF(){
    console.log("CREATING PDF BABY");
    PDF.text("hello world poepiescheet", 40, 40);
    // PDF.save("installDrawing.pdf");
    window.open(PDF.output("bloburl"), '_blank');
}


function getAmountOfSteps(){
        amountOfSteps = document.getElementById('amountOfSteps');   //get the amount of steps
        
        if (amountOfSteps.value > 100){
            amountOfSteps.value = 100;
        }
        currentAmountOfSteps = amountOfSteps.value;
        // amountOfStepsButton.removeEventListener("click", clickfunction);

    if (oldAmountOfSteps != currentAmountOfSteps && currentAmountOfSteps > 0){
        stepsCreated = false;
        railCreated = false;
        createDiv();
    }
}

function getStepData(){
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

    // if (!stepsCreated && stepData.length > 0 && stepData[0].height > 0) {
    if (stepData.length > 0 && stepData[0].height > 0) {
        createSteps();
        stepsCreated = true;
    }

    // if (!railCreated && stepMesh.length > 1) {
    if (stepMesh.length > 1) {
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