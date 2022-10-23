
/** rounds number to nearest multiple of x 
 * @example 
 * round(12, 5) = 10
 * round(16, 7) = 14
*/
export function round (num:number, x:number) { 
    return Math.floor(num / x) * x;
}

export function sum(arr:number[]) {
    return arr.reduce((a, b) => a + b, 0)
}

export function clamp(val:number, min:number, max:number) {
    return Math.max(min, Math.min(max, val));
}

/** returns true if absolute difference between two numbers lies within threshold (i.e. numbers are "close enough") */
export function near(n1:number, n2:number, thresh = 0.1) {
    return Math.abs(n1 - n2) <= thresh;
}


/**
* @param start numnber to start at
* @param end number to end at
* @param perc percentage (0-1) between start and end
*/
export function lerp (start:number, end:number, perc:number) {
    return (1-perc) * start + (perc * end);
} 
