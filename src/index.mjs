import "./styles.css";
import "./render.mjs";
// import bootstrap from 'bootstrap'
import _ from 'lodash';

import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'three-mesh-bvh';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
// import { lastIndexOf } from "lodash";
"use strict";

/*three-mesh-bvh setup*/
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
/*three-mesh-bvh setup*/

const params = {

    speed: 1,
    visualizeBounds: true,
    visualBoundsDepth: 10,
    shape: 'sphere',
    position: new THREE.Vector3(),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3( 1, 1, 1 ),
};


/*Declare Variables*/

let camera, controls, scene, renderer, mesh = [], boundsViz, transformControls;
let Steps = [8], meshCounter;
let targetMesh;
let shapes = {};
// const threeCanvas = document.querySelector('#threeCanvas');

init();
render(); // remove when using next line for animation loop (requestAnimationFrame)
// const selectElement = document.querySelector('#stepNumber');
// selectElement.addEventListener('change', (event) => {
//     init();
// });
// animate();

function init() {
    /*    Scene setup   */
    scene = new THREE.Scene();                          //Create a new scene (CONSTRUCTOR)
    scene.background = new THREE.Color( 0x212224 );     //Add backgroundcolor to the scene
    scene.fog = new THREE.FogExp2( 0x212224, 0.0025 );  //Add some nice fog, default 0.00025

    /*    Render setup    */
    //   const threeCanvas = document.querySelector('#threeCanvas');
    //   canvas.height = window.innerHeight;   //tell canvas to use whole column
    renderer = new THREE.WebGLRenderer( { canvas:document.querySelector('canvas'), antialias: true } );    //The WebGL renderer displays the created scenes using WebGL (CONSTRUCTOR)
    renderer.setPixelRatio( window.devicePixelRatio );            //Set renderer pixelRatio
    renderer.setSize( threeCanvas.offsetWidth, threeCanvas.offsetHeight);    //Set renderer size
    //   document.body.appendChild( renderer.domElement );             //Some setting i always see return, has to do something with an HTML element and the render canvas

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
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
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
    /*geometry setup*/
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    boxGeometry.translate( 0.5, 0.5, 0.5 );

    //geometry setup
	const knotGeometry = new THREE.TorusKnotBufferGeometry( 1, 0.4, 400, 100 );
	const knotMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
	targetMesh = new THREE.Mesh( knotGeometry, knotMaterial );
	targetMesh.geometry.computeBoundsTree();
	scene.add( targetMesh );

    /*shapeMaterial setup*/
    const shapeMaterial = new THREE.MeshLambertMaterial( { 
        color: 0xffffff, 
        flatShading: true 
    } );

    shapes.sphere = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 50, 50 ), shapeMaterial );
	scene.add( shapes.sphere );

	shapes.box = new THREE.Mesh( new THREE.BoxBufferGeometry( 1, 1, 1 ), shapeMaterial );
	scene.add( shapes.box );

	shapes.geometry = new THREE.Mesh( new THREE.TorusKnotBufferGeometry( .5, .2, 200, 50 ), shapeMaterial );
	shapes.geometry.geometry.computeBoundsTree();
	scene.add( shapes.geometry );

    /*mesh setup*/
    for (meshCounter = 0; meshCounter < 8; meshCounter++){
    mesh[meshCounter] = new THREE.Mesh( boxGeometry, shapeMaterial );

    //set scale  x(width), y(height), z(depth)
    mesh[meshCounter].scale.x = 1000 / 100;
    mesh[meshCounter].scale.y = 30 / 100;
    mesh[meshCounter].scale.z = 250 / 100;

    //set position
    mesh[meshCounter].position.x = 0;
    if (meshCounter == 0){
        mesh[meshCounter].position.y = 165 / 100;
        mesh[meshCounter].position.z = 0;
    } else {
        mesh[meshCounter].position.y = mesh[meshCounter -1].position.y + 165 / 100;  
        mesh[meshCounter].position.z = mesh[meshCounter -1].scale.z + mesh[meshCounter -1].position.z;
    }
    //mesh[meshCounter].position.z = 0;

    mesh[meshCounter].updateMatrix();
    mesh[meshCounter].matrixAutoUpdate = false;

    //add create steps
    Steps.push(mesh[meshCounter]);
    scene.add( Steps[meshCounter] );
    }

    //CREATE WALLPLANE
    const wallPlaneGeometry = new THREE.PlaneGeometry( 1, 1 );
    wallPlaneGeometry.translate( 0.5, 0.5, 0.5 );

    const planeMaterial = new THREE.MeshBasicMaterial( {color: 0x2e3857, side: THREE.DoubleSide} );

    const wallPlane = new THREE.Mesh( wallPlaneGeometry, planeMaterial );
    wallPlane.geometry.computeBoundsTree();
    const wallplaneScaleX = 20;
    // for (const x = 0; x < 8; x++){
    //     wallplaneScaleX = wallplaneScaleX + mesh[x].scale.z;
    // }
    // wallPlane.scale.x = mesh[6].scale.z;
    wallPlane.scale.x = wallplaneScaleX;
    wallPlane.scale.y = mesh[6].position.y;
    wallPlane.scale.z = 0;
    wallPlane.rotation.y = -Math.PI /2;

    wallPlane.position.x = 0;
    wallPlane.position.y = 0;
    wallPlane.position.z = 0;

    scene.add( wallPlane );

    /*Moasure geometry*/

    const points = [];   //vector3(x(depth), y(width), z(height))
    points.push( new THREE.Vector3(0.0,0.0,0.0));
    points.push( new THREE.Vector3(0.0972,0.0,0.2003));
    points.push( new THREE.Vector3(0.3086,0.0,0.4009));
    points.push( new THREE.Vector3(0.5166,0.0,0.6195));
    points.push( new THREE.Vector3(0.7245,0.0,0.8214));
    points.push( new THREE.Vector3(0.9306,0.0,1.0216));
    points.push( new THREE.Vector3(1.1324,0.0,1.2245));
    points.push( new THREE.Vector3(1.3409,0.0,1.4247));
    points.push( new THREE.Vector3(1.5338,0.0,1.6308));
    points.push( new THREE.Vector3(1.7496,0.0,1.8495));
    points.push( new THREE.Vector3(1.9447,0.0,2.0499));
    points.push( new THREE.Vector3(3.5007,0.0,2.0519));
    points.push( new THREE.Vector3(3.5007,2.7647,2.0562));
    points.push( new THREE.Vector3(2.1715,2.7647,2.264));
    points.push( new THREE.Vector3(1.9722,2.7647,2.4687));
    points.push( new THREE.Vector3(1.7759,2.7647,2.6726));
    points.push( new THREE.Vector3(1.5742,2.7647,2.8715));
    points.push( new THREE.Vector3(1.3735,2.7647,3.0763));
    points.push( new THREE.Vector3(1.1822,2.7647,3.2839));
    points.push( new THREE.Vector3(0.9796,2.7647,3.4888));
    points.push( new THREE.Vector3(0.7788,2.7647,3.6934));
    points.push( new THREE.Vector3(0.5789,2.7647,3.8938));
    points.push( new THREE.Vector3(0.3803,2.7647,4.1019));
    points.push( new THREE.Vector3(0.1858,2.7647,4.3026));
    points.push( new THREE.Vector3(-0.021,2.7647,4.5091));
    points.push( new THREE.Vector3(-0.2214,2.7647,4.7138));
    points.push( new THREE.Vector3(-0.4558,2.7647,4.7175));
    points.push( new THREE.Vector3(-0.4558,1.5501,4.7171));
    points.push( new THREE.Vector3(-0.2131,1.5501,4.7165));
    points.push( new THREE.Vector3(-0.0027,1.5501,4.51));
    points.push( new THREE.Vector3(0.1966,1.5501,4.3032));
    points.push( new THREE.Vector3(0.4007,1.5501,4.0969));
    points.push( new THREE.Vector3(0.5905,1.5501,3.8914));
    points.push( new THREE.Vector3(0.7857,1.5501,3.686));
    points.push( new THREE.Vector3(0.9768,1.5501,3.4816));
    points.push( new THREE.Vector3(1.1799,1.5501,3.2757));
    points.push( new THREE.Vector3(1.3914,1.5501,3.0711));
    points.push( new THREE.Vector3(1.5935,1.5501,2.8633));
    points.push( new THREE.Vector3(1.8012,1.5501,2.6631));
    points.push( new THREE.Vector3(2.0031,1.5501,2.4577));
    points.push( new THREE.Vector3(2.2021,1.5501,2.2513));
    points.push( new THREE.Vector3(2.3133,1.1774,2.0442));
    points.push( new THREE.Vector3(1.8588,1.1774,2.0479));
    points.push( new THREE.Vector3(1.6543,1.1774,1.8419));
    points.push( new THREE.Vector3(1.4493,1.1774,1.638));
    points.push( new THREE.Vector3(1.2501,1.1774,1.4322));
    points.push( new THREE.Vector3(1.0535,1.1774,1.2282));
    points.push( new THREE.Vector3(0.8534,1.1774,1.0211));
    points.push( new THREE.Vector3(0.6579,1.1774,0.8178));
    points.push( new THREE.Vector3(0.4564,1.1774,0.6138));
    points.push( new THREE.Vector3(0.2617,1.1774,0.4092));
    points.push( new THREE.Vector3(0.0618,1.1774,0.2099));
    points.push( new THREE.Vector3(0.0,1.1774,0.004));
    points.push( new THREE.Vector3(0.0,0.0,0.0));

    const pointMaterial = new THREE.PointsMaterial( { size: 1, sizeAttenuation: false } );
    // const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const pointGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const point = new THREE.Points(pointGeometry, pointMaterial);
    // const line = new THREE.Line( geometry, lineMaterial );
    // scene.add( line );
    scene.add(point);

    /**/
    // window.addEventListener( 'resize', onWindowResize );

    /*    Add GUI   */
    const gui = new GUI();
    gui.add( controls, 'screenSpacePanning' );
    gui.add( params, 'speed' ).min( 0 ).max( 10 );
    gui.add( params, 'visualizeBounds' ).onChange( () => updateFromOptions() );
    gui.add( params, 'visualBoundsDepth' ).min( 1 ).max( 40 ).step( 1 ).onChange( () => updateFromOptions() );
    gui.add( params, 'shape', [ 'sphere', 'box', 'geometry' ] );

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

    gui.open();

    transformControls.addEventListener( 'change', function () {

        params.position.copy( shapes[ params.shape ].position );
        params.rotation.copy( shapes[ params.shape ].rotation );
        params.scale.copy( shapes[ params.shape ].scale );
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

	// const delta = window.performance.now() - lastTime;
	// lastTime = window.performance.now();

	// targetMesh.rotation.y += params.speed * delta * 0.001;
	// targetMesh.updateMatrixWorld();

	// stats.begin();
    // console.log(document.getElementById('amountOfSteps').value);
    var elm = {};
    var elms = document.getElementById('step1').getElementsByTagName("*");
    // console.log(elms);
    var step1Length, step1Width, step1Height, step1Angle;
    for (var i = 0; i < elms.length; i++) {
        if (elms[i].id === "L") {
            step1Length = elms[i].value;
        }
        if (elms[i].id === "B") {
            step1Width = elms[i].value;
        }
        if (elms[i].id === "H") {
            step1Height = elms[i].value;
        }
        if (elms[i].id === "A") {
            step1Angle = elms[i].value;
        }
    }
    console.log("Step 1:", step1Length,step1Width,step1Height,step1Angle);
    // console.log('test');

	if ( boundsViz ) boundsViz.update();
    controls.update();
	renderer.render( scene, camera );
	// stats.end();

	// casts
	for ( const shape in shapes ) shapes[ shape ].visible = false;

	const s = params.shape;
	const shape = shapes[ s ];
	shape.visible = true;
	shape.position.copy( params.position );
	shape.rotation.copy( params.rotation );
	shape.scale.copy( params.scale );

	const transformMatrix =
		new THREE.Matrix4()
		    .copy( targetMesh.matrixWorld ).invert()
			.multiply( shape.matrixWorld );

	if ( s === 'sphere' ) {

		const sphere = new THREE.Sphere( undefined, 1 );
		sphere.applyMatrix4( transformMatrix );

		const hit = targetMesh.geometry.boundsTree.intersectsSphere( sphere );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );

	} else if ( s === 'box' ) {

		const box = new THREE.Box3();
		box.min.set( - 0.5, - 0.5, - 0.5 );
		box.max.set( 0.5, 0.5, 0.5 );

		const hit = targetMesh.geometry.boundsTree.intersectsBox( box, transformMatrix );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );

	} else if ( s === 'geometry' ) {

		const hit = targetMesh.geometry.boundsTree.intersectsGeometry( shape.geometry, transformMatrix );
		shape.material.color.set( hit ? 0xE91E63 : 0x666666 );
		shape.material.emissive.set( 0xE91E63 ).multiplyScalar( hit ? 0.25 : 0 );

	}

	if ( transformControls.object !== shape ) {

		transformControls.attach( shape );

	}

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

// function getData(){
//     const editor = document.querySelector('editor'),
//     form = editor.querySelectorAll('.form'),
// }