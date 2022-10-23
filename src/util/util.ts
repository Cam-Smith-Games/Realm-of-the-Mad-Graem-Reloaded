
// #region grouping
export function groupByField<T>(arr:T[], key:string) {
    return arr.reduce((storage:Record<any,T[]>, item:any) => {
        let grp_key:any = item[key];   
        (storage[grp_key] = storage[grp_key] || []).push(item);           
        return storage; 
    }, {}); 
};
export function groupBy<T>(arr:T[], getValue: (a:T) => string|number) {
    let groups:Record<string,T[]> = {};
    for (let item of arr) {
        let grp_key = getValue(item);   
        (groups[grp_key] = groups[grp_key] || []).push(item);           
    }
    return groups;
};
// #endregion


/** indexes array by specified key
 * @returns dictionary mapping key to value
 * - NOTE: this is very similiar to "groupBy" utility method except its only 1 record per key as opposed to a group of records per key
 */
export function index<TKey extends string|number|symbol,TValue>(array:TValue[], key:(arr:TValue) => TKey) {
    let start:Partial<Record<TKey,TValue>> = {};
    let map = array.reduce((obj:Record<TKey,TValue>, val:TValue) => ({...obj, [key(val)]: val }), start);
    return map;
}


export async function loadImage(src:string):Promise<HTMLImageElement> {
    return await new Promise((resolve, _reject) => {
        var img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}


/** rounds x to nearest multiple of mult */
export function roundTo(x:number, mult:number) {
    // use case: negative vectors on grid should round down, while positive should round up
    return (x > 0) ? ceilTo(x, mult) : floorTo(x, mult)
}
export function ceilTo(x: number, mult:number) {
    return Math.ceil(x / mult) * mult;
}
export function floorTo(x:number, mult:number) {
    return Math.floor(x / mult) * mult;
}



/** fetch then deserialize to type */
export async function get<T>(path:string) {
    return <T>await fetch(path).then(response => response.json());
}
export async function getText(path:string) {
    return await fetch(path).then(response => response.text());
}


export type Constructor<T = {}> = new (...args: any[]) => T;


/** this function applys "mixins" from/to the specified types. This is useful (and necessary) for multi-inheritance in TypeScript
 * @example extend(Human, [CanWalk, CanSleep])
 */
export function mixin(child:any, ...parents:any[]) {
    for (let parent of parents) {
        for (let prop of Object.getOwnPropertyNames(parent.prototype)) {
            let desc =  Object.getOwnPropertyDescriptor(parent.prototype, prop) || Object.create(null);
            Object.defineProperty(child.prototype, prop, desc);
        }
    }
    return child;
}

/*function applyMixins(derivedCtor: any, constructors: any[]) {
constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
    Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
        Object.create(null)
    );
    });
});
}*/

/** utilizes "Set" to return distinct values in array by specified key */
export function distinct<T>(arr:T[], getKey:(t:T)=>any = (t:T) => t):T[] {
    return [...new Set(arr.map(getKey))]
}

export const difference= <T>(arr1:T[], arr2:T[])  => arr1.filter(x => !arr2.includes(x));
export const union = <T>(arr1:T[], arr2:T[]) => [...new Set([...arr1, ...arr2])];

