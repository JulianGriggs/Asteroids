window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);
// to help prev
var spaceAllowed = true;

function toggleSound() {
  soundOn = !soundOn;
}

function togglePause() {
  isPaused = !isPaused;
}

var Key = {
  _pressed: {},

  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
  ENTER: 13,
  M: 77,
  P: 80,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    if (inPlay) {
      this._pressed[event.keyCode] = true;
      if (event.keyCode == Key.SPACE) {
        if (spaceAllowed && !isPaused) {
          shipFiring();
          spaceAllowed = false;
        }
      }
    }
  },
  
  onKeyup: function(event) {
    if (event.keyCode == Key.SPACE && inPlay && !isPaused) {
      spaceAllowed = true;
    } else if (event.keyCode == Key.ENTER && !inPlay && isLoaded) {
      startGame();
    } else if (event.keyCode == Key.M) {
      toggleSound();
    } else if (event.keyCode == Key.P) {
      togglePause(); 
    }
    delete this._pressed[event.keyCode];
  }


};
