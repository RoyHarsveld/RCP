import "./styles.css";
import bootstrap from 'bootstrap'
import _ from 'lodash';
import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { lastIndexOf } from "lodash";
"use strict";

/*Declare Variables*/
let camera, controls, scene, renderer, mesh = [];
let Steps = [8], meshCounter;
// const threeCanvas = document.querySelector('#threeCanvas');

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

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

  /*    Camera setup    */
  camera = new THREE.PerspectiveCamera( 90, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 2000 );    //Set the camera's FoV, the heigth and width, the nearest plane, the furthest plane (CONSTRUCTOR)
  camera.position.set( 10, 5, -10 );     //set start position

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
//   /*geometry setup*/
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  boxGeometry.translate( 0.5, 0.5, 0.5 );

  /*material setup*/
  const material = new THREE.MeshLambertMaterial( { color: 0xffffff, flatShading: true } );

  /*mesh setup*/
  for (meshCounter = 0; meshCounter < 8; meshCounter++){
    mesh[meshCounter] = new THREE.Mesh( boxGeometry, material );

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

  /*Moasure geometry*/

    const points = [];   //vector3(x, y, z)
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
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width ||canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    }
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function render() {
  renderer.render( scene, camera );
}

// function getData(){
//     const editor = document.querySelector('editor'),
//     form = editor.querySelectorAll('.form'),
// }