import { describe, it, expect, beforeEach } from 'vitest'
import MarkdownIt from 'markdown-it'
import MermaidPlugin from './mermaid'

describe('MermaidPlugin - v11 Diagram Types', () => {
  let md: MarkdownIt

  beforeEach(() => {
    md = new MarkdownIt()
    md.use(MermaidPlugin)
  })

  describe('flowchart diagrams (v11)', () => {
    it('should detect flowchart TD', () => {
      const result = md.render('```\nflowchart TD\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('flowchart TD')
    })

    it('should detect flowchart LR', () => {
      const result = md.render('```\nflowchart LR\n  A-->B\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('flowchart LR')
    })
  })

  describe('classDiagram (v11)', () => {
    it('should detect classDiagram', () => {
      const result = md.render('```\nclassDiagram\n  Animal <|-- Duck\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('classDiagram')
    })
  })

  describe('stateDiagram-v2 (v11)', () => {
    it('should detect stateDiagram-v2', () => {
      const result = md.render('```\nstateDiagram-v2\n  [*] --> Still\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('stateDiagram-v2')
    })

    it('should detect stateDiagram (v1)', () => {
      const result = md.render('```\nstateDiagram\n  [*] --> Still\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('stateDiagram')
    })
  })

  describe('pie chart (v11)', () => {
    it('should detect pie chart', () => {
      const result = md.render('```\npie\n  "Dogs" : 386\n  "Cats" : 85\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('pie')
    })

    it('should detect pie chart with title', () => {
      const result = md.render('```\npie title Pets\n  "Dogs" : 386\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('pie')
    })
  })

  describe('journey (user journey) (v11)', () => {
    it('should detect journey diagram', () => {
      const result = md.render('```\njourney\n  title My working day\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('journey')
    })
  })

  describe('gitGraph (v11)', () => {
    it('should detect gitGraph', () => {
      const result = md.render('```\ngitGraph\n  commit\n  branch develop\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('gitGraph')
    })
  })

  describe('mindmap (v11)', () => {
    it('should detect mindmap', () => {
      const result = md.render('```\nmindmap\n  root((mindmap))\n    Origins\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('mindmap')
    })
  })

  describe('timeline (v11)', () => {
    it('should detect timeline', () => {
      const result = md.render('```\ntimeline\n  title History\n  2020 : Event1\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('timeline')
    })
  })

  describe('quadrantChart (v11)', () => {
    it('should detect quadrantChart', () => {
      const result = md.render('```\nquadrantChart\n  title Reach vs Effort\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('quadrantChart')
    })
  })

  describe('sankey-beta (v11)', () => {
    it('should detect sankey-beta', () => {
      const result = md.render('```\nsankey-beta\n  A,B,10\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('sankey-beta')
    })
  })

  describe('xychart-beta (v11)', () => {
    it('should detect xychart-beta', () => {
      const result = md.render('```\nxychart-beta\n  title "Sales"\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('xychart-beta')
    })
  })

  describe('block-beta (v11)', () => {
    it('should detect block-beta', () => {
      const result = md.render('```\nblock-beta\n  columns 3\n```')
      expect(result).toContain('<div class="mermaid"')
      expect(result).toContain('block-beta')
    })
  })
})
