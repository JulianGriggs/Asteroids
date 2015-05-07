// Scene object variables
var renderer, scene, camera, pointLight, spotLight;

var ship;
var bullets = [];
var asteroids = [];

var bulletVelocity = 0.4;
var asteroidVelocity = 0.1;
var WIDTH;
var HEIGHT;
var NUM_BULLETS = 15;
var BULLET_COLOR = 0xD43381;
var originPosition = new THREE.Vector3(0,0,0);
var NUM_ASTEROIDS = 25;
var ASTEROID_COLOR = 0xFFFFFF;

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomPointOnCircle(radius) {
	var angle = Math.random()*Math.PI*2;
	x = Math.cos(angle)*radius;
	y = Math.sin(angle)*radius;

	return new THREE.Vector3(x, y, 0);
}

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
	asteroidMovement();
	// shipFiring();
	bulletMovement();
	checkCollisions();

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
	 	
	// create 15 bullets available to use
	for (var i = 0; i < NUM_BULLETS; i++) {
		var radius = .5;
		var segments = 4;
		var rings = 4;
		var bulletMaterial = new THREE.MeshLambertMaterial(
			{
				color: BULLET_COLOR,
				transparent: true,
				opacity: 0.0
			});
		var bullet = new THREE.Mesh(
		new THREE.SphereGeometry(radius,
			segments,
			rings),
			bulletMaterial);
		bullet.direction = new THREE.Vector3(0,0,0);
		makeTransparent(bullet);
		scene.add(bullet);
		bullets.push(bullet);
	};

	// create 25 asteroids available to use
	for (var i = 0; i < NUM_ASTEROIDS; i++) {
		var radius = 2;
		var segments = 4;
		var rings = 4;
		var asteroidMaterial =
		new THREE.MeshLambertMaterial(
		{
			color: ASTEROID_COLOR

		});
		var ast = new THREE.Mesh(
		new THREE.SphereGeometry(radius,
			segments,
			rings),
			asteroidMaterial);
		
		ast.position.copy(getRandomPointOnCircle(50));
		ast.direction = getRandomPointOnCircle(50).sub(ast.position).normalize();
		ast.mass = 1; // change later perhaps
		scene.add(ast);
		asteroids.push(ast);
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
function resetBullet(bullet)
{
	bullet.position.set(0,0,0);
	bullet.direction.set(0,0,0);
	makeTransparent(bullet);
}

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
		resetBullet(bullet);
		bullet.position.set(0,0,0);
		bullet.direction.set(0,0,0);
		makeTransparent(bullet);
  }
}

function resetAsteroid(ast)
{
	ast.position.copy(getRandomPointOnCircle(50));
	ast.direction = getRandomPointOnCircle(50).sub(ast.position).normalize();
}

function resetAsteroidIfOutOfBounds(ast)
{
	if (ast.position.x < -50  || 
			ast.position.x >  50  || 
			ast.position.y < -50 || 
			ast.position.y > 50)
	{
		resetAsteroid(ast);
	}
}

function asteroidMovement()
{
	for (var i = 0; i < asteroids.length; i++) {
		resetAsteroidIfOutOfBounds(asteroids[i]);
	};

	for (var i = 0; i < asteroids.length; i++) {
		asteroids[i].position = asteroids[i].position.add(asteroids[i].direction.clone().multiplyScalar(asteroidVelocity));
	};
}

function checkCollisions()
{
	for (var i = 0; i < asteroids.length; i++) {
		var sphere1 = new THREE.Sphere(asteroids[i].position, asteroids[i].geometry.boundingSphere.radius);
		var sphere2;
 
		for (var j = i + 1; j < asteroids.length; j++) {
			sphere2 = new THREE.Sphere(asteroids[j].position, asteroids[j].geometry.boundingSphere.radius);
			if (sphere1.intersectsSphere(sphere2))
			{
				// collision formula and code taken in part from the following website
        // https://nicoschertler.wordpress.com/2013/10/07/elastic-collision-of-circles-and-spheres/				
        var iRadius = asteroids[i].geometry.boundingSphere.radius;
				var jRadius = asteroids[j].geometry.boundingSphere.radius;
				var iCenter = asteroids[i].position;
				var jCenter = asteroids[j].position;
				var iVel = asteroids[i].direction.clone();
				var jVel = asteroids[j].direction.clone();

				var iNormal = jCenter.clone().sub(iCenter);
				var iInt = iNormal.clone().add(iCenter);
				
				var jNormal = iCenter.clone().sub(jCenter);
				var jInt = jNormal.clone().add(jCenter);

				var collisionNormal = jNormal.clone().normalize();
				var iDot = collisionNormal.clone().dot(iVel);
				var iCol = collisionNormal.clone().multiplyScalar(iDot);
				var iRem = iVel.clone().sub(iCol);

				var jDot = collisionNormal.clone().dot(jVel);
				var jCol = collisionNormal.clone().multiplyScalar(jDot);
				var jRem = jVel.clone().sub(jCol);

				var iLength = iCol.length() * Math.sign(iDot);
				var jLength = jCol.length() * Math.sign(jDot);
				var commonVel = 2 * (asteroids[i].mass * iLength + asteroids[j].mass * jLength) / (asteroids[i].mass + asteroids[j].mass);
				var iLengthAfter = commonVel - iLength;
				var jLengthAfter = commonVel - jLength;
				iCol.multiplyScalar(iLengthAfter/iLength);
				jCol.multiplyScalar(jLengthAfter/jLength);

				asteroids[i].direction.copy(iCol);
				asteroids[i].direction.add(iRem); 
				asteroids[j].direction.copy(jCol);
				asteroids[j].direction.add(jRem); 
			}
		}
		for (var k = 0; k < bullets.length; k++) {
			sphere2 = new THREE.Sphere(bullets[k].position, bullets[k].geometry.boundingSphere.radius);
			if (sphere1.intersectsSphere(sphere2))
			{
				resetAsteroid(asteroids[i]);
				resetBullet(bullets[k]);
			}
		}
	};
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
