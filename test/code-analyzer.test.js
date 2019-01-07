import assert from 'assert';
import {parseCode, vizSyntax} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(subs('',[])),
            ''
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(subs('a == x'),[['a',5],['x',5]]),
            '5 == 5'
        );
    });
});
