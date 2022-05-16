// const item = require("flexsearch");
import flexsearch from 'flexsearch'
import message from '../types/message';

// can search by message, special search


let searcher: flexsearch.Document = new flexsearch.Document({
    preset: 'match',
    tokenize: 'full',
    document: {
        index: ["comserver", "raw_message", "scripts"]
    },
});

export default searcher

export function add_to_index(message: message) : boolean{
    if (searcher.contain(message)){
        return false;
    }
    searcher.add(message)
    return true;
}

export function search(query: string): any[]{
    // different search modes
    return searcher.search(query, ["comserver", "raw_message", "scripts"]);
}


// this is how u do it you son of a gun!

// const res = resultIndex.search([
//    { field: 'status', query: 'in-stock', bool: 'or' },
//    { field: 'status', query: 'out-of-stock', bool: 'or' },
// ]);


// string[] -> [string1 &%^$# string2 &%^$# string 3 &%^$# string 4] 