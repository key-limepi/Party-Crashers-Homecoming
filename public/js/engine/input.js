// Owns the keyboard Input class. Expects nothing loaded before it.
class Input {
  constructor() {
    this.left = false; this.right = false; this.jump = false; this.down = false;
    this._jumpPressed = false;
    this._abilityPressed = []; // ability taps
    this._bind();
  }
  _bind() {
    // typing guard
    const typing = () => {
      const el = document.activeElement;
      return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };
    const down = (e) => {
      if (typing()) return;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft': this.left = true; break;
        case 'ArrowRight': this.right = true; break;
        case 'ArrowDown': this.down = true; break;
        case 'ArrowUp': case ' ':
          if (!this.jump) this._jumpPressed = true;
          this.jump = true; break;
        case 'z': case 'Z': case 'x': case 'X': case 'c': case 'C':
        case 'v': case 'V': case 'b': case 'B':
        case 'n': case 'N':
          // evil keys
          if (!e.repeat) this._abilityPressed.push(e.key.toUpperCase());
          break;
      }
    };
    const up = (e) => {
      switch (e.key) {
        case 'ArrowLeft': this.left = false; break;
        case 'ArrowRight': this.right = false; break;
        case 'ArrowDown': this.down = false; break;
        case 'ArrowUp': case ' ': this.jump = false; break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
  }
  consumeJumpPressed() {
    const j = this._jumpPressed;
    this._jumpPressed = false;
    return j;
  }
  consumeAbility() {
    return this._abilityPressed.shift(); // key names
  }
}
