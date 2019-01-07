import * as esprima from 'esprima';
import * as Styx from 'styx';


const parseCode = (codeToParse) => {
    var ast = esprima.parseScript(codeToParse, { loc: true });
    var flowProgram = Styx.parse(ast);
    var obj = Styx.exportAsObject(flowProgram);
    var f_cfg = obj.functions[0].flowGraph;
    Array.from(f_cfg.edges,node => delete node.data);
    f_cfg = f_cfg.edges;
    return f_cfg;
};

function isGreened(green, dia_edge) {
    return (green.includes(dia_edge.from) ? ',color=green,style=filled' : '');
}

function nonConditionalEdge(done, curr_edge, viz_string, squares) {
    if (!done.includes(curr_edge.from)) {
        done.push(curr_edge.from);
    }
    if (curr_edge.type !== 'AbruptCompletion') {
        viz_string += ' ' + curr_edge.from + '->' + curr_edge.to + '\n';
    }
    squares.push(curr_edge);
    return viz_string;
}

function typeHandle(curr_edge, diamonds, done, viz_string, squares) {
    if (curr_edge.type === 'Conditional') {
        diamonds.push(curr_edge);
        curr_edge['Truth'] = !done.includes(curr_edge.from);
        if (done.includes(curr_edge.from)) {
            viz_string += ' ' + curr_edge.from + '->' + curr_edge.to + ' [label="F"]\n';
        }
        else {
            viz_string += ' ' + curr_edge.from + '->' + curr_edge.to + ' [label="T"]\n';
            done.push(curr_edge.from);
        }
    }
    else {
        viz_string = nonConditionalEdge(done, curr_edge, viz_string, squares);
    }
    return viz_string;
}

function branching(i_is_source, ids_vals, green) {
    var whereTrue = i_is_source.filter(function (e) {
        try {
            return e['Truth'] === eval(subs(e.label, ids_vals));
        }
        catch (ReferenceError) {
            return Math.floor(Math.random() * 2) === 0;
        }
    });
    if (!green.includes(whereTrue[0].to))
        green.push(whereTrue[0].to);
    return whereTrue;
}

function handleGreen(green, cfg, ids_vals) {
    for (var i = 0; i < green.length; i++) {
        let i_is_source = cfg.filter(e => e.from === green[i]);
        if (i_is_source.length == 1 && !green.includes(i_is_source[0].to)) {
            green.push(i_is_source[0].to);
        }
        else if (i_is_source.length > 1) {
            branching(i_is_source, ids_vals, green);
        }
    }
}

function makeGraph(diamonds, done, viz_string, green, squares) {
    for (let dia_edge of diamonds) {
        if (done.includes(dia_edge.from)) {
            viz_string += ' ' + dia_edge.from + ' [shape=diamond,label = "' + dia_edge.label + '",xlabel = ' + dia_edge.from +
                isGreened(green, dia_edge) + ']' + '\n';
            done.splice(done.indexOf(dia_edge.from), 1);
        }
    }

    for (let squ_edge of squares) {
        if (done.includes(squ_edge.from)) {
            viz_string += ' ' + squ_edge.from + ' [shape=square,label = "' + squ_edge.label + '",xlabel = ' + squ_edge.from +
                isGreened(green, squ_edge) + ']' + '\n';
            done.splice(done.indexOf(squ_edge.from), 1);
        }
    }
    return viz_string;
}

const vizSyntax = (cfg,start,ids_vals) =>{
    let viz_string = 'digraph G {';
    let edges = cfg;
    let squares = [],diamonds = [];
    let done = [];
    let green = [start];
    for(var i =0;i<edges.length;i++){
        let curr_edge = edges[i];
        if(curr_edge.type===undefined)
            continue;
        viz_string = typeHandle(curr_edge, diamonds, done, viz_string, squares);
    }
    handleGreen(green, cfg, ids_vals);
    viz_string = makeGraph(diamonds, done, viz_string, green, squares);
    return viz_string + '}';
};

function subs(str, ids_vals) {
    var ret = str;
    for(var i =0;i<ids_vals.length;i++){
        ret=ret.replace(ids_vals[i][0] +' ', '' + ids_vals[i][1]);
        ret=ret.replace(' ' +ids_vals[i][0], '' + ids_vals[i][1]);
    }
    return ret;
}

export {vizSyntax};
export {parseCode};
