import * as THREE from 'three';
import { params, staircase } from '/src/index.js';

import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { MeshBVHVisualizer } from 'three-mesh-bvh';
import * as GEOVAR from './geometry.js';
export var renderer, scene, camera, transformControls, orbitControl, gui, raycaster, pointer, boundsViz;

class INITTHREE{
    constructor(){
        this.renderer()
        this.scene()
        this.light()
        this.camera()
        this.transformControls()
        this.orbitControl()
        this.tools()
        this.gui()
        this.addEventListener()
    }
    renderer(){
        renderer = new THREE.WebGLRenderer( { canvas:document.querySelector('canvas'), antialias: true } );    //The WebGL renderer displays the created scenes using WebGL (CONSTRUCTOR)
        renderer.setPixelRatio( window.devicePixelRatio );            //Set renderer pixelRatio
        renderer.setSize( threeCanvas.offsetWidth, threeCanvas.offsetHeight);    //Set renderer size    
    }

    scene(){
        scene = new THREE.Scene();                          //Create a new scene (CONSTRUCTOR)
        scene.background = new THREE.Color( 0x212224 );     //Add backgroundcolor to the scene
        scene.fog = new THREE.FogExp2( 0x212224, 0.0025 );  //Add some nice fog, default 0.00025    
    }

    light(){
        const dirLight1 = new THREE.DirectionalLight( 0xb5b1b1, 0.8 );
        dirLight1.position.set(0 , 50,  -10);
        scene.add( dirLight1 );
    
        const dirLight2 = new THREE.DirectionalLight( 0xa3a9d1, 0.5 );
        dirLight2.position.set( -50, 0, 0 );
        scene.add( dirLight2 );

        const dirLight3 = new THREE.DirectionalLight( 0xa3a9d1, 0.5 );
        dirLight3.position.set( 50, 0, 0 );
        scene.add( dirLight3 );
    
        const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
        scene.add( ambientLight );    
    }

    camera(){
        camera = new THREE.PerspectiveCamera( 90, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 2000 );    //Set the camera's FoV, the heigth and width, the nearest plane, the furthest plane (CONSTRUCTOR)
        camera.position.set( 10, 5, -10 );     //set start position        
    }

    transformControls(){
        transformControls = new TransformControls( camera, renderer.domElement );
        scene.add( transformControls );    
    }

    orbitControl(){
        orbitControl = new OrbitControls( camera, renderer.domElement );  //Create new controls for camera and the render canvas.
        orbitControl.enableDamping = true;          //Give some weight to the orbitControl
        orbitControl.dampingFactor = 0.05;          //Nice value for controlweight 
        orbitControl.screenSpacePanning = true;    //Best controlable
        orbitControl.minDistance = 0;             //how far you can zoom in. Default is 0. /10
        orbitControl.maxDistance = 500;             //how far you can zoom out. Default is indefinite.
        orbitControl.maxPolarAngle = Math.PI / 2;   //How far you can orbit vertically, upper limit. Range is 0 to Math.PI radians, and default is Math.PI.    
    }

    tools(){
        const gridHelper = new THREE.GridHelper(100, 100);
        const axesHelper = new THREE.AxesHelper(50);
        raycaster = new THREE.Raycaster();
		pointer = new THREE.Vector2();
        scene.add (gridHelper, axesHelper);
    }

    gui(){
        gui = new GUI();
        // gui.add( controls, 'screenSpacePanning' );
        // gui.add( params, 'speed' ).min( 0 ).max( 10 );
        gui.add( params, 'visualizeBounds' ).onChange( () => updateFromOptions() );
        gui.add( params, 'visualBoundsDepth' ).min( 1 ).max( 40 ).step( 1 ).onChange( () => updateFromOptions() );
        gui.add( params, 'shape', [ 'step', 'rail' ] );
        gui.add( transformControls, 'mode', [ 'translate', 'rotate' ] );
    
        const posFolder = gui.addFolder( 'Position' );
        posFolder.add( params.position, 'x' ).min( - 5 ).max( 5 ).step( 0.001 );
        posFolder.add( params.position, 'y' ).min( - 5 ).max( 5 ).step( 0.001 );
        posFolder.add( params.position, 'z' ).min( - 5 ).max( 5 ).step( 0.001 );
        posFolder.open();
    
        const rotFolder = gui.addFolder( 'Rotation' );
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
    }

    addEventListener(){

        transformControls.addEventListener( 'change', function () {
            params.position.copy( staircase[ params.shape ].position );
            params.rotation.copy( staircase[ params.shape ].rotation );
            params.scale.copy( staircase[ params.shape ].scale );
            gui.updateDisplay();
        } );

        transformControls.addEventListener( 'mouseDown', function () {
            orbitControl.enabled = false;
        } );

        transformControls.addEventListener( 'mouseUp', function () {
            orbitControl.enabled = true;
        } );

        orbitControl.addEventListener( 'start', function () {
            transformControls.enabled = false;
        } );

        orbitControl.addEventListener( 'end', function () {
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
        
        window.addEventListener( 'keydown', function ( event ) {
            switch ( event.key ) {
                case 'w':
                    transformControls.mode = 'translate';
                    break;
                case 'e':
                    transformControls.mode = 'rotate';
                    break;
            }
            gui.updateDisplay();
        } );

        document.getElementById('threeCanvas').addEventListener( 'mousemove', function ( event ) {
            var rect = event.target.getBoundingClientRect();
            // pointer.x = event.clientX - rect.left;
            pointer.x = ((event.clientX - rect.left) / event.target.width) * 2 - 1;
            // pointer.y = event.clientY - rect.top
            pointer.y = -(event.clientY / event.target.height) * 2 + 1 ;
            console.log( "mouse x: ", pointer.x, "mouse y: ", pointer.y);
            
            // console.log( "mouse y: ", pointer.y);
        } );
    }
}

export default INITTHREE;

export function updateFromOptions() {
	// Update bounds viz
	if ( boundsViz && ! params.visualizeBounds ) {
		scene.remove( boundsViz );
		boundsViz = null;
	}

	if ( !boundsViz && params.visualizeBounds ) {
		boundsViz = new MeshBVHVisualizer( GEOVAR.targetMesh );
		scene.add( boundsViz );
	}

	if ( boundsViz ) {
		boundsViz.depth = params.visualBoundsDepth;
	}
}