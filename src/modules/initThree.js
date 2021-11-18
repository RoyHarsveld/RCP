import * as THREE from 'three';
import { params } from '/src/index.js';
import { staircase } from '/src/index.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export var _renderer, _scene, _camera, _transformControls, _controls, _gui;

class INITTHREE{
    constructor(){
        this.renderer()
        this.scene()
        this.light()
        this.camera()
        this.transformControls()
        this.controls()
        this.tools()
        this.gui()
        this.addEventListener()
    }
    renderer(){
        _renderer = new THREE.WebGLRenderer( { canvas:document.querySelector('canvas'), antialias: true } );    //The WebGL renderer displays the created scenes using WebGL (CONSTRUCTOR)
        _renderer.setPixelRatio( window.devicePixelRatio );            //Set renderer pixelRatio
        _renderer.setSize( threeCanvas.offsetWidth, threeCanvas.offsetHeight);    //Set renderer size    
    }

    scene(){
        _scene = new THREE.Scene();                          //Create a new scene (CONSTRUCTOR)
        _scene.background = new THREE.Color( 0x212224 );     //Add backgroundcolor to the scene
        _scene.fog = new THREE.FogExp2( 0x212224, 0.0025 );  //Add some nice fog, default 0.00025    
    }

    light(){
        const dirLight1 = new THREE.DirectionalLight( 0xb5b1b1, 0.8 );
        dirLight1.position.set( 100, 100, 100 );
        _scene.add( dirLight1 );
    
        const dirLight2 = new THREE.DirectionalLight( 0xa3a9d1 );
        dirLight2.position.set( -100, 100, -100 );
        _scene.add( dirLight2 );
    
        const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
        _scene.add( ambientLight );    
    }

    camera(){
        _camera = new THREE.PerspectiveCamera( 90, threeCanvas.clientWidth / threeCanvas.clientHeight, 0.1, 2000 );    //Set the camera's FoV, the heigth and width, the nearest plane, the furthest plane (CONSTRUCTOR)
        _camera.position.set( 10, 5, -10 );     //set start position        
    }

    transformControls(){
        _transformControls = new TransformControls( _camera, _renderer.domElement );
        _scene.add( _transformControls );    
    }

    controls(){
        _controls = new OrbitControls( _camera, _renderer.domElement );  //Create new controls for camera and the render canvas.
        _controls.enableDamping = true;          //Give some weight to the controls
        _controls.dampingFactor = 0.05;          //Nice value for controlweight 
        _controls.screenSpacePanning = true;    //Best controlable
        _controls.minDistance = 0;             //how far you can zoom in. Default is 0. /10
        _controls.maxDistance = 500;             //how far you can zoom out. Default is indefinite.
        _controls.maxPolarAngle = Math.PI / 2;   //How far you can orbit vertically, upper limit. Range is 0 to Math.PI radians, and default is Math.PI.    
    }

    tools(){
        const gridHelper = new THREE.GridHelper(100, 100);
        const axesHelper = new THREE.AxesHelper(50);
        _scene.add (gridHelper, axesHelper);
    }

    gui(){
        _gui = new GUI();
        _gui.add( _controls, 'screenSpacePanning' );
        _gui.add( params, 'speed' ).min( 0 ).max( 10 );
        _gui.add( params, 'visualizeBounds' ).onChange( () => updateFromOptions() );
        _gui.add( params, 'visualBoundsDepth' ).min( 1 ).max( 40 ).step( 1 ).onChange( () => updateFromOptions() );
        _gui.add( params, 'shape', [ 'step', 'sphere', 'rail' ] );
    
        _gui.add( _transformControls, 'mode', [ 'translate', 'rotate' ] );
    
        const posFolder = _gui.addFolder( 'position' );
        posFolder.add( params.position, 'x' ).min( - 5 ).max( 5 ).step( 0.001 );
        posFolder.add( params.position, 'y' ).min( - 5 ).max( 5 ).step( 0.001 );
        posFolder.add( params.position, 'z' ).min( - 5 ).max( 5 ).step( 0.001 );
        posFolder.open();
    
        const rotFolder = _gui.addFolder( 'rotation' );
        rotFolder.add( params.rotation, 'x' ).min( - Math.PI ).max( Math.PI ).step( 0.001 );
        rotFolder.add( params.rotation, 'y' ).min( - Math.PI ).max( Math.PI ).step( 0.001 );
        rotFolder.add( params.rotation, 'z' ).min( - Math.PI ).max( Math.PI ).step( 0.001 );
        rotFolder.open();
    
        const scaleFolder = _gui.addFolder('Scale')
        scaleFolder.add(params.scale, 'x', -5, 5);
        scaleFolder.add(params.scale, 'y', -5, 5);
        scaleFolder.add(params.scale, 'z', -5, 5);
        scaleFolder.open();
    
        _gui.open();
    }

    addEventListener(){
        _transformControls.addEventListener( 'change', function () {
            params.position.copy( staircase[ params.shape ].position );
            params.rotation.copy( staircase[ params.shape ].rotation );
            params.scale.copy( staircase[ params.shape ].scale );
            _gui.updateDisplay();
        } );

        _transformControls.addEventListener( 'mouseDown', function () {
            _controls.enabled = false;
        } );

        _transformControls.addEventListener( 'mouseUp', function () {
            _controls.enabled = true;
        } );

        _controls.addEventListener( 'start', function () {
            _transformControls.enabled = false;
        } );

        _controls.addEventListener( 'end', function () {
            _transformControls.enabled = true;
        } );

        window.addEventListener( 'resize', function () {
            const canvas = _renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (canvas.width !== width ||canvas.height !== height) {
                // you must pass false here or three.js sadly fights the browser
                _camera.aspect = width / height;
                _camera.updateProjectionMatrix();
                _renderer.setSize(width, height, false);
            }}, false );
        
        window.addEventListener( 'keydown', function ( e ) {
            switch ( e.key ) {
                case 'w':
                    _transformControls.mode = 'translate';
                    break;
                case 'e':
                    _transformControls.mode = 'rotate';
                    break;
            }
            _gui.updateDisplay();
        } );
    }
}

export default INITTHREE;