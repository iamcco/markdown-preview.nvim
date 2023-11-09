// fork from https://github.com/waylonflinn/markdown-it-katex
/* Process inline math */
/* 
Like markdown-it-simplemath, this is a stripped down, simplified version of:
https://github.com/runarberg/markdown-it-math
It differs in that it takes (a subset of) LaTeX as input and relies on KaTeX
for rendering output.
*/

/* jslint node: true */
'use strict'

// Test if potential opening or closing delimiter
// Assumes that there is a "$" at state.src[pos]
function isValidDelim(state, pos) {
  var prevChar, nextChar;

  var max = state.posMax;

  var can_open = true;
  var can_close = true;

  prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
  nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;

  // Check non-whitespace conditions for opening and closing, and
  // check that closing delimiter isn't followed by a number
  if (prevChar === 0x20/* " " */ || prevChar === 0x09/* \t */ ||
            (nextChar >= 0x30/* "0" */ && nextChar <= 0x39/* "9" */)) {
    can_close = false;
  }
  if (nextChar === 0x20/* " " */ || nextChar === 0x09/* \t */) {
    can_open = false;
  }

  return {
    can_open: can_open,
    can_close: can_close
  };
}

function math_inline(state, silent) {
  var start, match, token, res, pos, esc_count;

  if (state.src[state.pos] !== '$') { return false; }

  res = isValidDelim(state, state.pos);
  if (!res.can_open) {
    if (!silent) { state.pending += '$'; }
    state.pos += 1;
    return true;
  }

  // First check for and bypass all properly escaped delimiters
  // This loop will assume that the first leading backtick can not
  // be the first character in state.src, which is known since
  // we have found an opening delimiter already.
  start = state.pos + 1;
  match = start;
  while ((match = state.src.indexOf('$', match)) !== -1) {
    // Found potential $, look for escapes, pos will point to
    // first non escape when complete
    pos = match - 1;
    while (state.src[pos] === '\\') { pos -= 1; }

    // Even number of escapes, potential closing delimiter found
    if (((match - pos) % 2) == 1) { break; }
    match += 1;
  }

  // No closing delimiter found. Consume $ and continue.
  if (match === -1) {
    if (!silent) { state.pending += '$'; }
    state.pos = start;
    return true;
  }

  // Check if we have empty content, ie: $$. Do not parse.
  if (match - start === 0) {
    if (!silent) { state.pending += '$$'; }
    state.pos = start + 1;
    return true;
  }

  // Check for valid closing delimiter
  res = isValidDelim(state, match);
  if (!res.can_close) {
    if (!silent) { state.pending += '$'; }
    state.pos = start;
    return true;
  }

  if (!silent) {
    token = state.push('math_inline', 'math', 0);
    token.markup = '$';
    token.content = state.src.slice(start, match);
  }

  state.pos = match + 1;
  return true;
}

function math_block(state, start, end, silent) {
  var firstLine, lastLine, next, lastPos, found = false, token;

  var pos = state.bMarks[start] + state.tShift[start];
  var max = state.eMarks[start];

  if (pos + 2 > max) { return false; }
  if (state.src.slice(pos, pos + 2) !== '$$') { return false; }

  pos += 2;
  firstLine = state.src.slice(pos, max);

  if (silent) { return true; }
  if (firstLine.trim().slice(-2) === '$$') {
    // Single line expression
    firstLine = firstLine.trim().slice(0, -2);
    found = true;
  }

  for (next = start; !found;) {
    next++;

    if (next >= end) { break; }

    pos = state.bMarks[next] + state.tShift[next];
    max = state.eMarks[next];

    if (pos < max && state.tShift[next] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      break;
    }

    if (state.src.slice(pos, max).trim().slice(-2) === '$$') {
      lastPos = state.src.slice(0, max).lastIndexOf('$$');
      lastLine = state.src.slice(pos, lastPos);
      found = true;
    }
  }

  state.line = next + 1;

  token = state.push('math_block', 'math', 0);
  token.block = true;
  token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
    state.getLines(start + 1, next, state.tShift[start], true) +
    (lastLine && lastLine.trim() ? lastLine : '');
  token.map = [ start, state.line ];
  token.markup = '$$';
  return true;
}

export default function math_plugin(md, options) {
  // Default options

  options = options || {};
  options.macros = options.macros || {};

  // set KaTeX as the renderer for markdown-it-simplemath
  var katexInline = function (latex) {
    const opt = {
      ...options
    };
    if (opt.displayMode === undefined) {
      opt.displayMode = false;
    }
    try {
      return katex.renderToString(latex, opt);
    } catch (error) {
      if (opt.throwOnError) { console.log(error); }
      return latex;
    }
  };

  var inlineRenderer = function (tokens, idx) {
    return katexInline(tokens[idx].content);
  };

  var katexBlock = function (latex) {
    const opt = {
      ...options
    };
    if (opt.displayMode === undefined) {
      opt.displayMode = true;
    };
    try {
      return '<p>' + katex.renderToString(latex, opt) + '</p>';
    } catch (error) {
      if (opt.throwOnError) { console.log(error); }
      return latex;
    }
  };

  var blockRenderer = function (tokens, idx) {
    return katexBlock(tokens[idx].content) + '\n';
  };

  // Add `math` as an additional block delimiter
  md.block.ruler.before('fence', 'math_block', function math_block(state, start, end, silent) {
    var marker, len, params, nextLine, mem, token, haveEndMarker = false, pos = state.bMarks[start] + state.tShift[start], max = state.eMarks[start];

    // if it's indented more than 3 spaces, it should be a code block
    if (state.sCount[start] - state.blkIndent >= 4) { return false; }
    if (silent) { return false; } // don't run any pairs in validation mode

    if (pos + 6 > max) { return false; }
    marker = state.src.charCodeAt(pos);

    // Check out the first character quickly,
    // this should filter out most of non-containers
    if (marker !== 0x60/* ` */) { return false; }

    // Check out the rest of the marker string
    for (nextLine = start; nextLine < end; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) { break; }

      mem = pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.sCount[nextLine] - state.blkIndent >= 4) { continue; }

      if (state.src.charCodeAt(pos) !== marker) { continue; }
      if (state.sCount[nextLine] - state.blkIndent > 0) { continue; }

      pos = state.skipChars(pos, marker);

      // make sure tail has spaces only
      pos = state.skipSpaces(pos);

      if (pos < max) { continue; }

      // found!
      haveEndMarker = true;
      // found the end of the block, get out of the loop
      break;
    }

    // If a fence has heading spaces, they should be removed from its inner block
    len = state.sCount[start];

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    token = state.push('fence', 'code', 0);
    token.info = params;
    token.content = state.getLines(start + 1, nextLine, len, true);
    token.markup = String.fromCharCode(marker);
    token.map = [ start, state.line ];

    return true;
  });

  // Override original math_block with the new one that checks for ```math
  md.block.ruler.at('math_block', function math_block(state, start, end, silent) {
    var firstLine, lastLine, next, lastPos, found = false, token,
        pos = state.bMarks[start] + state.tShift[start],
        max = state.eMarks[start];

    if (pos + 7 > max) { return false; }
    if (state.src.slice(pos, pos + 7) !== '```math') { return false; }

    pos += 7;
    firstLine = state.src.slice(pos, max);

    if (silent) { return true; }
    if (firstLine.trim().slice(-3) === '```') {
      // Single line expression
      firstLine = firstLine.trim().slice(0, -3);
      found = true;
    }

    for (next = start; !found;) {
      next++;

      if (next >= end) { break; }

      pos = state.bMarks[next] + state.tShift[next];
      max = state.eMarks[next];

      if (pos < max && state.tShift[next] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        break;
      }

      if (state.src.slice(pos, max).trim().slice(-3) === '```') {
        lastPos = state.src.slice(0, max).lastIndexOf('```');
        lastLine = state.src.slice(pos, lastPos);
        found = true;
      }
    }

    state.line = next + 1;

    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
      state.getLines(start + 1, next, state.tShift[start], true) +
      (lastLine && lastLine.trim() ? lastLine : '');
    token.map = [ start, state.line ];
    token.markup = '```math';
    return true;
  });

  md.inline.ruler.after('escape', 'math_inline', math_inline);
  md.block.ruler.after('blockquote', 'math_block', math_block, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules.math_inline = inlineRenderer;
  md.renderer.rules.math_block = blockRenderer;
}

