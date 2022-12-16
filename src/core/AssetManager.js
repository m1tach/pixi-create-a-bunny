import { Loader, Spritesheet, Texture } from "pixi.js";

import { Howl } from "howler";
import config from "../config";

const assets = import.meta.glob("/src/assets/**/*.*");

const IMG_EXTENSIONS = ["jpeg", "jpg", "png"];
const SOUND_EXTENSIONS = ["wav", "ogg", "m4a", "mp3"];
const FONT_EXTENSIONS = ["xml", "fnt"];
const SPRITESHEET_EXTENSIONS = ["json"];

/**
 * Global asset manager to help streamline asset usage in your game.
 * Automatically scans and stores a manifest of all available assets, so that they could
 * be loaded at any time
 *
 */
class AssetManager {
  constructor() {
    this.renderer = null;

    this._assets = {};
    this._sounds = {};
    this._images = {};
    this._fonts = {};
    this._spritesheets = {};

    this._importAssets();
  }

  /**
   * The main method of the AssetManager, use this to load any desired assets
   *
   * ```js
   * AssetManager.load({
   *  images: {
   *    logo: Assets.images.logo,
   *    logoBack: Assets.images.logoBack,
   *  }
   * })
   * ```
   *
   * @type {Object} options.images id-url object map of the images to be loaded
   * @type {Object} options.sounds id-url object map of the sounds to be loaded
   * @type {Object} options.fonts id-url object map of the fonts to be loaded
   * @type {Function} progressCallback Progress callback function, called every time a single asset is loaded
   *
   * @return {Promise} Returns a promise that is resolved once all assets are loaded
   */
  load(
    assets = {
      images: this._images,
      sounds: this._sounds,
      fonts: this._fonts,
      spritesheets: this._spritesheets,
    },
    progressCallback = () => {}
  ) {
    const { images, sounds, fonts, spritesheets } = assets;
    const assetTypesCount = Object.keys(assets).length;
    const imagesCount = images ? Object.keys(images).length : 0;
    const soundsCount = sounds ? Object.keys(sounds).length : 0;
    const fontsCount = fonts ? Object.keys(fonts).length : 0;
    const spritesheetsCount = spritesheets
      ? Object.keys(spritesheets).length
      : 0;
    const loadPromises = [];
    let loadProgress = 0;

    const calcTotalProgress = (val) => {
      loadProgress += val / assetTypesCount;
      progressCallback(parseInt(loadProgress, 10));
    };

    if (imagesCount) {
      loadPromises.push(
        this.loadAssets(images, () => calcTotalProgress(100 / imagesCount))
      );
    }

    if (soundsCount) {
      loadPromises.push(this.loadSounds(sounds, calcTotalProgress));
    }

    if (fontsCount) {
      loadPromises.push(this.loadAssets(fonts, calcTotalProgress));
    }

    if (spritesheetsCount) {
      loadPromises.push(this.loadSpritesheets(spritesheets, calcTotalProgress));
    }

    return Promise.all(loadPromises);
  }

  /**
   * Create a Loader instance and add the game assets to the queue
   *
   * @return {Promise} Resolved when the assets files are downloaded and parsed into texture objects
   */
  loadAssets(images = {}, progressCallback = () => {}) {
    const loader = new Loader(config.root);

    for (const [img, url] of Object.entries(images)) {
      loader.add(img, url);
    }

    loader.onProgress.add(() => progressCallback(loader.progress));

    return new Promise(loader.load.bind(loader));
  }

  /**
   * Prerender our loaded textures, so that they don't need to be uploaded to the GPU the first time we use them.
   * Very helpful when we want to swap textures during an animation without the animation stuttering
   *
   * @return {Promise} Resolved when all queued uploads have completed
   */
  prepareImages(images = {}, renderer = this.renderer) {
    const prepare = renderer.plugins.prepare;

    for (const [img] of Object.entries(images)) {
      prepare.add(Texture.from(img));
    }

    return new Promise(prepare.upload.bind(prepare));
  }

  /**
   * Create a Howl instance for each sound asset and load it.
   *
   * @return {Promise} Resolved when the assets files are downloaded and parsed into Howl objects
   */
  loadSounds(sounds = {}, progressCallback = () => {}) {
    const soundPromises = [];

    for (const [id, url] of Object.entries(sounds)) {
      soundPromises.push(this._loadSound(id, url));
    }

    // currently howler doesn't support loading progress
    Promise.all(soundPromises).then(progressCallback(100));

    return soundPromises;
  }

  /**
   * Load a spritesheet from json files
   */
  loadSpritesheets(spritesheets = {}, progressCallback = () => {}) {
    const loader = new Loader();

    for (const [id, data] of Object.entries(spritesheets)) {
      loader.add(id, data.meta.image);
    }

    loader.onProgress.add((loader, resource) => {
      const spritesheet = new Spritesheet(
        resource.texture,
        spritesheets[resource.name]
      );

      this._spritesheets[resource.name] = spritesheet;

      spritesheet.parse(() => {
        progressCallback(loader.progress);
      });
    });

    return new Promise(loader.load.bind(loader));
  }

  /**
   * Manifest of all available images
   */
  get images() {
    return this._images;
  }

  /**
   * Manifest of all available sounds
   */
  get sounds() {
    return this._sounds;
  }

  /**
   * Manifest of all available fonts
   */
  get fonts() {
    return this._fonts;
  }

  /**
   * Manifest of all available assets
   */
  get assets() {
    return this._assets;
  }

  /**
   * Manifest of all available spritesheets
   */
  get spritesheets() {
    return this._spritesheets;
  }

  _loadSound(id, url) {
    const sound = new Howl({ src: [url] });

    this._sounds[id] = sound;

    return new Promise((res) => sound.once("load", res));
  }

  /**
   * Scans the assets directory and creates a manifest of all available assets, split into categories.
   * Currently supports images and sounds.
   *
   * @private
   */
  _importAssets() {
    Object.entries(assets).forEach(async ([filename, asset]) => {
      let [id, ext] = filename.split("."); // eslint-disable-line prefer-const

      id = id.replace("/src/assets/", "");
      const url = filename.replace("src/assets/", "");
      this._assets[id] = url;

      if (IMG_EXTENSIONS.indexOf(ext) > -1) {
        this._images[id] = url;
      }

      if (SOUND_EXTENSIONS.indexOf(ext) > -1) {
        this._sounds[id] = url;
      }

      if (FONT_EXTENSIONS.indexOf(ext) > -1) {
        this._fonts[id] = url;
      }

      if (SPRITESHEET_EXTENSIONS.indexOf(ext) > -1) {
        this._spritesheets[id] = url;

        return;
      }
    });
  }
}

export default new AssetManager();
