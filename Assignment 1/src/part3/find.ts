import { number } from "yargs";
import { Result, makeFailure, makeOk, bind, either } from "../lib/result";

/* Library code */
const findOrThrow = <T>(pred: (x: T) => boolean, a: T[]): T => {
    for (let i = 0; i < a.length; i++) {
        const check = pred(a[i]);
        if (check === true)
           return a[i];
    }

    throw "No element found.";
}

export const findResult = <T>(pred:(x:T)=> boolean, a:T[]): Result<T> =>
{
    try {
        const x = findOrThrow (pred, a);
        return makeOk(x);
        
    } catch (e) {

        return makeFailure("there is a fail");
    }

 
}

/* Client code */
const returnSquaredIfFoundEven_v1 = (a: number[]): number => {
    try {
        const x = findOrThrow(x => x % 2 === 0, a);
        return x * x;
    } catch (e) {
        return -1;
    }
}

export const returnSquaredIfFoundEven_v2 = (a:number[]): Result<number>=>{
    const find = findResult((x:number)=> x%2===0,a);
    const ans = bind(find,(y:number)=>makeOk(y*y));
    return ans;
};

export const returnSquaredIfFoundEven_v3 = (a:number[]): number=>{
    const find = findResult((x:number)=> x%2===0,a);
    const ans = either(find,(y:number)=>(y*y),(z:string): number=>-1);
    return ans;
}