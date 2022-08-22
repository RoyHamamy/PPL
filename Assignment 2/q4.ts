import { valueToString } from '../imp/L3-value';
import { map } from "ramda";
import { AppExp, CExp, Exp, LetExp, Program, PrimOp } from "./L31-ast";
import { isVarRef, isStrExp, isPrimOp, isBoolExp, isNumExp, isAppExp, isAtomicExp, isCExp, isDefineExp, isExp, isIfExp, isLetExp, isLitExp,isProcExp, isProgram, makeAppExp, makeDefineExp, makeIfExp, makeProcExp, makeProgram,} from "./L31-ast";
import { Result, bind, makeFailure, makeOk, mapResult, safe2 } from "../shared/result";

export const rewriteLet = (e: LetExp): AppExp => {
    const vars = map((b) => b.var, e.bindings);
    const vals = map((b) => b.val, e.bindings);
    return makeAppExp(
        makeProcExp(vars, e.body),
        vals);
}

export const rewriteAllLet = (exp: Program | Exp): Program | Exp =>
    isExp(exp) ? rewriteAllLetExp(exp) :
        isProgram(exp) ? makeProgram(map(rewriteAllLetExp, exp.exps)) :
            exp;


            export const rewriteAllLetExp = (exp: Exp): Exp =>
    isCExp(exp) ? rewriteAllLetCExp(exp) :
        isDefineExp(exp) ? makeDefineExp(exp.var, rewriteAllLetCExp(exp.val)) :
            exp;


            export const rewriteAllLetCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
        isLitExp(exp) ? exp :
            isIfExp(exp) ? makeIfExp(rewriteAllLetCExp(exp.test),
                rewriteAllLetCExp(exp.then),
                rewriteAllLetCExp(exp.alt)) :
                isAppExp(exp) ? makeAppExp(rewriteAllLetCExp(exp.rator),
                    map(rewriteAllLetCExp, exp.rands)) :
                    isProcExp(exp) ? makeProcExp(exp.args, map(rewriteAllLetCExp, exp.body)) :
                        isLetExp(exp) ? rewriteAllLetCExp(rewriteLet(exp)) :
                            exp;

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/

export const l30ToJS = (exp: Program | Exp): Result<string> =>
    isProgram(exp) ? bind(mapResult(l30ToJS, exp.exps), (exps: string[]) => makeOk( exps.join(";\n"))):
    isBoolExp(exp) ? makeOk(exp.val ? 'True' : 'False') : isNumExp(exp) ? makeOk( exp.val.toString()):
    isStrExp(exp) ? makeOk( `\"${exp.val}\"` ) : isLitExp(exp) ? makeOk( `Symbol.for(\"${ valueToString(exp.val)}\")`):
    isVarRef(exp) ? makeOk(exp.var) : isDefineExp(exp) ? bind(l30ToJS(exp.val), val => makeOk( `const ${exp.var.var} = ${val}`)):
    isProcExp(exp) ? bind(mapResult(l30ToJS, exp.body), body => makeOk( "(" + "(" +
    map((p) => p.var, exp.args).join(",") + ")" + " => " + body + ")")) :
    isIfExp(exp) ? bind(l30ToJS(exp.test), test => (bind(l30ToJS(exp.then), then => bind(l30ToJS(exp.alt), alt => makeOk(`(${test} ? ${then} : ${alt})`) )))):
    isPrimOp(exp) ? makeOk(Operators(exp.op)) : isAppExp(exp) ? (isPrimOp(exp.rator) ? compundExp(exp.rator, exp.rands):
    safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands.join(",")})`))(l30ToJS(exp.rator), mapResult(l30ToJS, exp.rands))):
    isLetExp(exp) ? l30ToJS(rewriteLet(exp)):
    makeFailure("fail");

export const Operators = (str: string): string =>
     str === "number?" ?
     "((x) => (typeof (x) === number))" :    
    
     str === "boolean?" ?
     "((x) => (typeof(x) === boolean))" :    
    
     str === "string?" ?
     "((x) => (typeof(x) === string))" :
    
     str === "=" || str === "eq?" ?
     "===" : 

    
     str === "symbol?" ?
     "((x) => (typeof (x) === symbol))" :
       
     str === "or" ?
     "||" :
     str === "and" ?
     "&&" :
    str;

export const compundExp = (prim: PrimOp, c: CExp[]): Result<string> =>
    
    prim.op === "number?"||prim.op === "boolean?"||prim.op === "symbol?"||prim.op === "string?" ?
    bind( l30ToJS(c[0]), (str: string) => makeOk( `${ Operators(prim.op) }(${ str })`)) :
    
    prim.op === "not" ?
    bind( l30ToJS(c[0]) , (str: string) => makeOk("(!"+str+")")) :
    
    prim.op === "and" || prim.op === "or" ?
    bind(mapResult(l30ToJS, c), (str: string[]) => makeOk("(" + str[0] + Operators(prim.op) + str[1] + ")")) :
    
    prim.op === "'" ?
    bind(l30ToJS(c[0]), (str: string) => makeOk(`(\"${str}\")`)) :
    
    prim.op === "string=?" ?
    bind(mapResult(l30ToJS, c), (str: string[]) => makeOk(`(${str[0]} === ${str[1]})`)) :
   
    bind(mapResult(l30ToJS, c), (str) => makeOk("(" + str.join(" " + Operators(prim.op) + " ") + ")"));


