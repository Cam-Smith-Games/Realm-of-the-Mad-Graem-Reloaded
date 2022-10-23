import { IGame } from "./game.js";
import { clamp } from "../math/util.js";
import { IVector, vec } from "../math/vector.js";


export interface IGameObject {
    img?: HTMLImageElement,
    position?: IVector,
    velocity?: IVector,
    size?: IVector,
    radius?: number,
    angle?: number,
    color?: string,
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number,
}

export class GameObject implements IGameObject {


    constructor(args:IGameObject) {
        if (!args) args = <IGameObject>{};
  
        // defaulting properties when not provided in args (or invalid) 
        this.img = args.img;
        this.position = args?.position ?? { x: 0, y: 0 };
        this.velocity = args?.velocity ?? { x: 0, y: 0 };
        this.size = args?.size ?? { x: 0, y: 0 };
        
   

        this.radius = Math.max(this.size.x / 2, this.size.y / 2);
        this.angle = typeof args.angle === "number" ? args.angle : 0;
        this.color = typeof args.color === "string" ? args.color : "rgb(0, 255, 0)";

   
        this.sx = typeof args.sx === "number" ? args.sx : 0;
        this.sy = typeof args.sy === "number" ? args.sy : 0;
        this.sw = typeof args.sw === "number" ? args.sw : this.img ? this.img.width : 0;
        this.sh = typeof args.sh === "number" ? args.sh : this.img ? this.img.height : 0;
        
    }

    img: HTMLImageElement;
    position: IVector;
    velocity: IVector;
    size: IVector;
    radius: number;
    angle: number;
    color: string;
    sx: number;
    sy: number;
    sw: number;
    sh: number;

    move(deltaTime:number, game:IGame) {
        let delta = vec.rotate (this.velocity, this.angle);
        this.position = vec.add(this.position, delta);

        const canvas = game.ctx.canvas;
        this.position.x = clamp(this.position.x, 0, canvas.width - this.radius);
        this.position.y = clamp(this.position.y, 0, canvas.height - this.radius);

    }

    draw(game:IGame) {
        const ctx = game.ctx;
        
        const half_width = this.size.x / 2;
        const half_height = this.size.y / 2;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);


        if (this.img) {
            //if (this.sx) {
            ctx.drawImage(this.img, this.sx, this.sy, this.sw, this.sh, -half_width, -half_height, this.size.x, this.size.y);
            //}
            //else {
            //    ctx.drawImage(this.img, -half_width, -half_height, this.size.x, this.size.y);
            //} 
        }
        else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
            ctx.fill();
            //ctx.fillRect(-half_width, -half_height, this.size.x, this.size.y);
        }
        
        if (game.debug) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.strokeStyle = "rgb(0,255,0)";
            //ctx.strokeRect(-half_width, -half_height, this.size.x, this.size.y);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.fillRect(-2, -2, 4, 4);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -10);
            ctx.stroke();

        }

        ctx.rotate(-this.angle);
        ctx.translate(-this.position.x, -this.position.y);
        ctx.closePath();
    }

    isColliding(other:IGameObject) {
        //let x_diff = this.position.x - other.position.x;
        //let y_diff = this.position.y - other.position.y;
        //let dist = Math.sqrt(x_diff * x_diff + y_diff * y_diff); 
        let dist = vec.dist(this.position, other.position);
        return dist < this.radius || dist < other.radius;
    }

    angleTo(vector:IVector) {
        return vec.angleTo(this.position, vector) + Math.PI / 2;
        //let x_diff = this.position.x - vector.x;
        //let y_diff = this.position.y - vector.y;
        //return Math.atan2(y_diff, x_diff) - (Math.PI / 2);;
    }

    lookAt(vector:IVector) {
        this.angle = this.angleTo(vector);
	}
}
