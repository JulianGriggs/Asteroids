// Scene object variables
var renderer, scene, camera, pointLight, spotLight;
var bgScene, bgCamera;

var ship;
var shield;
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

// the users score (number of asteroids hit)
var score = 0;

// a boolean to determine if the user is currenlty playing the game
var inPlay = false;

var gameOverSound;
var shipFiringSound;

// create the sphere's material
var shipMaterial =
	new THREE.MeshLambertMaterial(
	{
		color: 0xD43001
	});

var shieldMaterial = 
	new THREE.MeshBasicMaterial(
	{
		color: 0xFFFF00,
		transparent: true,
		opacity: 0.7
	});

var spaceMaterial = 
	new THREE.MeshBasicMaterial(
	{
		color: 0xFFFFFF,
	});

var bulletMaterial = 
	new THREE.MeshLambertMaterial(
	{
		color: BULLET_COLOR,
		transparent: true,
		opacity: 0.0
	});

var asteroidMaterial =
	new THREE.MeshLambertMaterial(
	{
		color: ASTEROID_COLOR
	});

function startGame() {
	console.log(camera);
	inPlay = true;
	score = 0;
	updateScore();
	var c = document.getElementById("hello");
	c.textContent = "Game on!"
	if (asteroids.length == 0) {
		createAsteroids();
	} else {
		for (var i = 0; i < asteroids.length; i++) {
			resetAsteroid(asteroids[i]);
		};
	}
}

function endGame() {
	if (inPlay) {
		gameOverSound.play();
	}
	inPlay = false;
	var c = document.getElementById("hello");
	c.textContent = "You lose. Hit enter to restart the game"
	for (var i = 0; i < asteroids.length; i++) {
		asteroids[i].direction = originPosition.clone();
	};
}

function loading(data, type){
	var loadingDiv = document.getElementById("loading");
	loadingDiv.textContent = "Loading " + type + ": " + Math.floor(data.loaded/data.total * 100) + "%"; 
	if (data.loaded / data.total == 1) loadingDiv.style.display = 'none';
}


function createAsteroids() {
	// create 25 asteroids available to use
	for (var i = 0; i < NUM_ASTEROIDS; i++) {
		var radius = 2;
		var segments = 4;
		var rings = 4;

		var ast = new THREE.Mesh(
			new THREE.SphereGeometry(radius,
				segments,
				rings),
			asteroidMaterial.clone());
		resetAsteroid(ast)
		scene.add(ast);
		asteroids.push(ast);
	};
}

function updateScore() {
	var c = document.getElementById("currentScore");
	c.textContent = "SCORE: " + score.toString();
}

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
 
 
function setup() {
	
	function startSetup() {
		loadMaterials();
	}

	// This function loads the textures and then, once finished, calls the loadShip function
	function loadMaterials() {
		function loadAsteroidTexture() {
			var texture = THREE.ImageUtils.loadTexture('/textures/stone_texture.jpg', THREE.SphericalReflectionMapping,
			function (material) { 
				asteroidMaterial.map = material;
				loadShieldTexture();
			}, function (data) { loading(data, "asteroid texture")});
		}
		function loadShieldTexture() {
			var texture = THREE.ImageUtils.loadTexture('/textures/shield_texture.jpg', THREE.SphericalReflectionMapping,
			function (material) { 
				shieldMaterial.map = material;
				loadSpaceTexture();
			}, function (data) { loading(data, "shield texture")});
		}
		function loadSpaceTexture() {
			var texture = THREE.ImageUtils.loadTexture('/textures/space_texture.jpg', THREE.SphericalReflectionMapping,
			function (material) { 
				spaceMaterial.map = material;
				loadShip();
			}, function (data) { loading(data, "space texture")});
		}

		loadAsteroidTexture();
	}

	// This function loads the ship and then, once finished, calls finishSetup()
	function loadShip() {
		var loader = new THREE.ObjectLoader();
    	loader.load( '/models/star-wars-vader-tie-fighter.json', 
    		function ( model ) {
				ship = model;
				finishSetup();
			}, function(data) { loading(data, "ship model")});
	}

	function finishSetup() {
		createScene();
		draw();
	}

	startSetup();
}

function draw()
{
  	// draw THREE.js scene
  	renderer.autoClear = false;
	renderer.clear();
  	renderer.render(bgScene, bgCamera);
  	renderer.render(scene, camera);
	requestAnimationFrame(draw);
	shipMovement();
	asteroidMovement();
	bulletMovement();
	checkCollisions();
}

function createScene() 
{
	// set the scene size
	WIDTH = 640;
	HEIGHT = 640;

	// create a WebGL renderer, camera, and a scene
	renderer = new THREE.WebGLRenderer();

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the renderer-supplied DOM element
	var c = document.getElementById("gameCanvas");
	// var c = document.body;
	c.appendChild(renderer.domElement);

	var bg = new THREE.Mesh(
	  new THREE.PlaneGeometry(2, 2, 0), spaceMaterial
	);

	// The bg plane shouldn't care about the z-buffer.
	bg.material.depthTest = false;
	bg.material.depthWrite = false;

	bgScene = new THREE.Scene();
	bgCamera = new THREE.Camera();
	bgScene.add(bgCamera);
	bgScene.add(bg);
	scene = new THREE.Scene();

	function createShip() {
	    ship.scale.set(1,1,1);
	    ship.position.x = 0;
	    ship.position.y = 0;
	    ship.position.z = 0;
	    ship.direction = ship.up.clone();
    	scene.add( ship );
	}

	function createShield() {
		var bbox = new THREE.BoundingBoxHelper( ship, 0xFFFFFF );
		bbox.update();
		shield = new THREE.Mesh(
		new THREE.SphereGeometry(bbox.box.getBoundingSphere().radius,
			8,
			8),
			shieldMaterial);
		scene.add(shield);
	}

	function createBullets() {
		// create 15 bullets available to use
		for (var i = 0; i < NUM_BULLETS; i++) {
			var radius = .5;
			var segments = 4;
			var rings = 4;
			var bullet = new THREE.Mesh(
				new THREE.SphereGeometry(radius,
					segments,
					rings),
					bulletMaterial.clone());
			bullet.direction = new THREE.Vector3(0,0,0);
			makeTransparent(bullet);
			scene.add(bullet);
			bullets.push(bullet);
		};
	}

	function createLights() {
		// create a point light
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

	function createCamera() {
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

		scene.add(camera);

		// set a default position for the camera
		// not doing this somehow messes up shadow rendering
		camera.position.z = 50;
 	}

 	function createSounds() {
 		// credit http://soundbible.com/
 		gameOverSound = new Audio("/sounds/Blast-SoundBible.com-2068539061.wav");
 		// credit http://www.freesfx.co.uk/
 		shipFiringSound = new Audio("/sounds/science_fiction_laser_005.mp3");
 	}

	createShip();
	createShield();
	createBullets();
	createLights();
	createCamera();
	createSounds();

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

function resetBulletIfOutOfBounds(bullet) 
{

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
	var hasCollision = true;
	while (hasCollision) {
		var hasCollision = false;
		ast.position.copy(getRandomPointOnCircle(50));
		ast.direction = getRandomPointOnCircle(50).sub(ast.position).normalize();
		var sphere1 = new THREE.Sphere(ast.position, ast.geometry.boundingSphere.radius);
		for (var i = 0; i < asteroids.length; i++) {
			if (ast == asteroids[i]) continue; // pointer comparison
			var sphere2 = new THREE.Sphere(asteroids[i].position, asteroids[i].geometry.boundingSphere.radius);
			if (sphere1.intersectsSphere(sphere2)) {
				hasCollision = true;
				break;
			}
		};
	} 
	ast.mass = 1; //perhaps change later
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

 		// Check collisions between asteroids
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
		// Check collisions between asteroid and bullet
		for (var j = 0; j < bullets.length; j++) {
			sphere2 = new THREE.Sphere(bullets[j].position, bullets[j].geometry.boundingSphere.radius);
			if (sphere1.intersectsSphere(sphere2))
			{
				resetAsteroid(asteroids[i]);
				resetBullet(bullets[j]);
				score += 1;
				updateScore();
			}
		}
		// Check collisions between asteroid and ship
		sphere2 = shield.geometry.boundingSphere;
		if (sphere1.intersectsSphere(sphere2))
		{
			// game over
			endGame();
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
			 
			shipFiringSound.pause();
			shipFiringSound.currentTime = 0;
			shipFiringSound.play();
			break;
		} 
	};
}
