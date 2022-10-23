import { MinionBullet } from "./bullet.js";
import { IGame } from "./game.js";
import { GameObject, IGameObject } from "./gameobject.js";
import { vec, Vector } from "../math/vector.js";
import { Player } from "./player.js";


export interface IMinion extends IGameObject {
    sx:number,
    sy: number
}

export class Minion extends GameObject {

    static readonly SPRITE_WIDTH = 40;
    static readonly SPRITE_HEIGHT = 40;

    constructor(args:IGameObject, game:IGame) {
        if (!args) args = {};
        args.img = game.images["img/rotmg.png"];
        args.sx = (args.sx || 0) * Minion.SPRITE_WIDTH;
        args.sy = (args.sy || 0) * Minion.SPRITE_HEIGHT;
        args.sw = Minion.SPRITE_WIDTH;
        args.sh = Minion.SPRITE_HEIGHT;
        args.size = { x: Minion.SPRITE_WIDTH, y: Minion.SPRITE_HEIGHT };
        super(args);
    }


    shootTimer = 0;
    shootDelay = 2;

    update(game:IGame, deltaTime:number) {

        // shooting on delay
        if ((this.shootTimer += deltaTime) >= this.shootDelay) {
            this.shootTimer = 0;

            //console.log("minion shoot: ", this.position);
            let bullet = new MinionBullet({
                position: vec.copy(this.position),
                angle: this.angleTo(game.player.gameObject.position)
            });

            game.bullets.push(bullet)
        }

        this.draw(game);

    }
}
