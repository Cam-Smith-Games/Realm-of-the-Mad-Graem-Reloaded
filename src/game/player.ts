import { PlayerBullet } from "./bullet.js";
import { IGame } from "./game.js";
import { GameObject } from "./gameobject.js";
import { clamp } from "../math/util.js";
import { vec, Vector } from "../math/vector.js";

export class Animation {

    frameCount:number;
    frameDelay: number;
    onStart: () => void;
    onDelay: () => void;


    constructor(frameCount:number, frameDelay:number, onStart:()=>void, onFinish:()=>void) {
        this.frameCount = frameCount ?? 0;
        this.frameDelay = frameDelay ?? 0.01;
        this.onStart = onStart ?? (() => { });
        this.onDelay = onFinish ?? (() => { });
    }


    frameIndex = 0;
    frameTicker = 0;

    update(deltaTime:number) {
        this.frameTicker += deltaTime;

        if (this.frameTicker >= this.frameDelay) {
            this.frameTicker = 0;

            if (++this.frameIndex > this.frameCount) {
                this.onFinish();
            }
        }
    }


    onFinish() {
        // was this being overriden?
    }
}


interface IClip {
    current: number,
    size: number
}


/** maps animation number to frame count */
declare type IAnimation = Record<string,number>;
/** maps bodypart to animation name */
declare type IAnimations = Record<string, IAnimation>;

export class Player {
    

    animations: IAnimations = {
        "feet": {
            "idle": 1,
            "run": 20,
            "reload": 0,
            "shoot": 0
        },
        "flashlight": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20
        },
        "handgun": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20,
            "reload": 15,
            "shoot": 3
        },
        "knife": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20
        },
        "rifle": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20,
            "reload": 20,
            "shoot": 3
        },
        "shotgun": {
            "idle": 20,
            "meleeattack": 15,
            "move": 20,
            "reload": 20,
            "shoot": 3
        }
    }

    getImagePath () {
        return "img/tds/" + this.weapon + "/" + this.animation + "/survivor-" + this.animation + "_" + this.weapon + "_" + this.frameIndex + ".png"
    }

    getFrameCount () {
        return this.animations[this.weapon][this.animation];
    }

    weapon:string;
    animation: string;
    gameObject: GameObject;

    MOVE_SPEED = 500;

    init (weapon:string, animation:string, game:IGame) {
        let width = 50;

        this.weapon = weapon;
        this.animation = animation;
        let path = this.getImagePath();
        let img = game.images[path];

        const canvas = game.ctx.canvas;
        this.gameObject = new GameObject({
            img: img,
            size: { x: width, y: width * img.height / img.width },
            position: { x: canvas.width / 2, y: canvas.height - 240 }
        });

        this.setAmmo(this.clip.size);
    }



    update (game:IGame, deltaTime:number) {
    
        let obj = this.gameObject;

        // #region pointing player at mouse
        this.gameObject.lookAt({ x: game.mouse.x, y: game.mouse.y });
        // #endregion

        // #region  moving
        obj.velocity = { x: 0, y: 0 };
        if (game.keys["W"]) obj.velocity.y = -1;      
        if (game.keys["S"]) obj.velocity.y = 1;    
        if (game.keys["A"]) obj.velocity.x = -1; 
        if (game.keys["D"]) obj.velocity.x = 1;

        const ctx = game.ctx;
        obj.velocity = vec.scale(vec.unit(obj.velocity), this.MOVE_SPEED * deltaTime);
        obj.position.x = clamp(obj.position.x + obj.velocity.x, 0, ctx.canvas.width - obj.size.x);
        obj.position.y = clamp(obj.position.y + obj.velocity.y, obj.size.y / 2, ctx.canvas.height - obj.size.y / 2);

        // #endregion

        // drawing laser
        ctx.beginPath();
        ctx.strokeStyle = "rgb(0, 255, 0)";
        ctx.moveTo(this.gameObject.position.x, this.gameObject.position.y);
        ctx.lineTo(game.mouse.x, game.mouse.y);
        ctx.stroke();

        this.animate(deltaTime, game);
        this.gameObject.draw(game);

        this.shootTimer += deltaTime;

        // #region shooting / moving bullets
        if (this.reloading) {
            this.reload();
        }
        else if (this.shooting) {
            this.shoot();
        }
        else if (game.mouse.down) {
            if (this.shootTimer > this.shootDelay) {
                this.startShooting(game);
            }
        }
        // #endregion

    }

    // #region health
    health = 100;
    hurt (damage:number, game:IGame) {
        if (this.health > 0) {
            console.log("player hurt (" + damage + ")");
            this.health = clamp(this.health - damage, 0, 100);
            

            // TODO: don't set directly, might be slowmo
            game.motion_blur = 1 - (this.health/100);
            game.ui.player_health.style.width = this.health + "%";
    
            if (this.health <= 0) {
                alert("YOU JUST LOST... TO GRAEM??? AHAHAHAHAHA");
                game.stopped = true;
            }
        }

    }
    // #endregion

    // #region shooting
    isShooting = false;
    reloading = false;
    shootTimer = 0.2;
    shootDelay = 0.1;
    clip:IClip = {
        current: 20,
        size:  20
    };

    setAmmo (amt:number) {
        this.clip.current = clamp(amt, 0, this.clip.size);
        document.getElementById("ammo").innerHTML = this.clip.current + "/" + this.clip.size;
    }

    shooting:boolean;
    
    startShooting (game:IGame) {
        this.setAmmo(this.clip.current - 1);

        this.shooting = true;
        this.switchAnimation("shoot");

        game.sounds["sound/shoot.mp3"].play();
        game.bullets.push(new PlayerBullet({
            position: vec.copy(this.gameObject.position), 
            angle: this.gameObject.angle,
            velocity: { x: 0, y: -10 },
            size: { x: 1, y: 10},
            color: "rgb(253, 200, 51)"
        }));

        if (this.clip.current < 1) {
            this.startReloading(game);
        }


    }
    shoot () {
        if (this.frameIndex == 2) {
            this.stopShooting();
        }
    }
    stopShooting () {
        this.shooting = false;
        this.switchAnimation("idle");
        this.shootTimer = 0;
    }

    startReloading (game:IGame) {
        game.sounds["sound/reload.wav"].play(0.6);
        this.switchAnimation("reload");
        this.reloading = true;
    }
    reload () {
        if (this.frameIndex == 14) {
            this.stopReloading();
        }
    }
    stopReloading () {
        this.setAmmo(this.clip.size);

        this.reloading = false;
        this.switchAnimation("idle");
        this.shootTimer = 0;
    }
    // #endregion


    // #region animation
    frameIndex = 0;
    frameCount = 20;
    animDelay = 2 / 60; // animations should be 60 fps
    animTick = 0;
    animate (deltaTime:number, game:IGame) {
        this.animTick += deltaTime;
        if (this.animTick > this.animDelay) {
            this.animTick = 0;
            this.frameIndex = (this.frameIndex + 1) % this.getFrameCount();
            let path = this.getImagePath();
            this.gameObject.img = game.images[path];
        }

        //this.gameObject.width = this.gameObject.img.width;
        //this.gameObject.height = this.gameObject.img.height;
    }

    switchWeapons (weapon:string) {
        this.weapon = weapon;
        this.switchAnimation(this.animation);
    }
    switchAnimation (animation:string) {
        let weapon = this.animations[this.weapon];
        this.animation = (weapon && animation in weapon) ? animation : "idle";
        this.frameIndex = -1;
    }
    // #endregion


};
