import Footer from "../components/Footer";
import Scene from "./Scene";
import { BitmapText } from "pixi.js";

export default class Play extends Scene {
  async onCreated() {
    const footer = new Footer();
    footer.x = -window.innerWidth / 2;
    footer.y = window.innerHeight / 2 - footer.height;
    this.addChild(footer);

    const text = new BitmapText("Hello, PIXI", {
      fontName: "Desyrel",
    });

    text.anchor.set(0.5);

    this.addChild(text);
  }

  /**
   * Hook called by the application when the browser window is resized.
   * Use this to re-arrange the game elements according to the window size
   *
   * @param  {Number} width  Window width
   * @param  {Number} height Window height
   */
  onResize(width, height) {
    // eslint-disable-line no-unused-vars
  }
}
