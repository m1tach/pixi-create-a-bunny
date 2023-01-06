import { Container, Sprite } from 'pixi.js';

export default class Bunny extends Container {
    constructor() {
        super();

        this._body = Sprite.from('bunny');
        this.addChild(this._body)  
    }
}