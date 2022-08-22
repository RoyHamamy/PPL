import { forEach, pair, reject, values, valuesIn } from "ramda";

export const MISSING_KEY = '___MISSING_KEY___'
export const MISSING_TABLE_SERVICE = '___MISSING_TABLE_SERVICE___'

export type Table<T> = Readonly<Record<string, Readonly<T>>>

export type TableService<T> = {
    get(key: string): Promise<T>;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
}

// Q 2.1 (a)
export function makeTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>): TableService<T> {
    // optional initialization code
    return {
        get(key: string): Promise<T> {    
            return new Promise((res, rej) =>        
            sync().then((table) => {
                table[key] == undefined? rej(MISSING_KEY) : res(table[key]);
        }))
        },
        set(key: string, val: T): Promise<void> {            
            return new Promise((res, rej) =>  {
            const ans : Record<string, Readonly<T>> = {};
               sync().then((table) => {            
                    for(const k in table){
                        ans[k] = table[k];
                    }
                    ans[key] = val;
                    sync(ans).then(() => res());
                })})
        },

        delete(key: string): Promise<void> {            
            return new Promise((res, rej) => { 
            let ans : Record<string, Readonly<T>> = {};
               sync().then((table) => {                             
                    if(table[key] == undefined)
                        rej(MISSING_KEY)
                    else{
                        for(const k in table){
                            if(k != key)
                                ans[k] = table[k];                                
                        }                          
                        sync(ans).then(() => res());
                    }})})
        }
        }
    }


// Q 2.1 (b)
export function getAll<T>(store: TableService<T>, keys: string[]): Promise<T[]> { 
        return Promise.all(keys.map((key)=>store.get(key)));
    }



// Q 2.2
export type Reference = { table: string, key: string }

export type TableServiceTable = Table<TableService<object>>

export function isReference<T>(obj: T | Reference): obj is Reference {
    return typeof obj === 'object' && 'table' in obj
}

export async function constructObjectFromTables(tables: TableServiceTable, ref: Reference) {
    async function deref(ref: Reference) {
        try {
            var obj = await tables[ref.table].get(ref.key);
            var ans : Record<string, any> = await Promise.all(Object.entries(obj).map(async ( [key,val]) =>
            {
                let r : Record<string, any> = {};
                if(!isReference(val))
                {

                    r[key]= val;

                    return r;                    
                }
                else{

                    var v = await deref(val);
                    r[key]= v;

                    return r;

                }
            }
            ))

            var replace : Record<string, any> = {};
            
            ans.forEach((r:Record<string,any>) =>
            Object.entries(r).forEach(([key,val]) =>
            replace[key] = val ))
            return replace;

        }
        catch {return Promise.reject(MISSING_TABLE_SERVICE);
        }
    }

    return deref(ref)
}

// Q 2.3

export function lazyProduct<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function*() {
        for (let i of g1()) 
            for(let j of g2())                
                yield [i,j];                    
    }
}

export function lazyZip<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        let gen1 = g1();
        let gen2 = g2();
        for (let i of g1())                 
            yield [gen1.next().value,gen2.next().value];  
    }
}

// Q 2.4
export type ReactiveTableService<T> = {
    get(key: string): T;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
    subscribe(observer: (table: Table<T>) => void): void
}

export async function makeReactiveTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>, optimistic: boolean): Promise<ReactiveTableService<T>> {
    // optional initialization code

    let _table: Table<T> = await sync()
    let observers: ((table: Table<T>) => void)[] = [];
    
    const handleMutation = async (newTable: Table<T>) => {
        
        if (optimistic) {
            observers.forEach((o) => o(newTable));

            try {await sync(newTable);
                _table = newTable;
            } 

            catch {
                observers.forEach((o) => o(_table));
                return Promise.reject("__EXPECTED_FAILURE__");
            }
        }else {
            try {
                await sync(newTable);
                _table = newTable;
                observers.forEach((o) => o(_table));
            } 
            catch {
                return Promise.reject("__EXPECTED_FAILURE__");
            }
        }    
    }

    return {
        get(key: string): T {
            if (key in _table) {
                return _table[key]
            } else {
                throw MISSING_KEY
            }
        },
        set(key: string, val: T): Promise<void> {
            let nTable:Record<string, Readonly<T>> = {};
            for(const k in _table){
                nTable[k] = _table[k];
            }
            nTable[key] = val;
            return handleMutation(nTable);
        },
        delete(key: string): Promise<void> {
            let nTable:Record<string, Readonly<T>> = {};
            if(_table[key] == undefined)
                return Promise.reject(MISSING_KEY);
        else{
            for(const k in _table){
                if(k != key)
                    nTable[k] = _table[k];                                
            }             
            return handleMutation(nTable);
        }},

        subscribe(observer: (table: Table<T>) => void): void {
            observers = observers.concat([observer])
        }
    }
}