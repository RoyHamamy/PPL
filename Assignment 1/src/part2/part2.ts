import * as R from "ramda";

const stringToArray = R.split("");

/* Question 1 */
export const countLetters: (s: string) =>  {} = (s: string)  => { 
    const str = R.replace(/\s/g,"",s);
    return R.countBy(R.toLower)(stringToArray(str));    
};  

/* Question 2 */
export const isPaired = (s: string): boolean => {
    return R.reduce((remain,index) => {
    
        if(index ==='}'||index ===']'||index ===')'){
    
        switch (index) {     
    // in case we have a closing char of '}'
            case '}' : {
                    const len = remain.length;
                if (remain.charAt(len -1) === '{') {
                    const slicer = remain.slice(0,len - 1);
                    remain = slicer;
    
                    return remain;
                }
                else {
    
                const ans = remain + index;
    
                return remain;
    
             }
        }
    // in case we have a closing char of ']'
        case ']' : {
        const len = remain.length -1;
    
            if (remain.charAt(len) === '[') {
            const slicer = remain.slice(0,len);
    
            remain = slicer;
    
                return remain;
            }
            else {
    
            const ans = remain + index;
    
            return ans;
            }
        }
    // in case we have a closing char of ')'
        case ')' : {
            const len = remain.length -1;
    
                if (remain.charAt(len) === '(') {
    
                const slicer = remain.slice(0,len);
    
                    remain = slicer;
    
            return remain;
    }
        else {
    
            const ans = remain + index;
    
                return ans;
        }
    }
                        
    }
    }
    
    else {
    
        const ans = remain + index;
    
        return ans;
    }
    },"",R.filter(ans=>ans==='{'||ans==='}'||ans==='['||ans===']'|| ans === '('||ans === ')' ,stringToArray(s))) === "";
    }
    
    // console.log(isPaired("{{(([]))}}"))
    
/* Question 3 */
export interface WordTree {
    root: string;
    children: WordTree[];
}

export const treeToSentence = (t: WordTree): string =>{ 
    const str = "";
    const con = R.reduce((sentence, word) => sentence + " " + treeToSentence(word),str,t.children); 
    return t.root + con;  
}

