import { IGame } from "./game.js";
import { IGameObject, GameObject } from "./gameobject.js";
import { clamp } from "../math/util.js";
import { vec, Vector } from "../math/vector.js";
import { Player } from "./player.js";

export interface IBullet extends IGameObject {
    damage?: number;
}
export class Bullet extends GameObject implements IBullet {

    damage: number;

    constructor(args:IBullet) {
        super(args);
        this.damage = args.damage ?? 0;
    }

    update(game:IGame, deltaTime:number) {
        // #region moving / drawing
        let delta = vec.rotate(this.velocity, this.angle);
        this.position = vec.add(this.position, delta);
        this.draw(game);
        // #endregion

        return this.checkCollisions(game);
    }


    checkCollisions(game:IGame) {
        // canvas bounds
        if (this.position.x < 0) {
            return true;
        }
        if (this.position.x + this.size.x > game.ctx.canvas.width) {
            return true;
        }
        if (this.position.y < 0) {
            return true;
        }
        if (this.position.y + this.size.y > game.ctx.canvas.height) {
            return true;
        }
        // #endregion

        return false;
    }
}

export class MinionBullet extends Bullet {

    constructor(args:IBullet) {
        args.damage = 1;
        args.size = {x: 10, y: 10 };
        args.color = "red";
        args.velocity = { x: 0, y: -3};
        super(args);
    }

    override update(game:IGame, deltaTime:number, ) {
        // slightly look away from player
        let angleToPlayer = this.angleTo(game.player.gameObject.position);
        let diff = angleToPlayer - this.angle;
        this.angle += clamp(diff / 20, -0.01, 0.01);

        return super.update(game, deltaTime);
    }

    override checkCollisions(game:IGame) {
        // player
        if (this.isColliding(game.player.gameObject)) {
            game.player.hurt(this.damage, game)
            return true;
        }

        return super.checkCollisions(game);
    }
}


export interface IGraemBullet extends IBullet {
    stocksUp?: boolean
}
export class GraemBullet extends Bullet implements IGraemBullet {

    lifeSpan: number = 5;

    stocksUp:boolean;

    constructor(args:IGraemBullet, game:IGame) {
        args.size = { x: 35, y: 35 };
        args.velocity = { x: 0, y: -3 };
        args.damage = args.stocksUp ? -5 : 15;
        //args.color = stocksUp ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)";
        args.img = game.images[ `img/${args.stocksUp ? "up" : "down"}.png`];
        super(args);

        this.stocksUp = !!args.stocksUp;
    }

    override update(game: IGame, deltaTime:number): boolean {
        this.lifeSpan -= deltaTime;
        if (this.lifeSpan <= 0) return true;
        if (this.stocksUp) this.lookAt(game.player.gameObject.position);
        return super.update(game, deltaTime);
    }

    override checkCollisions(game:IGame) {
        if (this.isColliding(game.player.gameObject)) {
            game.player.hurt(this.damage, game)
            return true;
        }
        return super.checkCollisions(game);
    }


}

export class PlayerBullet extends Bullet {

    constructor(args:IBullet) {
        args.damage = 1;
        super(args);
    }

    override checkCollisions(game:IGame) {
        const graem = game.graem;

        // graem
        if (this.isColliding(graem.gameObject)) {
            game.graem.hurt(this.damage, game)
            return true;
        }

        // graems minions
        for (var i = graem.minions.length - 1; i > -1; i--) {
            let minion = graem.minions[i];
            if (this.isColliding(minion)) {
                graem.minions.splice(i, 1);
                return true;
            }
        }

        return super.checkCollisions(game);
    }
}
