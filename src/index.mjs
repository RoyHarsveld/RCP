import "./styles.css";
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { lastIndexOf } from "lodash";

/*Declare Variables*/
let camera, controls, scene, renderer, mesh = [];
let Steps = [8], meshCounter;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

  /*    Scene setup   */
  scene = new THREE.Scene();                          //Create a new scene (CONSTRUCTOR)
  scene.background = new THREE.Color( 0x212224 );     //Add backgroundcolor to the scene
  scene.fog = new THREE.FogExp2( 0x212224, 0.0025 );  //Add some nice fog, default 0.00025

  /*    Render setup    */
  renderer = new THREE.WebGLRenderer( { antialias: true } );    //The WebGL renderer displays the created scenes using WebGL (CONSTRUCTOR)
  renderer.setPixelRatio( window.devicePixelRatio );            //Set renderer pixelRatio
  renderer.setSize( window.innerWidth, window.outerHeight );    //Set renderer size
  document.body.appendChild( renderer.domElement );             //Some setting i always see return, has to do something with an HTML element and the render canvas

  /*    Camera setup    */
  camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 2000 );    //Set the camera's FoV, the heigth and width, the nearest plane, the furthest plane (CONSTRUCTOR)
  camera.position.set( 10, 5, -10 );     //set start position

  /*    Controls setup    */
  controls = new OrbitControls( camera, renderer.domElement );  //Create new controls for camera and the render canvas.
  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true;          //Give some weight to the controls
  controls.dampingFactor = 0.05;          //Nice value for controlweight 

  controls.screenSpacePanning = true;    //Best controlable

  controls.minDistance = 10;             //how far you can zoom in. Default is 0.
  controls.maxDistance = 500;             //how far you can zoom out. Default is indefinite.
  controls.maxPolarAngle = Math.PI / 2;   //How far you can orbit vertically, upper limit. Range is 0 to Math.PI radians, and default is Math.PI.

  /*HELPER TOOLS*/
  const gridHelper = new THREE.GridHelper(100, 100);
  const axesHelper = new THREE.AxesHelper(50);

  scene.add (gridHelper, axesHelper);

  /*    World setup   */
  /*geometry setup*/
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.translate( 0.5, 0.5, 0.5 );

  /*material setup*/
  const material = new THREE.MeshLambertMaterial( { color: 0xffffff, flatShading: true } );

  /*mesh setup*/
  for (meshCounter = 0; meshCounter < 8; meshCounter++){
    mesh[meshCounter] = new THREE.Mesh( geometry, material );

    //set scale
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
  wallPlane.scale.x = mesh[0].scale.x;
  wallPlane.scale.y = mesh[7].position.y;
  wallPlane.scale.z = 0;

  wallPlane.position.x = 0;
  wallPlane.position.y = 0;
  wallPlane.position.z = 0;

  scene.add( wallPlane );


  /*Lightning setup*/
  const dirLight1 = new THREE.DirectionalLight( 0xb5b1b1, 0.8 );
  dirLight1.position.set( 100, 100, 100 );
  scene.add( dirLight1 );

  const dirLight2 = new THREE.DirectionalLight( 0xa3a9d1 );
  dirLight2.position.set( -100, 100, -100 );
  scene.add( dirLight2 );

  const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
  scene.add( ambientLight );

  /**/
  window.addEventListener( 'resize', onWindowResize );

  /*    Add GUI   */
  const gui = new GUI();
  gui.add( controls, 'screenSpacePanning' );

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function render() {
  renderer.render( scene, camera );
}
