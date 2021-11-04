import "./index.mjs";

function render() {

	// const delta = window.performance.now() - lastTime;
	// lastTime = window.performance.now();

	// targetMesh.rotation.y += params.speed * delta * 0.001;
	// targetMesh.updateMatrixWorld();

	// stats.begin();

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