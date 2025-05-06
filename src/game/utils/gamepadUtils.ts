export class GamepadHandler {
  private lastPressed: boolean[] = [];

  isButtonJustPressed(pad: Gamepad, index: number): boolean {
    const pressed = pad.buttons[index].pressed;
    const wasPressed = this.lastPressed[index] || false;
    this.lastPressed[index] = pressed;
    return pressed && !wasPressed;
  }

  reset() {
    this.lastPressed = [];
  }
}
