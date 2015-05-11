window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

// to help prev
var spaceAllowed = true;

var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  ENTER: 13,
  M: 77,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    if (inPlay) {
      this._pressed[event.keyCode] = true;
      if (event.keyCode == Key.SPACE) {
        if (spaceAllowed) {
          shipFiring();
          spaceAllowed = false;
        }
      }
    }
  },
  
  onKeyup: function(event) {
    if (event.keyCode == Key.SPACE) {
      spaceAllowed = true;
    } else if (event.keyCode == Key.ENTER && !inPlay && isLoaded) {
      startGame();
    } else if (event.keyCode == Key.M) {
      soundOn = !soundOn;
    } 
    delete this._pressed[event.keyCode];
  }


};
