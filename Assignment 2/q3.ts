import {  LetExp,LetStarExp, Exp,PrimOp,makeVarRef, Program,VarRef,VarDecl, isLetStarExp, makeProgram, makeLetExp, makePrimOp, makeVarDecl, isProgram, makeBinding, CExp, isCExp, Binding, isIfExp, IfExp, makeIfExp } from "./L31-ast";
import { Result,makeOk, makeFailure } from "../shared/result";
import { map } from "ramda";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/


const FMap = (exp:Exp):Exp=>
{
    if((isIfExp(exp))){return ExpLetStarIsIf(exp);}
    else if(isCExp(exp)){return letStarCExp(exp);}    
    return exp;
}

const letStarExp = ( bindings: Binding[] , body: CExp[] ) : LetExp =>
{
    if(bindings.length === 1){
        return makeLetExp ([makeBinding (bindings[0].var.var , letStarCExp(bindings[0].val))] , map(letStarCExp,body) );
    }
    const Bnd = makeBinding(bindings[bindings.length-1].var.var,letStarCExp(bindings[bindings.length-1].val));
    const otherBody = [letStarExp([Bnd],map(letStarCExp,body))]
    const ans = letStarExp(bindings.slice(0,-1) , otherBody);
    return ans;    
}

const letStarCExp = (exp:CExp): CExp =>
{
    if(isLetStarExp(exp))
        return letStarExp(exp.bindings , exp.body);
    else
        return exp;
}
function ExpLetStarIsIf(exp: IfExp): Exp {
    const Exp1 = letStarCExp(exp.test);
    const Exp2 = letStarCExp(exp.then)
    const Exp3 = letStarCExp(exp.alt)
    return makeIfExp(Exp1 , Exp2, Exp3,);
}

export const L31ToL3 = (exp: Exp | Program ): Result<Exp | Program> =>
{
   if(isProgram(exp)){
     return makeOk (makeProgram (map(FMap, exp.exps) ));   
   }
   else
     return makeOk(FMap(exp));  
    
}

