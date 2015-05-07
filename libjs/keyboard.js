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
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
    if (event.keyCode == Key.SPACE) {
      if (spaceAllowed) {
        shipFiring();
        spaceAllowed = false;
      }
    }
  },
  
  onKeyup: function(event) {
    if (event.keyCode == Key.SPACE) {
      spaceAllowed = true;
    }
    delete this._pressed[event.keyCode];
  }


};
