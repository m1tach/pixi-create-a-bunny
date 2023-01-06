import * as PIXI from "pixi.js";

import Application from "./core/Application";

if (process.env.NODE_ENV === "development") {
  // required for pixi dev tools to work
  window.PIXI = PIXI;
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new Application();
  
  const bunny = PIXI.Sprite.from('/bunny.png');
  bunny.anchor.set(0.5);
  bunny.position.set(app.view.width / 2, app.view.height / 2);
  app.stage.addChild(bunny);

  // Used for automated testing only
  if (process.env.NODE_ENV === "development") {
    window.__PIXI_APP = app;
  }
});
