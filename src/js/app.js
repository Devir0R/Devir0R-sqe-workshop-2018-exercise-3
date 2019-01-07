import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {vizSyntax} from './code-analyzer';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

let viz = new Viz({ Module, render });

function trimParamsFromCFG(cfg, j, args) {
    var ids_vals = [];
    for (var i = 0; i < cfg.length; i++) {
        if (cfg[i].label.includes('$$params')) {
            j++;
            ids_vals.push([cfg[i].label.substr(0, cfg[i].label.indexOf(' = $$params')), args[i]]);
        }
        else {
            break;
        }
    }
    var start = cfg[j].from;
    cfg.splice(0, j, ids_vals);
    return {ids_vals, start};
}

function createCFG(codeToParse) {
    let cfg = parseCode(codeToParse);
    var j = 0;
    let args = eval('[' + $('#inpVec').val() + ']');
    var {ids_vals, start} = trimParamsFromCFG(cfg, j, args);
    return cfg;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let output = document.getElementById('output');
        let cfg = createCFG(codeToParse);
        let viz_out = vizSyntax(cfg,start,ids_vals);
        viz.renderString(viz_out)
            .then(result => {
                output.innerHTML = result;
            });
        //$('#parsedCode').val(JSON.stringify(cfg, null, 2));
    });
});
