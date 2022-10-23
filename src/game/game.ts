import { Bullet } from "./bullet.js";
import { Graem } from "./graem.js";
import { clamp } from "../math/util.js";
import { IVector } from "../math/vector.js";
import { Player } from "./player.js";
import { Sound } from "../util/sound.js";

export interface IMouse extends IVector {
    down: boolean;
}

export interface UI {
    player_health: HTMLElement,
    boss_health: HTMLElement
}

export interface IGame {

    motion_blur: number;
    ui: UI;

    /** main rendering context */
    ctx: CanvasRenderingContext2D;
    /** rendering context for motion blur */
    bctx: CanvasRenderingContext2D;
    
    mouse:IMouse;

    player:Player;

    graem: Graem;

    /** multiplier that determines update loop speed. closer to 0 = slower time */
    time_scale: number;

    keys:Record<string,boolean>

    images:Record<string,HTMLImageElement>,

    sounds:Record<string,Sound>;


    bullets:Bullet[]

    debug:boolean;
    
    stopped: boolean;

}







export class Game implements IGame {
    motion_blur = 0;
    ui =  {
        player_health: <HTMLElement>document.querySelector("#playerHealth > div"),
        boss_health: <HTMLElement>document.querySelector("#bossHealth > div"),
        fps: document.getElementById("fps")
    };

    ctx: CanvasRenderingContext2D;
    bctx: CanvasRenderingContext2D;
    player: Player;
    graem: Graem;
    time_scale: number;
    images: Record<string, HTMLImageElement> = {};
    sounds: Record<string, Sound> = {};
    bullets: Bullet[] = [];
    debug: boolean;
    stopped: boolean;
    

    mouse: IMouse = { x: 0, y: 0, down: false };
    keys: Record<string, boolean> = {};


    constructor() {
        // #region UI events

        const canvas = <HTMLCanvasElement>document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");

        const blurCanvas = <HTMLCanvasElement>document.getElementById("blur");
        this.bctx = blurCanvas.getContext("2d");

        // #region mouse
        document.onmousedown = () => this.mouse.down = true;
        document.onmouseup = () => this.mouse.down = false;
        document.onmousemove = (e:MouseEvent) => {

            let rect = canvas.getBoundingClientRect();
            let x = (e.clientX || e.pageX) - rect.left;
            let y = (e.clientY || e.pageY) - rect.top;
        
            // convert to canvas coordinates (resolution vs actual size)
            x *= canvas.width / rect.width;
            y *= canvas.height / rect.height;
        
            this.mouse.x = clamp(x, 0, canvas.width);
            this.mouse.y = clamp(y, 0, canvas.height);

        }
        // #endregion

        // #region keys
        document.onkeydown = (e:KeyboardEvent) => {
            console.log("PRESSED: ", e.key);
            this.keys[e.key?.toUpperCase()] = true;
        } 
        document.onkeyup = (e:KeyboardEvent) => delete this.keys[e.key?.toUpperCase()];   
        // #endregion


        this.player = new Player();



        this.loop = this.loop.bind(this)

    }


    async load() : Promise<void> {

        // #region setup
        const soundPaths = ["sound/shoot.mp3", "sound/reload.wav"];
        const imagePaths = ["img/graem_sad.png", "img/graem_happy.png", "img/rotmg.png", "img/up.png", "img/down.png"];
        // adding survivor image paths
        for (var path in this.player.animations) {
            const folder = this.player.animations[path];
            for (let subPath in folder) {
                let frameCount = folder[subPath];
                for (var i = 0; i < frameCount; i++) {
                    imagePaths.push("img/tds/" + path + "/" + subPath + "/survivor-" + subPath + "_" + (path == "feet" ? "" : (path + "_")) + i + ".png");
                }   
            }
        }
        // #endregion

        for (let path of imagePaths) this.images[path] = await this.loadImage(path);
        for (let path of soundPaths) this.sounds[path] = await new Sound(path).load();
    }

    private async loadImage(path:string) : Promise<HTMLImageElement> {
        return new Promise((resolve,_) =>{
            let img = new Image();
            img.onload = () => resolve(img);
            img.src = path;
        });
    }


    frameCount = 0;
    previousTime = 0;
    loop(currentTime:number) { 

        const ctx = this.ctx;

        // #region tracking fps / delta time
        this.frameCount++;

        // convert time to seconds
        currentTime *= 0.001;
        const deltaTime = currentTime - this.previousTime;
        this.previousTime = currentTime;
        // #endregion

        // #region motion blur
        if (this.motion_blur > 0) {
            this.bctx.clearRect(0, 0, this.bctx.canvas.width, this.bctx.canvas.height);
            this.bctx.globalAlpha = this.motion_blur;
            this.bctx.drawImage(this.ctx.canvas, 0, 0);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(this.bctx.canvas, 0, 0);
        }
        else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        // #endregion

        // #region showing mouse position
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "red";
        ctx.beginPath();
        ctx.arc(this.mouse.x, this.mouse.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
        // #endregion

        // #region updating objects
        this.graem.update(this,deltaTime);
        this.player.update(this,deltaTime);     
        for (var i = this.graem.minions.length - 1; i > -1; i--) {
            let minion = this.graem.minions[i];
            minion.update(this,deltaTime);
        }
        for (var i = this.bullets.length - 1; i > -1; i--) {
            let bullet = this.bullets[i];
            let collision = bullet.update(this, deltaTime);
            if (collision) this.bullets.splice(i, 1);
        }
        // #endregion



        if (!this.stopped) {
            window.requestAnimationFrame(this.loop);
        }
    }


    start() {

        console.log("STARTING GAME...");


        this.graem = new Graem(this);


        this.player.init("handgun", "idle", this);
        this.graem.spawnMinions(10, this);


        window.requestAnimationFrame(this.loop);


        setInterval(() => {
            this.ui.fps.innerText = this.frameCount.toString();
            this.frameCount = 0;
        }, 1000);


    }



}