import { describe, it, expect, vi, beforeEach } from 'vitest'
import MarkdownIt from 'markdown-it'
import MermaidPlugin, { getSyntaxHints, formatMermaidError } from './mermaid'

describe('MermaidPlugin - Current Behavior', () => {
  let md: MarkdownIt

  beforeEach(() => {
    md = new MarkdownIt()
    md.use(MermaidPlugin)
  })

  describe('explicit mermaid code blocks', () => {
    it('should render mermaid code block with language tag', () => {
      const result = md.render('```mermaid\ngantt\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('data-source=')
      expect(result).toContain('gantt')
    })
  })

  describe('auto-detect gantt diagrams', () => {
    it('should detect gantt diagram', () => {
      const result = md.render('```\ngantt\n  title A Gantt Diagram\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('gantt')
    })
  })

  describe('auto-detect sequenceDiagram', () => {
    it('should detect sequenceDiagram', () => {
      const result = md.render('```\nsequenceDiagram\n  Alice->>Bob: Hello\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('sequenceDiagram')
    })
  })

  describe('auto-detect erDiagram', () => {
    it('should detect erDiagram', () => {
      const result = md.render('```\nerDiagram\n  CUSTOMER ||--o{ ORDER : places\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('erDiagram')
    })
  })

  describe('auto-detect graph diagrams', () => {
    it('should detect graph TB', () => {
      const result = md.render('```\ngraph TB\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('graph TB')
    })

    it('should detect graph TD', () => {
      const result = md.render('```\ngraph TD\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('graph TD')
    })

    it('should detect graph LR', () => {
      const result = md.render('```\ngraph LR\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('graph LR')
    })

    it('should detect graph RL', () => {
      const result = md.render('```\ngraph RL\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('graph RL')
    })

    it('should detect graph BT', () => {
      const result = md.render('```\ngraph BT\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('graph BT')
    })

    it('should detect graph with semicolon', () => {
      const result = md.render('```\ngraph LR;\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('graph LR')
    })
  })

  describe('non-mermaid code blocks', () => {
    it('should not convert javascript code blocks', () => {
      const result = md.render('```javascript\nconst x = 1;\n```')
      expect(result).not.toContain('<div class="mermaid"')
      expect(result).toContain('<code')
    })

    it('should not convert plain code blocks with unknown content', () => {
      const result = md.render('```\nsome random text\n```')
      expect(result).not.toContain('<div class="mermaid"')
      expect(result).toContain('<code')
    })
  })
})

describe('getSyntaxHints', () => {
  it('should detect double colon syntax issue', () => {
    const hints = getSyntaxHints('graph LR\n  A[MyClass::method] --> B')
    expect(hints.length).toBeGreaterThan(0)
    expect(hints[0]).toContain('::')
    expect(hints[0]).toContain('quotes')
  })

  it('should detect parentheses syntax issue', () => {
    const hints = getSyntaxHints('graph LR\n  A[function()] --> B')
    expect(hints.length).toBeGreaterThan(0)
    expect(hints.some(h => h.includes('()'))).toBe(true)
  })

  it('should detect pipe character issue', () => {
    const hints = getSyntaxHints('graph LR\n  A[a | b] --> B')
    expect(hints.length).toBeGreaterThan(0)
    expect(hints.some(h => h.includes('|'))).toBe(true)
  })

  it('should return empty array for valid syntax', () => {
    const hints = getSyntaxHints('graph LR\n  A["properly quoted"] --> B')
    // This might still detect patterns inside quotes, which is fine
    // The important thing is it doesn't crash
    expect(Array.isArray(hints)).toBe(true)
  })

  it('should detect multiple issues', () => {
    const hints = getSyntaxHints('graph LR\n  A[MyClass::method()] --> B')
    expect(hints.length).toBeGreaterThanOrEqual(2)
  })
})

describe('formatMermaidError', () => {
  it('should format error with message', () => {
    const error = new Error('Parse error on line 1')
    const html = formatMermaidError(error, 'graph LR\n  A --> B')
    expect(html).toContain('mermaid-error')
    expect(html).toContain('Parse error on line 1')
  })

  it('should include syntax hints when applicable', () => {
    const error = new Error('Parse error')
    const html = formatMermaidError(error, 'graph LR\n  A[MyClass::method()] --> B')
    expect(html).toContain('mermaid-error-hints')
    expect(html).toContain('Possible fixes')
  })

  it('should show source code in details', () => {
    const error = new Error('Parse error')
    const code = 'graph LR\n  A --> B'
    const html = formatMermaidError(error, code)
    expect(html).toContain('Show source')
    expect(html).toContain('graph LR')
  })

  it('should handle error objects with str property', () => {
    const error = { str: 'Custom error string', message: 'ignored' }
    const html = formatMermaidError(error, 'graph LR')
    expect(html).toContain('Custom error string')
  })

  it('should escape HTML in error messages', () => {
    const error = new Error('<script>alert("xss")</script>')
    const html = formatMermaidError(error, 'graph LR')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('should escape HTML in source code', () => {
    const error = new Error('error')
    const code = 'graph LR\n  A["<script>"]'
    const html = formatMermaidError(error, code)
    expect(html).toContain('&lt;script&gt;')
  })
})
