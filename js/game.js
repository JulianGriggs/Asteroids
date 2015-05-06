// Scene object variables
var renderer, scene, camera, pointLight, spotLight;

var ship;
var bullets = [];
var bullet1;
var bullet2;
var bullet3;

var bulletVelocity = 0.4;
var WIDTH;
var HEIGHT;
var NUM_BULLETS = 15;
var BULLET_COLOR = 0xD43381;
var originPosition = new THREE.Vector3(0,0,0);

function setup()
{
    createScene();
    draw();
}
 
 
function draw()
{
  	// draw THREE.js scene
  	renderer.render(scene, camera);
	requestAnimationFrame(draw);
	shipMovement();
	// shipFiring();
	bulletMovement();

}

function createScene() 
{
	// set the scene size
	WIDTH = 640;
	HEIGHT = 360;

	// create a WebGL renderer, camera, and a scene
	renderer = new THREE.WebGLRenderer();

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the renderer-supplied DOM element
	var c = document.getElementById("gameCanvas");
	c.appendChild(renderer.domElement);


	// Camera Settings
	var VIEW_ANGLE = 50;
	var ASPECT = WIDTH / HEIGHT;
	var NEAR = 0.1;
	var FAR = 10000;

	camera = new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR);

	scene = new THREE.Scene();

	// add the camera to the scene
	scene.add(camera);

	// set a default position for the camera
	// not doing this somehow messes up shadow rendering
	camera.position.z = 30;


	// // set up the tetrahedron vars
	// var radius = 5;
	// var detail = 0;
	// set up the cylinder vars
	var radiusTop = 2;
	var radiusBottom = 2;
	var height = 4;
	var radiusSegments = 8;


	// create the sphere's material
	var shipMaterial =
	new THREE.MeshLambertMaterial(
	{
		color: 0xD43001
	});

	var loader = new THREE.ObjectLoader();
        loader.load( '/models/star-wars-vader-tie-fighter.json', function ( model ) {
        ship = model;
        ship.scale.set(2,2,2);

        ship.position.x =0;
        ship.position.y =0;
        ship.position.z =0;
        ship.direction = ship.up.clone();
        scene.add( ship );
        }); 
	 
	
	// // Create a ship with cylinder geometry
	// ship = new THREE.Mesh(
	//     new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments),
	//     shipMaterial);
	// ship.direction = ship.up.clone();
	// // add the sphere to the scene
	// scene.add(ship);


	// set up the sphere vars
	// lower 'segment' and 'ring' values will increase performance
	var radius = .5,
	segments = 4,
	rings = 4;

	// create 15 bullets available to use
	for (var i = 0; i < NUM_BULLETS; i++) {
		var bulletMaterial =
		new THREE.MeshLambertMaterial(
		{
			color: 0xD43381,
			transparent: true,
			opacity: 0.0
		});
		var bullet = new THREE.Mesh(
		new THREE.SphereGeometry(radius,
			segments,
			rings),
			bulletMaterial);
		bullet.direction = new THREE.Vector3(0,0,0);
		scene.add(bullet);
		bullets.push(bullet);
	};

	// // create a point light
	pointLight = new THREE.PointLight(0xF8D898);
	 
	// set its position
	pointLight.position.x = -1000;
	pointLight.position.y = 0;
	pointLight.position.z = 1000;
	pointLight.intensity = 2.9;
	pointLight.distance = 10000;
	 
	// add to the scene
	scene.add(pointLight);
}

function makeOpaque(bullet) {
	bullet.material.transparent = false;
	bullet.material.opacity = 1.0;
}

function makeTransparent(bullet) {
	bullet.material.transparent = true;
	bullet.material.opacity = 0.0;
}

// Handles player's ship rotation
function shipMovement()
{
	// move left
	if (Key.isDown(Key.LEFT) || Key.isDown(Key.DOWN))		
	{
		ship.rotation.z += .07;
		ship.direction = ship.up.clone().applyAxisAngle(new THREE.Vector3(0,0,1), ship.rotation.z);
	}	
	// move right
	else if (Key.isDown(Key.RIGHT) || Key.isDown(Key.UP))
	{
		ship.rotation.z -= .07;
		ship.direction = ship.up.clone().applyAxisAngle(new THREE.Vector3(0,0,1), ship.rotation.z);	
	}
	else
	{
		// Do nothing
	}
}

// TODO: Need to figure out how to make this not hardcoded
function resetBulletIfOutOfBounds(bullet) {

	// if (bullet.position.x < -WIDTH / 2  || 
	// 		bullet.position.x >  WIDTH / 2  || 
	// 		bullet.position.y < -HEIGHT / 2 || 
	// 		bullet.position.y > HEIGHT / 2)
	if (bullet.position.x < -30  || 
			bullet.position.x >  30  || 
			bullet.position.y < -30 || 
			bullet.position.y > 30)
	{
		bullet.position.set(0,0,0);
		bullet.direction.set(0,0,0);
		makeTransparent(bullet);
	}
}

function bulletMovement()
{

	for (var i = 0; i < bullets.length; i++) {
		resetBulletIfOutOfBounds(bullets[i]);
	};

	for (var i = 0; i < bullets.length; i++) {
		bullets[i].position = bullets[i].position.add(bullets[i].direction.clone().multiplyScalar(bulletVelocity));
	};

}

function shipFiring()
{
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].position.equals(originPosition)) {
			bullets[i].direction = ship.direction.clone();
			makeOpaque(bullets[i]);
			break;
		} 

	};
}
