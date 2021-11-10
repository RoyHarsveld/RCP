import "./styles.css";
import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'three-mesh-bvh';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/*three-mesh-bvh setup*/
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
/*three-mesh-bvh setup*/

const params = {
    speed: 1,
    visualizeBounds: true,
    visualBoundsDepth: 10,
    shape: 'step',
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3( 1, 1, 1),
};

/*Declare Variables*/
var camera, controls, scene, renderer, mesh = [], boundsViz, transformControls, Steps = [8], meshCounter = 0, targetMesh, staircase = {};
var step1Length = 1, step1Width =1 , step1Height=1, step1Angle=1;
var stepGeometry, geometryMaterial;
var oldAmountOfSteps = 1, amountOfSteps;

createDiv();
init();
render(); 

function init() {
    console.log("Init");
    /*    Scene setup   */
    scene = new THREE.Scene();                          //Create a new scene (CONSTRUCTOR)
    scene.background = new THREE.Color( 0x212224 );     //Add backgroundcolor to the scene
    scene.fog = new THREE.FogExp2( 0x212224, 0.0025 );  //Add some nice fog, default 0.00025

    /*    Render setup    */
    renderer = new THREE.WebGLRenderer( { canvas:document.querySelector('canvas'), antialias: true } );    //The WebGL renderer displays the created scenes using WebGL (CONSTRUCTOR)
    renderer.setPixelRatio( window.devicePixelRatio );            //Set renderer pixelRatio
    renderer.setSize( threeCanvas.offsetWidth, threeCanvas.offsetHeight);    //Set renderer size

    /*      Lightning setup     */
    const dirLight1 = new THREE.DirectionalLight( 0xb5b1b1, 0.8 );
    dirLight1.position.set( 100, 100, 100 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0xa3a9d1 );
    dirLight2.position.set( -100, 100, -100 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
    scene.add( ambientLight );

    /*    Camera setup    */
    camera = new THREE.PerspectiveCamera( 90, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 2000 );    //Set the camera's FoV, the heigth and width, the nearest plane, the furthest plane (CONSTRUCTOR)
    camera.position.set( 10, 5, -10 );     //set start position

    /*    Transform Controls    */
    transformControls = new TransformControls( camera, renderer.domElement );
    scene.add( transformControls );
   
    /*    Controls setup    */
    controls = new OrbitControls( camera, renderer.domElement );  //Create new controls for camera and the render canvas.
    controls.enableDamping = true;          //Give some weight to the controls
    controls.dampingFactor = 0.05;          //Nice value for controlweight 
    controls.screenSpacePanning = true;    //Best controlable
    controls.minDistance = 0;             //how far you can zoom in. Default is 0. /10
    controls.maxDistance = 500;             //how far you can zoom out. Default is indefinite.
    controls.maxPolarAngle = Math.PI / 2;   //How far you can orbit vertically, upper limit. Range is 0 to Math.PI radians, and default is Math.PI.

    /*HELPER TOOLS*/
    const gridHelper = new THREE.GridHelper(100, 100);
    const axesHelper = new THREE.AxesHelper(50);
    scene.add (gridHelper, axesHelper);

/*    World setup   */
    /*geometryMaterial setup*/
    geometryMaterial = new THREE.MeshLambertMaterial( { 
        color: 0xffffff, 
    } );

    /*step geometry setup*/
    stepGeometry = new THREE.BoxGeometry(1, 1, 1);
    stepGeometry.translate( 0.5, 0.5, 0.5 );

    //geometry setup
    const boxGeometry = new THREE.BoxGeometry(1,1,1);               //create box geometry
    boxGeometry.translate( 0.5, 0.5, 0.5 );

    //target box mesh
    targetMesh = new THREE.Mesh( boxGeometry, geometryMaterial );   //merge geometry and material into mesh
	targetMesh.geometry.computeBoundsTree();
	scene.add( targetMesh );

    // staircase.steps[0] = new THREE.Mesh(stepGeometry, geometryMaterial );
    // scene.add( staircase.steps );

    staircase.sphere = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 50, 50 ), geometryMaterial );
	scene.add( staircase.sphere );

	staircase.step = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), geometryMaterial );
	scene.add( staircase.step );

    /*    Add GUI   */
    const gui = new GUI();
    gui.add( controls, 'screenSpacePanning' );
    gui.add( params, 'speed' ).min( 0 ).max( 10 );
    gui.add( params, 'visualizeBounds' ).onChange( () => updateFromOptions() );
    gui.add( params, 'visualBoundsDepth' ).min( 1 ).max( 40 ).step( 1 ).onChange( () => updateFromOptions() );
    gui.add( params, 'shape', [ 'step', 'sphere' ] );

    gui.add( transformControls, 'mode', [ 'translate', 'rotate' ] );

    const posFolder = gui.addFolder( 'position' );
    posFolder.add( params.position, 'x' ).min( - 5 ).max( 5 ).step( 0.001 );
    posFolder.add( params.position, 'y' ).min( - 5 ).max( 5 ).step( 0.001 );
    posFolder.add( params.position, 'z' ).min( - 5 ).max( 5 ).step( 0.001 );
    posFolder.open();

    const rotFolder = gui.addFolder( 'rotation' );
    rotFolder.add( params.rotation, 'x' ).min( - Math.PI ).max( Math.PI ).step( 0.001 );
    rotFolder.add( params.rotation, 'y' ).min( - Math.PI ).max( Math.PI ).step( 0.001 );
    rotFolder.add( params.rotation, 'z' ).min( - Math.PI ).max( Math.PI ).step( 0.001 );
    rotFolder.open();

    const scaleFolder = gui.addFolder('Scale')
    scaleFolder.add(params.scale, 'x', -5, 5);
    scaleFolder.add(params.scale, 'y', -5, 5);
    scaleFolder.add(params.scale, 'z', -5, 5);
    scaleFolder.open();

    gui.open();

    transformControls.addEventListener( 'change', function () {
        params.position.copy( staircase[ params.shape ].position );
        params.rotation.copy( staircase[ params.shape ].rotation );
        params.scale.copy( staircase[ params.shape ].scale );
        gui.updateDisplay();
    } );

    transformControls.addEventListener( 'mouseDown', function () {
        controls.enabled = false;
    } );

    transformControls.addEventListener( 'mouseUp', function () {
        controls.enabled = true;
    } );

    controls.addEventListener( 'start', function () {
        transformControls.enabled = false;
    } );

    controls.addEventListener( 'end', function () {
        transformControls.enabled = true;
    } );

    window.addEventListener( 'resize', function () {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width ||canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    }}, false );

	window.addEventListener( 'keydown', function ( e ) {
		switch ( e.key ) {
			case 'w':
				transformControls.mode = 'translate';
				break;
			case 'e':
				transformControls.mode = 'rotate';
				break;
		}
		gui.updateDisplay();
	} );
}

function render() {

    console.log("Render");
    
	if ( boundsViz ) boundsViz.update();
    controls.update();
	renderer.render( scene, camera );

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
		    .copy( targetMesh.matrixWorld ).invert()
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

		const hit = targetMesh.geometry.boundsTree.intersectsBox( box, transformMatrix );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );

	}

	if ( transformControls.object !== shape ) { 
        transformControls.attach( shape ); 
    }

    getData();
	requestAnimationFrame( render );

}

// let lastTime = window.performance.now();

// function animate() {
// requestAnimationFrame( animate );
// controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
// renderer.render( scene, camera );
// }

// function render() {
// renderer.render( scene, camera );
// }

function getData(){
    console.log("GetData");

    amountOfSteps = document.getElementById('amountOfSteps');               //get the amount of steps
    if (amountOfSteps.value > 100){
        amountOfSteps.value = 100;
    }
    console.log("Amount of steps:", amountOfSteps.value);                       //console display the amount of steps added by the user

    for (var i = 0; i < amountOfSteps.value; i++){

        var elms = document.getElementById('step1').getElementsByTagName("*");      

        for (var j = 0; j < elms.length; j++) {
            if (elms[j].id === "L") {
                step1Length = elms[j].value;
                // params.scale.z = step1Length / 100;
            }
            if (elms[j].id === "W") {
                step1Width = elms[j].value;
                // params.scale.x = step1Width / 100;
            }
            if (elms[j].id === "H") {
                step1Height = elms[j].value;
                // params.scale.y = step1Height / 100;
            }
            if (elms[j].id === "A") {
                step1Angle = elms[j].value;
            }
        }
        //TODO: Stop the createMeshSteps when all steps drawed
        // if (oldAmountOfSteps != amountOfSteps.value && ){
        //     console.log("COMPARISON NOT EQUAL");
            createMeshSteps();
        // }
        // if (amountOfSteps.value >= 1){
            oldAmountOfSteps = amountOfSteps.value;
        // }

        console.log("Step 1:", step1Length,step1Width,step1Height,step1Angle);
        console.log("oldAmountOfSteps:", oldAmountOfSteps);
    }
}

function createMeshSteps(){
    
    /*mesh setup*/
    console.log("CREATING MESH STEPS");

    for (meshCounter = 0; meshCounter < oldAmountOfSteps; meshCounter++){
        scene.remove(mesh[meshCounter]);
    }

    for (meshCounter = 0; meshCounter < amountOfSteps.value; meshCounter++){
        
        mesh[meshCounter] = new THREE.Mesh( stepGeometry, geometryMaterial );

        //set scale  x(width), y(height), z(length)
        mesh[meshCounter].scale.x = step1Width / 100;
        mesh[meshCounter].scale.y = 30 / 100;
        mesh[meshCounter].scale.z = step1Length / 100;

        //set position
        mesh[meshCounter].position.x = 0;
        if (meshCounter == 0){
            mesh[meshCounter].position.y = step1Height / 100;
            mesh[meshCounter].position.z = 0;
        } else {
            mesh[meshCounter].position.y = mesh[meshCounter -1].position.y + step1Height / 100;  
            mesh[meshCounter].position.z = mesh[meshCounter -1].scale.z + mesh[meshCounter -1].position.z;
        }
        //mesh[meshCounter].position.z = 0;

        mesh[meshCounter].updateMatrix();
        mesh[meshCounter].matrixAutoUpdate = false;
        
        
        //add create steps
        scene.add( mesh[meshCounter] );
    }
}

function createDiv(){
    var IButton = document.createElement('button');
    IButton.type = 'button';
    IButton.className = 'collapsible';
    document.getElementById('stepInput').appendChild(IButton);
    IButton.innerHTML = 'Step 7';

    var iDiv = document.createElement('div');
    iDiv.id = 'step7';
    iDiv.className = 'content';
    document.getElementById('stepInput').appendChild(iDiv);
    
    iDiv.innerHTML = "Step 7";
    
    // Now create and append to iDiv
    var innerDiv = document.createElement('div');
    innerDiv.className = 'block-2';
    
    // The variable iDiv is still good... Just append to it.
    iDiv.appendChild(innerDiv);
    innerDiv.innerHTML = "I'm the inner div";  
}