import {escape} from './utils';

/*
 * global mermaid
*/

// Mermaid v11 diagram types for auto-detection
const MERMAID_DIAGRAM_TYPES = [
  'gantt',
  'sequenceDiagram',
  'erDiagram',
  'classDiagram',
  'stateDiagram',
  'stateDiagram-v2',
  'pie',
  'journey',
  'gitGraph',
  'mindmap',
  'timeline',
  'quadrantChart',
  'sankey-beta',
  'xychart-beta',
  'block-beta',
]

// Patterns that need regex matching (flowchart/graph with direction)
const MERMAID_DIRECTIONAL_PATTERNS = [
  /^graph (?:TB|BT|RL|LR|TD);?$/,
  /^flowchart (?:TB|BT|RL|LR|TD);?$/,
]

const mermaidChart = (code) => {
  return `<div class="mermaid" data-source="${escape(code)}">${escape(code)}</div>`
}

// Common syntax issues and their solutions
const SYNTAX_HINTS = [
  {
    pattern: /::/,
    hint: 'Double colons (::) are interpreted as style/class separators. Wrap node text in quotes: A["MyClass::method()"]'
  },
  {
    pattern: /\(\)(?!\s*-->|\s*---|\s*-\.-|\s*==>)/,
    hint: 'Parentheses () are shape markers in Mermaid. Wrap text containing () in quotes: A["function()"]'
  },
  {
    pattern: /\[\s*[^\]]*[<>][^\]]*\]/,
    hint: 'Angle brackets < > can conflict with Mermaid syntax. Use HTML entities (&lt; &gt;) or wrap in quotes.'
  },
  {
    pattern: /\[\s*[^\]]*\|[^\]]*\]/,
    hint: 'Pipe character | defines node shape boundaries. Wrap text containing | in quotes.'
  },
  {
    pattern: /\[\s*[^\]]*\{[^\]]*\}/,
    hint: 'Curly braces {} define diamond/rhombus shapes. Wrap text containing {} in quotes.'
  }
]

/**
 * Analyze mermaid code and return relevant syntax hints
 */
export const getSyntaxHints = (code) => {
  return SYNTAX_HINTS.filter(({pattern}) => pattern.test(code)).map(({hint}) => hint)
}

/**
 * Format a mermaid error for display with helpful hints
 */
export const formatMermaidError = (error, code) => {
  const hints = getSyntaxHints(code)
  // Mermaid errors often have a 'str' property with the full error text
  const errorMessage = (error && error.str) || (error && error.message) || String(error)

  let html = `<div class="mermaid-error">
    <div class="mermaid-error-header">⚠️ Mermaid Diagram Error</div>
    <div class="mermaid-error-message">${escape(errorMessage)}</div>`

  if (hints.length > 0) {
    html += `<div class="mermaid-error-hints">
      <strong>Possible fixes:</strong>
      <ul>${hints.map(h => `<li>${escape(h)}</li>`).join('')}</ul>
    </div>`
  }

  html += `<div class="mermaid-error-tip">
    <strong>General tip:</strong> Wrap node labels in quotes to escape special characters:<br/>
    <code>A["text with special::chars()"]</code>
  </div>
  <details class="mermaid-error-source">
    <summary>Show source</summary>
    <pre>${escape(code)}</pre>
  </details>
</div>`

  return html
}

/**
 * Render mermaid diagrams with error handling
 * Call this instead of mermaid.run() directly
 */
export const renderMermaidWithErrorHandling = async (mermaidInstance, options = {}) => {
  const nodes = document.querySelectorAll('.mermaid:not(.mermaid-processed)')

  for (const node of nodes) {
    const code = node.getAttribute('data-source') || node.textContent.trim()
    node.classList.add('mermaid-processed')

    try {
      // Try to parse first to catch syntax errors
      await mermaidInstance.parse(code)

      // If parse succeeds, render the diagram
      const { svg } = await mermaidInstance.render(`mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, code)
      node.innerHTML = svg
    } catch (error) {
      // Display formatted error in place of the diagram
      node.innerHTML = formatMermaidError(error, code)
      node.classList.add('mermaid-has-error')
    }
  }
}

const isMermaidDiagram = (firstLine) => {
  // Check exact matches (including 'pie title ...' pattern)
  if (MERMAID_DIAGRAM_TYPES.some(type =>
    firstLine === type || firstLine.startsWith(type + ' ')
  )) {
    return true
  }
  // Check directional patterns (graph/flowchart with direction)
  return MERMAID_DIRECTIONAL_PATTERNS.some(pattern => pattern.test(firstLine))
}

const MermaidPlugin = (md) => {
  const origin = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    const code = token.content.trim()
    if (typeof token.info === 'string' && token.info.trim() === 'mermaid') {
      return mermaidChart(code)
    }
    const firstLine = code.split(/\n/)[0].trim()
    if (isMermaidDiagram(firstLine)) {
      return mermaidChart(code)
    }
    return origin(tokens, idx, options, env, slf)
  }
}

export default MermaidPlugin
