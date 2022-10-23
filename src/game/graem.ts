import { GraemBullet } from "./bullet.js";
import { IGame } from "./game.js";
import { GameObject } from "./gameobject.js";
import { Vector } from "../math/vector.js";
import { Player } from "./player.js";
import { vec } from "../math/vector.js";
import { Minion } from "./minion.js";
import { clamp } from "../math/util.js";

export class Graem {

    gameObject:GameObject;

    constructor (game:IGame) {
        let img = game.images["img/graem_sad.png"];
        let width = 200;
        let height = width * img.height / img.width;
        this.gameObject = new GameObject({
            img: img,
            size: { x: width, y: height },
            position: { x: game.ctx.canvas.width / 2, y: 20 + height / 2 },
            velocity: { x: 5, y: 0 }
        });
    }



    bobTimer = 0;
    bobDelay = 0.5;
    bobDirection = 1;
    bobSpeed = 1;
    bobAmount = 1;
    bob (deltaTime:number) {
        if ((this.bobTimer += deltaTime) > this.bobDelay) {
            this.bobTimer = 0;
            (this.bobDirection *= -1)
        }

        let sizeChange = this.bobDirection * this.bobAmount;
        this.gameObject.size.x += sizeChange;
        this.gameObject.size.y += sizeChange;
        this.gameObject.radius = this.gameObject.size.x / 2;
    }


    move (deltaTime:number, game:IGame) {
        let obj = this.gameObject;
        obj.move(deltaTime, game);
        if (obj.position.x >= game.ctx.canvas.width - 100 || obj.position.x <= 100) {
            console.log(obj.position.x + " + " + obj.size.x + " = " + (obj.position.x + obj.size.x));
            console.log("hey");
            obj.velocity.x *= -1;
        }
    }


    shootTimer = 0;
    shootDelay = 3;
    shoot (deltaTime:number, game:IGame) {
        // shooting on delay
        this.shootTimer += deltaTime;
        if (this.shootTimer >= this.shootDelay) {

            this.shootTimer = 0;

            let stocksUp = Math.random() > 0.66;

            this.gameObject.img = game.images[`img/${stocksUp ? "graem_happy" : "graem_sad"}.png`];

            let bullet = new GraemBullet({
                stocksUp: stocksUp,
                position: vec.copy(this.gameObject.position),
                angle: this.gameObject.angleTo(game.player.gameObject.position)
            }, game);

            game.bullets.push(bullet)
        }
    }



    update (game:IGame, deltaTime:number) {
        this.bob(deltaTime);
        this.move(deltaTime, game);

        this.shoot(deltaTime,game);    
        this.gameObject.draw(game);

        // spawning minions
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnDelay) {
            this.spawnTimer = 0;
            let count = Math.floor(Math.random() * 10);
            this.spawnMinions(count, game);
        }
     }




    spawnTimer = 0;
    spawnDelay = 10;
    minions: Minion[] = [];

    spawnMinions (count:number, game:IGame) {
        console.log("SPAWNING " + count + " MINIONS...");

        const min_sprite_y = 5;
        const max_sprite_y = 20;

        const canvas = game.ctx.canvas;

        // making sure new minion doesn't collide with anything. this could result in many more than "count" loops
        // theoretically, the arena could get so filled up that there isn't any room left, so i'm creating an limit on number of attempts
        let i = 0, numAttempts = 0;
        while (i < count && ++numAttempts < 50) {

      

            let minion = new Minion({
                sx: Math.floor(Math.random() * 24),
                sy: min_sprite_y + Math.floor(Math.random() * (max_sprite_y - min_sprite_y)),
                position: { 
                    x: clamp(Math.random() * canvas.width, Minion.SPRITE_WIDTH, canvas.width - Minion.SPRITE_WIDTH), 
                    y: clamp(Math.random() * canvas.height, Minion.SPRITE_HEIGHT, canvas.height - Minion.SPRITE_HEIGHT) 
                }
            }, game);

            let collision = minion.isColliding(game.player.gameObject) || minion.isColliding(game.graem.gameObject);
            if (!collision) {
                for (var j = 0; j < game.graem.minions.length; j++) {
                    if (minion.isColliding(game.graem.minions[j])) {
                        collision = true;
                        break;
                    }
                }
            }
            if (!collision) {
                this.minions.push(minion);
                i++;
            }
        }      
    }

    health = 100;
    hurt (damage:number, game:IGame) {
        if (this.health > 0) {
            this.health -= damage;

            game.ui.boss_health.style.width = this.health + "%";

            if (this.health <= 0) {
                alert("YOU WIN. HOLY SHIT WOOOO MY GOD WOWWW");
                game.stopped = true;
            }
        }

    }
};