// Scene object variables
var renderer, scene, camera, pointLight, spotLight;
var bgScene, bgCamera;

var ship;
var shield;
var bullets = [];
var asteroids = [];
var gif;

var bulletVelocity = 1;
var shipRotationVelocity = .1;
var START_ASTEROID_VELOCITY = .1;
var asteroidVelocity = START_ASTEROID_VELOCITY;
var FINISH_ASTEROID_VELOCITY = .25;
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

var isPaused = false;
var soundOn = true;
// a boolean to determine if everything is loaded
var isLoaded = false;

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
	color: 0xADD8E6,
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

var asteroidMaterial1 =
new THREE.MeshLambertMaterial(
{
	color: ASTEROID_COLOR
});

var asteroidMaterial2 =
new THREE.MeshLambertMaterial(
{
	color: ASTEROID_COLOR
});

var asteroidMaterial3 =
new THREE.MeshLambertMaterial(
{
	color: ASTEROID_COLOR
});

var fireMaterial =
new THREE.MeshLambertMaterial(
{
	color: 0xFFFFFF
});

var explosionMaterial = 
new THREE.MeshLambertMaterial(
{
	color: ASTEROID_COLOR
});


function startGame() {

	removeExplosion();
	var gameCanvas = document.getElementById('gameCanvas');
	gameCanvas.style.display = 'block';
	var explosionCanvas = document.getElementById('explosionCanvas');
	explosionCanvas.style.display = "none";

	inPlay = true;
	score = 0;
	updateScore();
	asteroidVelocity = START_ASTEROID_VELOCITY;
	var c = document.getElementById("hello");
	c.textContent = "Game on!"

	for (var i = 0; i < NUM_ASTEROIDS; i++) {
		resetAsteroid(asteroids[i]);
	}
	for (var i = 0; i < NUM_BULLETS; i++) {
		resetBullet(bullets[i]);
	}
}
// taken from https://github.com/buzzfeed/libgif-js
function explosion() {
	var gameCanvas = document.getElementById('gameCanvas');
	gameCanvas.style.display = 'none';
	var explosion = document.getElementById('explosion');
	explosion.src = "./gifs/giphy.gif";
	var explosionCanvas = document.getElementById('explosionCanvas');
	explosionCanvas.style.display = "block";
	setTimeout(removeExplosion, 6000);
}

function removeExplosion () {
	if (!inPlay) {
		var explosion = document.getElementById('explosion');
		explosion.src = "./textures/space_texture.jpg";
		var explosionCanvas = document.getElementById('explosionCanvas');
		explosionCanvas.style.display = "block";
	}
}

function endGame() {
	if (inPlay) {
		if (soundOn) {
			gameOverSound.play();
		}
	}
	inPlay = false;
	var c = document.getElementById("hello");
	c.textContent = "You lose. Hit enter to restart the game"
	for (var i = 0; i < NUM_ASTEROIDS; i++) {
		asteroids[i].direction = originPosition.clone();
	};
	explosion();
}

function loading(data, type){
	var loadingDiv = document.getElementById("loading");
	loadingDiv.textContent = "Loading " + type + ": " + Math.floor(data.loaded/data.total * 100) + "%"; 
	if (data.loaded / data.total == 1) {
		loadingDiv.style.display = 'none';
		var c = document.getElementById("hello");
		c.textContent = "Press enter to begin";
	}
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
	z = Math.sin(angle)*radius;

	return new THREE.Vector3(x, 0, z);
}


function setup() {
	
	function startSetup() {
		loadMaterials();
	}

	// This function loads the textures and then, once finished, calls the loadShip function
	function loadMaterials() {
		function loadAsteroid1Texture() {
			var texture = THREE.ImageUtils.loadTexture('./textures/asteroid_texture1.jpg', THREE.SphericalReflectionMapping,
				function (material) { 
					asteroidMaterial1.map = material;
					loadAsteroid2Texture();
				}, function (data) { loading(data, "asteroid 1 texture")});
		}

		function loadAsteroid2Texture() {
			var texture = THREE.ImageUtils.loadTexture('./textures/asteroid_texture2.jpg', THREE.SphericalReflectionMapping,
				function (material) { 
					asteroidMaterial2.map = material;
					loadAsteroid3Texture();
				}, function (data) { loading(data, "asteroid 2 texture")});
		}

		function loadAsteroid3Texture() {
			var texture = THREE.ImageUtils.loadTexture('./textures/asteroid_texture3.jpg', THREE.SphericalReflectionMapping,
				function (material) { 
					asteroidMaterial3.map = material;
					loadFireTexture();
				}, function (data) { loading(data, "asteroid 3 texture")});
		}

		function loadFireTexture() {
			var texture = THREE.ImageUtils.loadTexture('./textures/fire_texture.jpg', THREE.SphericalReflectionMapping,
				function (material) { 
					fireMaterial.map = material;
					loadSpaceTexture();
				}, function (data) { loading(data, "fire texture")});
		}

		function loadSpaceTexture() {
			var texture = THREE.ImageUtils.loadTexture('./textures/space_texture.jpg', THREE.SphericalReflectionMapping,
				function (material) { 
					spaceMaterial.map = material;
					loadShip();
				}, function (data) { loading(data, "space texture")});
		}

		loadAsteroid1Texture();
	}

	// This function loads the ship and then, once finished, calls finishSetup()
	function loadShip() {
		var loader = new THREE.ObjectLoader();
		loader.load( './models/star-wars-vader-tie-fighter.json', 
    	    // loader.load( '/models/star-wars-x-wing.json', 

    	    	function ( model ) {
    	    		ship = model;
    	    		finishSetup();
    	    	}, function(data) { loading(data, "ship model")});
	}

	function finishSetup() {
		createScene();
		draw();
		isLoaded = true;

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

	// Only should run these if in game play
	if (inPlay && !isPaused) {
		shipMovement();
		asteroidMovement();
		bulletMovement();
		checkCollisions();
	}
}

function createScene() 
{
	// set the scene size
	WIDTH = 560;
	HEIGHT = 560;

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
		ship.scale.set(2,2,2);
		ship.position.x = 0;
		ship.position.y = 0;
		ship.position.z = 0;

		var direction = new THREE.Vector3(10,0,0);
		ship.lookAt(direction);

	    // the .negate() is so that the bullet comes from the front of the ship
	    ship.direction = direction.clone().negate().normalize();
	    scene.add( ship );

	  }

	  function createShield() {
	  	var bbox = new THREE.BoundingBoxHelper( ship, 0xFFFFFF );
	  	bbox.update();
	  	shield = new THREE.Mesh(
	  		new THREE.SphereGeometry(bbox.box.getBoundingSphere().radius * .7,
	  			8,
	  			8),
	  		shieldMaterial);
//		scene.add(shield);
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

	function createAsteroids() {
		// create 25 asteroids available to use
		for (var i = 0; i < NUM_ASTEROIDS; i++) {
			var rand = getRandomInt(1, 4);
			var radius = rand;
			var segments = 8;
			var rings = 8;
			var material;
			if (i < NUM_ASTEROIDS *  (1/3)) material = asteroidMaterial1.clone();
			else if (i < NUM_ASTEROIDS * (2/3)) material = asteroidMaterial2.clone();
			else material = asteroidMaterial3.clone()
				var ast = new THREE.Mesh(
					new THREE.SphereGeometry(radius,
						segments,
						rings),
					material);
			
			ast.velocity = asteroidVelocity;
			ast.mass = rand;
			ast.isShot = false;
			resetAsteroid(ast)
			scene.add(ast);
			asteroids.push(ast);
		};
	}

	function createLights() {
		// create a point light
		pointLight = new THREE.PointLight(0xF8D898);

		// set its position
		pointLight.position.x = 0;
		pointLight.position.y = 1000;
		pointLight.position.z = 0;
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
		camera.position.y = 50;

		camera.lookAt(originPosition);
	}

	function createSounds() {
 		// credit http://soundbible.com/
 		gameOverSound = new Audio("./sounds/Blast-SoundBible.com-2068539061.wav");
 		// credit http://www.freesfx.co.uk/
 		shipFiringSound = new Audio("./sounds/science_fiction_laser_005.mp3");
 	}

 	createShip();
 	createShield();
 	createBullets();
 	createAsteroids();
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
		ship.rotation.y += shipRotationVelocity;
		ship.direction = ship.direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0), shipRotationVelocity);
	}	
	// move right
	else if (Key.isDown(Key.RIGHT) || Key.isDown(Key.UP))
	{
		ship.rotation.y -= shipRotationVelocity;
		ship.direction = ship.direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0), -shipRotationVelocity);
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
	bullet.position.z < -30 || 
	bullet.position.z > 30)
{
	resetBullet(bullet);
	bullet.position.set(0,0,0);
	bullet.direction.set(0,0,0);
	makeTransparent(bullet);
}
}

var TIME_STEP = 100;

function fade1 (arg) {
	return function () {
		arg.material.transparent = true;
		arg.material.opacity = .8;
		setTimeout(fade2(arg), TIME_STEP);
	}
}
function fade2 (arg) {
	return function () {
		arg.material.opacity = .6;
		setTimeout(fade3(arg), TIME_STEP);
	}
}
function fade3 (arg) {
	return function () {
		arg.material.opacity = .4;
		setTimeout(fade4(arg), TIME_STEP);
	}
}
function fade4 (arg) {
	return function () {
		arg.material.opacity = .2;
		setTimeout(fade5(arg), TIME_STEP);
	}
}
function fade5 (arg) {
	return function () {
		arg.material.opacity = 0;
		setTimeout(resetAsteroid(arg), TIME_STEP);
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

	var rand = getRandomInt(1, 4);
	var material;
	if (rand == 1) material = asteroidMaterial1.clone();
	else if (rand == 2) material = asteroidMaterial2.clone();
	else material = asteroidMaterial3.clone()

	ast.material = material;
	ast.isShot = false;
	ast.velocity = asteroidVelocity;
}

function resetAsteroidIfOutOfBounds(ast)
{
	if (ast.position.x < -50  || 
		ast.position.x >  50  || 
		ast.position.z < -50 || 
		ast.position.z > 50)
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
		asteroids[i].position = asteroids[i].position.add(asteroids[i].direction.clone().multiplyScalar(asteroids[i].velocity));
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
 			if (sphere1.intersectsSphere(sphere2) && !asteroids[i].isShot && !asteroids[j].isShot)
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
			if (sphere1.intersectsSphere(sphere2) && !asteroids[i].isShot)
			{
				asteroids[i].material = fireMaterial.clone();
				asteroids[i].isShot = true;
				asteroids[i].velocity = 0;
				setTimeout(fade1(asteroids[i]), TIME_STEP);
				resetBullet(bullets[j]);
				score += 1;
				if (score % 10 == 0) {
					makeHarder();
				}
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



function makeHarder() {
	if (asteroidVelocity < FINISH_ASTEROID_VELOCITY) {
		asteroidVelocity += .01;
	}
	return;
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
			if (soundOn) {
				shipFiringSound.play();
			}
			break;
		} 
	};
}
