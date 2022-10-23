import { ceilTo, floorTo, roundTo } from "../util/util.js";
import { lerp, near, round } from "./util.js";

export interface IVector {
    x: number
    y: number
}

export interface IVector3 extends IVector {
    z?: number
}


export const vec3 = {
    add: (v1:IVector3, v2:IVector3) => ({ x: v1.x + v2.x, y: v1.y + v2.y, z: (v1.z||0) + (v2.z||0) }),
    subtract: (v1:IVector3, v2:IVector3) =>  ({ x: v1.x - v2.x, y: v1.y - v2.y, z: (v1.z||0) - (v2.z||0) }),
    floor: (v:IVector3) => ({ x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z||0) }),
    scale: (v:IVector3, x:number, y:number = x, z:number = x) => ({ x: v.x * x, y: v.y * y, z: (v.z||0) * z }),
    dist: (v1:IVector3, v2:IVector3) => vec3.length(vec3.subtract(v2, v1)),
    distSquared: (v1:IVector3, v2:IVector3) => vec3.lengthSquared(vec3.subtract(v1, v2)),
    length: (v:IVector3) => Math.sqrt(vec3.lengthSquared(v)),
    lengthSquared: (v:IVector3) => Math.pow(v.x, 2) + Math.pow(v.y, 2) + Math.pow(v.z||0, 2),
    lerp: (start:IVector3, end:IVector3, t:number) => ({
        x: lerp(start.x, end.x, t),
        y: lerp(start.y, end.y, t),
        z: lerp(start.z, end.z, t)
    }),
    roundTo: (v:IVector3, value:number) => ({ x: round(v.x, value), y: round(v.y, value), z: round((v.z||0), value)}),
    dot: (v1:IVector3, v2:IVector3) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z,
    cross:(a:IVector3, b:IVector3) => {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
		return {
            x: ay * bz - az * by,
		    y: az * bx - ax * bz,
		    z: ax * by - ay * bx
        };
	},
    collinear(v1:IVector3, v2:IVector3) {
        // vectors collinear if cross is empty
        let cross = vec3.cross(v1, v2);
        return (cross.x == 0 && cross.y == 0 && cross.z == 0);
    }
}

/** namespace containing utility functions for dealing with IVectors that aren't an instance of the Vector class */
export const vec = {
    length: (v:IVector) =>  Math.sqrt(vec.lengthSquared(v)),
    lengthSquared: (v:IVector) => Math.pow(v.x, 2) + Math.pow(v.y, 2),

    mid: (v1:IVector, v2:IVector) => vec.scale(vec.add(v1, v2), 1/2),

    rotate: (v:IVector, radians:number, origin?:IVector) => {
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        if (origin) {
            return { 
                x: (cos * (v.x - origin.x)) + (sin * (v.y - origin.y)) + origin.x, 
                y: (cos * (v.y - origin.y)) - (sin * (v.x - origin.x)) + origin.y
            };
        } 
        return {
            x: (cos * v.x) - (sin * v.y),
            y: (sin * v.x) + (cos * v.y)
        }
    },
    
    rotate_old: (v:IVector, radians:number, pivot:IVector = null):IVector => {
        let cos = Math.cos(radians);
        let sin = Math.sin(radians);
        let x, y;

        // not sure why rounding was necessary
        if (pivot) {
            x = Math.round(
                (cos * (v.x - pivot.x)) -
                (sin * (v.y - pivot.y)) +
                pivot.x
            );

            y = Math.round(
                (sin * (v.x - pivot.x)) +
                (cos * (v.y - pivot.y)) +
                pivot.y
            );

        }
        else {
            x = (cos * v.x) - (sin * v.y);
            y = (sin * v.x) + (cos * v.y);
        }

        return { x, y };
    },

    abs: (v:IVector) => ({ x: Math.abs(v.x), y: Math.abs(v.y) }),



    /**
     * @param start vector to start at
     * @param end vector to end at
     * @param t percentage (0-1) between start and end 
     */
    lerp: (start:IVector, end:IVector, t:number) => ({
        x: lerp(start.x, end.x, t),
        y: lerp(start.y, end.y, t)
    }),

    equals: (v1:IVector, v2:IVector) => !(v1.x != v2.x || v1.y != v2.y),
    near: (v1:IVector, v2:IVector, thresh?:number) => !(!near(v1.x, v2.x, thresh) || !near(v1.y, v2.y, thresh)),
    add: (v1:IVector, v2:IVector) => ({ x: v1.x + v2.x, y: v1.y + v2.y}),
    subtract:(v1:IVector, v2:IVector) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),

    dist: (v1:IVector, v2:IVector) => vec.length(vec.subtract(v1, v2)),
    distSquared: (v1:IVector, v2:IVector) => vec3.lengthSquared(vec3.subtract(v1, v2)),


    scale: (v:IVector, x:number, y:number = x) => ({ x: v.x * x, y: v.y * y}),
    multiply: (v1:IVector, v2:IVector) => ({ x: v1.x * v2.x, y: v1.y * v2.y }),
    divide: (v1:IVector, v2:IVector) => ({ x: v1.x / v2.x, y: v1.y / v2.y }),

    sign: (v:IVector) => ({ x: Math.sign(v.x), y: Math.sign(v.y) }),

    dot:(v1:IVector, v2:IVector) =>  v1.x * v2.x + v1.y * v2.y,
    cross:(v1:IVector, v2:IVector) => (v1.x * v2.y) - (v1.y * v2.x),

    unit:(v:IVector) => {
        let length = vec.length(v);
        // prevent division by zero
        return length ? vec.scale(v, 1/length) : v;
    },

    normal: (v:IVector) => {
        return {
            x: -v.y,
            y: v.x
        }
    },

    /** projects point p onto vector v */
    project(point:IVector, line:IVector) {
		const denominator = vec.length(line);
		if (denominator == 0) return { x: 0, y: 0 };
        let dot = vec.dot(point,line);
        let dot2 = vec.dot(line, point);

		const scalar = dot / denominator;
		return vec.scale(line, scalar);
	},

    roundTo: (v:IVector, value:number) => ({ x: roundTo(v.x, value), y: roundTo(v.y, value) }),
    ceilTo: (v:IVector, value:number) => ({ x: ceilTo(v.x, value), y: ceilTo(v.y, value) }),
    floorTo: (v:IVector, value:number) => ({ x: floorTo(v.x, value), y: floorTo(v.y, value) }),

    roundToVec: (from:IVector, to:IVector) => ({ x: round(from.x, to.x), y: round(from.y, to.y) }),
    round: (v:IVector) => ({ x: Math.round(v.x), y: Math.round(v.y) }),
    ceil: (v:IVector) => ({ x: Math.ceil(v.x), y: Math.ceil(v.y) }),
    floor: (v:IVector) => ({ x: Math.floor(v.x), y: Math.floor(v.y) }),

    /** θ = acos [ (a · b) / (|a| |b|) ] */
    angleBetween: (v1:IVector, v2:IVector) => {
        return Math.acos(
            // doing a min here because it somehow became 1.00000002 one time which resulted in a NaN angle
            Math.min(1, vec.dot(v1, v2) / (vec.length(v1) * vec.length(v2)))
        );
    },

    /** returns angle formed by 3 points (angle between the vectors formed by prev->center and center->next) */
    angle3: (prev:IVector, center:IVector, next:IVector) => {
        let seg1 = vec.subtract(prev, center);
        let seg2 = vec.subtract(next, center); 
        return vec.angleBetween(seg1, seg2);
    },

    angle: (v:IVector) => {
        return Math.atan2(v.y, v.x);
    },


    angleTo: (v1:IVector, v2:IVector) => {
        let x_diff = v2.x - v1.x;
        let y_diff =  v2.y - v1.y;
        return Math.atan2(y_diff, x_diff);
    },

    /** determines if point exists on line
     * @param l1 line start point
     * @param l2 line end point
     * @param p point to check
     * @param threshold threshold to account for rounding errors (higher # = less accurate)
     * @returns true if point p exists on line between l1 and l2 */
    contains(l1:IVector, l2:IVector, p:IVector, threshold:number = 0.001) {

        // distance from both endpoints to point
        let d = vec.dist(p, l1) + vec.dist(p, l2);
        // length of the line between l1 and l2
        let length = vec.dist(l1, l2);

        // if sum of two distances are equal to the line's length, the point is on the line
        return near(d, length, threshold);
    },

    overlap: (p1:IVector, p2:IVector, p3:IVector, p4:IVector) => {
        let slope1 = (vec.angle(vec.subtract(p2, p1)))// + Math.PI) % Math.PI;
        let slope2 = (vec.angle(vec.subtract(p4, p3)))// + Math.PI) % Math.PI;
        let diff = Math.abs(slope2 - slope1);
        if (near(diff, Math.PI, 0.01)) {
            // true if either line contains either of other lines endpoints
            return (
                vec.contains(p1, p2, p3) || 
                vec.contains(p1, p2, p4) ||
                vec.contains(p3, p4, p1) ||
                vec.contains(p3, p4, p2)  
            );
        }
        return false;
    },

    /** returns nearest point on infinite line */
    nearest_point: (line1:IVector, line2:IVector, pnt:IVector) => {
        var L2 = ( ((line2.x - line1.x) * (line2.x - line1.x)) + ((line2.y - line1.y) * (line2.y - line1.y)) );
        if(L2 == 0) return null;
        var r = ( ((pnt.x - line1.x) * (line2.x - line1.x)) + ((pnt.y - line1.y) * (line2.y - line1.y)) ) / L2;
    
        return {
            x: line1.x + (r * (line2.x - line1.x)), 
            y: line1.y + (r * (line2.y - line1.y))
        };
    },
    /** returns nearest point on finite line segment */
    nearest_between: (A:IVector, B:IVector, P:IVector) => {
        const v = vec.subtract(B, A);
        const u = vec.subtract(A, P);
        const vu = vec.dot(v,u);
        const t = -vu / vec.square_diag(v);

        if (t >= 0 && t <= 1) return vec.lerp(A, B, t)
        const g0 = vec.square_diag(vec.subtract(A, P))
        const g1 = vec.square_diag(vec.subtract(B, P))
        return g0 <= g1 ? A : B
    },

    /** length of hypotenuse squared */
    square_diag: (v:IVector) => {
        return v.x ** 2 + v.y ** 2; 
    },

    /** returns the shortest distance to the (infinite) line */
    shortest_dist: (line1:IVector, line2:IVector, pnt:IVector) => {
        var L2 = ( ((line2.x - line1.x) * (line2.x - line1.x)) + ((line2.y - line1.y) * (line2.y - line1.y)) );
        if(L2 == 0) return Infinity;
        var s = (((line1.y - pnt.y) * (line2.x - line1.x)) - ((line1.x - pnt.x) * (line2.y - line1.y))) / L2;
        return Math.abs(s) * Math.sqrt(L2);
    },

    /** returns intersection point of 2 vectors, or null if they don't intersect */
    intersect(p1:IVector, p2:IVector, p3:IVector, p4:IVector) {

        let x1 = p1.x;
        let x2 = p2.x;
        let x3 = p3.x;
        let x4 = p4.x;

        let y1 = p1.y;
        let y2 = p2.y;
        let y3 = p3.y;
        let y4 = p4.y;

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) return null
    
        let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
    
        // Lines are parallel
        if (denominator === 0) return null
        
        let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
        let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
    
        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null
    
        return { 
            x: x1 + ua * (x2 - x1),
            y: y1 + ua * (y2 - y1)
        }
    },

    /** converts a multi-dimensional array to list of IVectors 
     * @example [[1,2]] -> [{x:1,y:2}] */
    fromArray: (array: [number,number][] = []) => array.map(arr => ({ x: arr[0], y: arr[1] })),
    

    sum: (arr:IVector[]) => {
        let sum = {x : 0, y: 0};
        for (let v of arr) {
            sum.x += v.x;
            sum.y += v.y;
        }
        return sum;
    },


    /** returns 0 if c is on the line, negative if point is to left of line, positive if point is to the right of line
     * @param a line point 1
     * @param b line point 2
     * @param c point to compare with line
     */
    line_point_dir: (a:IVector, b:IVector, c:IVector) => {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    },
        


    copy: (v:IVector):IVector => ({ x:v.x, y:v.y }),


};

const sign = (n:number) => n >= 0 ? 1: -1;

export const vec_path = {



    avg: (path:IVector[]) => {

        let sum = vec_path.sum(path);
        let avg = vec.scale(sum, 1/path.length);      
        return avg;
    },
    
    sum: (path:IVector[]) => {
        let sum:IVector = { x: 0, y: 0 };
        for (let p of path) {
            sum.x += p.x;
            sum.y += p.y;
        }
        return sum;
    },

    /** Return all cells of the unit grid crossed by the line segment between A and B
     * - note: these coordinates are CENTER points of each cell. not top-left corner
     */
    ray_trace: (a:IVector, b:IVector) => {
        let diff = vec.subtract(b,a);
        let sign = vec.sign(diff);
        let sign_mod = { x: Math.max(0, sign.x), y: Math.max(0, sign.y) }
            
        let currentCell = { x: a.x, y: a.y };
        let targetCell = { x: b.x, y: b.y };
    
        let traversed = [ { x: currentCell.x, y: currentCell.y } ];
    
        let calcIntersectionDistanceX = () => Math.abs(diff.y * (currentCell.x + sign_mod.x - a.x));
        let calcIntersectionDistanceY = () => Math.abs(diff.x * (currentCell.y + sign_mod.y - a.y));
    
        let intersectionDistanceX = diff.x === 0 ? Infinity : calcIntersectionDistanceX();
        let intersectionDistanceY = diff.y === 0 ? Infinity : calcIntersectionDistanceY();
    
        while (currentCell.x !== targetCell.x || currentCell.y !== targetCell.y) {
  
            if (intersectionDistanceX <= intersectionDistanceY) {
                currentCell.x += sign.x;
                intersectionDistanceX = calcIntersectionDistanceX();
            }
    
            if (intersectionDistanceY <= intersectionDistanceX) {
                currentCell.y += sign.y;
                intersectionDistanceY = calcIntersectionDistanceY();
            }
    
            traversed.push({ x: currentCell.x, y: currentCell.y });
        }
    
        return traversed;
    },

    /** scales points to tile size, floors/ceils end points, then ray traces tile grid */
    getTilePath<T extends IVector>(start:T, end:T, tile_size:IVector) {

        // TODO: would be nice to not have to convert/scale to tile coordinates and back here...
        //       would need to update the ray trace algorithm to handle tile size itself
        //       not worth the effort right now

        // scale start/end points to tile size and convert top-left coordinats to center coordinates
        let half = { x: 0, y: 0 };

        let start_tile = vec.divide(start, tile_size);
        let end_tile = vec.divide(end, tile_size);

        let _start = vec.add(vec.round(start_tile), half);
        let _end = vec.add(vec.round(end_tile), half);
        let path = vec_path.ray_trace(_start, _end);

        // scale coordinates back out of tile coordinates and convert center back to top-left
        for (let p of path) {
            let m = vec.multiply(vec.subtract(p, half), tile_size); 
            p.x = m.x;
            p.y = m.y;
        }
        return path;
    },

    multiply(path:IVector[], mult:IVector) {
        for (let p of path) {
            let m = vec.multiply(p, mult);
            p.x = m.x;
            p.y = m.y;
        }
        return path;
    },

    scale<T extends IVector> (path:T[], num:number) {
        for (let p of path) {
            let s = vec.scale(p, num);
            p.x = s.x;
            p.y = s.y;
        }
        return path;
    },

    /** sums distance between all points */
    length(points:IVector[]) {
        let length = 0;

        if (points.length) {
            let p0 = points[0];
            for (let i=1; i<points.length; i++) {
                let p1 = points[i];
                length += vec.dist(p0, p1);
                p0 = p1;                
            }
        }

        return length;
    },

    /** returns the point where length is exceeded */
    break_point(points:IVector[], max_length:number) {

        if (points.length) {
            let p0 = points[0];
            let length = 0;
            for (let i=1; i<points.length; i++) {
                let p1 = points[i];
                let dist = vec.dist(p0, p1);
                length += dist;

                if (length > max_length) {
                    // if some distance is remaining, scale the final point to correct position
                    let remaining = length - max_length;
                    if (remaining > 0) {
                        let perc = 1- (remaining / dist);
                        let fixed = <IVector>vec.lerp(p0, p1, perc);
                        return {
                            index: i,
                            point:  fixed
                        };
                    }
                }

                p0 = p1;
            }

        }

        return null;
    },

    /** removes points from path that exceed max_length */
    splice<T extends IVector>(points:T[], max_length:number) {
        if (max_length == 0) {
            points.splice(0, points.length);
        }
        else if (points.length) {

            let p0 = points[0];
            let length = 0;
            for (let i=1; i<points.length; i++) {
                let p1 = points[i];
                let dist = vec.dist(p0, p1);
                length += dist;

                if (length > max_length) {
                    points.splice(i+1, points.length - (i-1));

                    // if some distance is remaining, scale the final point to correct position
                    let remaining = length - max_length;
                     if (remaining > 0) {
                        let perc = 1- (remaining / dist);
                        let scaled = vec.lerp(p0, p1, perc);
                        p1.x = scaled.x;
                        p1.y = scaled.y;
                    }
                    return points;
                }

                p0 = p1;
            }
        }

        return points;
    },


    /** removes duplicate adjacent points from path */
    distinct(points:IVector3[]) {
        for (let i = points.length - 1; i > 0; i--) {
            let p1 = points[i];
            let p2 = points[i-1];
            if (p1.x == p2.x && p1.y == p2.y && (p1.z||0) == (p2.z||0)) {
                points.splice(i,1);
            }
        }
        return points;
    }

  
}


/**
 * Class implementation of IVector.
 * Conveniently contains all the vec functions within it's prototype so you can do things like "v1.dot(v2)"
 * The downside is that a ton of data is coming from json ({x:0,y:0}) which would need to be converted to instances of this class
 */
export class Vector implements IVector {

    x:number;
    y:number;

    constructor(x:number = 0, y:number = 0) {
        this.x = x ?? 0;
        this.y = y ?? 0;
    }

    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    rotate(angle:number, pivot: Vector = null) {
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        let x, y;

        if (pivot) {
            x = Math.round(
                (cos * (this.x - pivot.x)) -
                (sin * (this.y - pivot.y)) +
                pivot.x
            );

            y = Math.round(
                (sin * (this.x - pivot.x)) +
                (cos * (this.y - pivot.y)) +
                pivot.y
            );

        }
        else {
            x = (cos * this.x) - (sin * this.y);
            y = (sin * this.x) + (cos * this.y);
        }

        return new Vector(x, y);
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    abs() {
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    }

    /**
     * @param {number} start numnber to start at
     * @param {number} end number to end at
     * @param {number} perc percentage (0-1) between start and end
     */
    static lerp_num = (start:number, end:number, perc:number) => (1-perc) * start + (perc * end); 

    /**
     * @param {Vector} start vector to start at
     * @param {Vector} end vector to end at
     * @param {number} perc percentage (0-1) between start and end 
     */
    static lerp = (start:Vector, end:Vector, perc:number) => new Vector(
        Vector.lerp_num(start.x, end.x, perc),
        Vector.lerp_num(start.y, end.y, perc)
    );
    

    add(vec:Vector) {
        if (vec instanceof Vector) {
            return new Vector(this.x + vec.x, this.y + vec.y);
        }
        return this;
    }

    subtract(vec:Vector) {
        if (vec instanceof Vector) {
            return new Vector(this.x - vec.x, this.y - vec.y);
        }
        return this;
    }

    dist(vec:Vector) {
        if (vec instanceof Vector) {
            return this.subtract(vec).length();
        }
        return 0;
    }

    scale(x:number, y:number = x) {
        return new Vector(this.x * x, this.y * y);
    }
    multiply(vec:|Vector) {
        return new Vector(this.x * vec.x, this.y * vec.y);
    }

    dot(vec:Vector) {
        if (vec instanceof Vector) {
            return this.x * vec.x + this.y * vec.y;
        }
        return 0;
    }

    cross(vec:Vector) {
        return (this.x * vec.y) - (this.y * vec.x); 
    }

    divide (vec:number|Vector) {
        if (vec instanceof Vector) {
            return new Vector(this.x / vec.x, this.y / vec.y);
        }
        return new Vector(this.x / vec, this.y / vec);
    }


    unit() {
        let length = this.length();
        if (length == 0) {
            return this;
        }
        return this.divide(length);
    }

    roundTo(value:number) {
        return new Vector(round(this.x, value), round(this.y, value));
    }

    angleTo(vec:Vector) {
        let x_diff = this.x - vec.x;
        let y_diff = this.y - vec.y;
        return Math.atan2(y_diff, x_diff) - (Math.PI / 2);;
    }


    /** converts multi-dimensional array to list of Vectors */
    static fromArray(array: [number,number][] = []) {
        return array.map(arr => new Vector(arr[0], arr[1]));
    }


    static Forward = new Vector(0, 1)
}

