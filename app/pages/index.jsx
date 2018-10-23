import React from 'react'
import Head from 'next/head'
import io from 'socket.io-client'
import MarkdownIt from 'markdown-it'
import mk from 'markdown-it-katex'
import hljs from 'highlight.js'
import mkuml from 'markdown-it-plantuml'
import linenumbers from './linenumbers'
import image from './image'

const DEFAULT_OPTIONS = {
  mkit: {
    // Enable HTML tags in source
    html: true,
    // Use '/' to close single tags (<br />).
    // This is only for full CommonMark compatibility.
    xhtmlOut: true,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks. Can be
    // useful for external highlighters.
    langPrefix: 'language-',
    // Autoconvert URL-like text to links
    linkify: true,
    // Enable some language-neutral replacement + quotes beautification
    typographer: true,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '“”‘’',
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externally.
    // If result starts with <pre... internal wrapper is skipped.
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value
        } catch (__) {}
      }

      return '' // use external default escaping
    }
  },
  katex: {
    'throwOnError': false,
    'errorColor': ' #cc0000'
  },
  uml: {}
}

export default class PreviewPage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      cursor: '',
      content: ''
    }
  }

  componentDidMount () {
    const socket = io({
      query: {
        bufnr: window.location.pathname.split('/')[2]
      }
    })

    window.socket = socket

    socket.on('connect', this.onConnect.bind(this))

    socket.on('disconnect', this.onDisconnect.bind(this))

    socket.on('close', this.onClose.bind(this))

    socket.on('refresh_content', this.onRefreshContent.bind(this))

    socket.on('close_page', this.onClose.bind(this))
  }

  onConnect () {
    console.log('connect success')
  }

  onDisconnect () {
    console.log('disconnect')
  }

  onClose () {
    console.log('close')
    window.close()
  }

  onRefreshContent ({ options = {}, cursor, content }) {
    if (!this.md) {
      const { mkit = {}, katex = {}, uml = {} } = options
      // markdown-it
      this.md = new MarkdownIt({
        ...DEFAULT_OPTIONS.mkit,
        ...mkit
      })
      // katex
      this.md
        .use(mk, {
          ...DEFAULT_OPTIONS.katex,
          ...katex
        })
        .use(mkuml, {
          ...DEFAULT_OPTIONS.uml,
          ...uml
        })
        .use(image)
        .use(linenumbers)
    }
    this.setState({
      cursor,
      content: this.md.render(content.join('\n'))
    }, () => {
      const line = cursor[1]
      const lineEle = document.querySelector(`[data-source-line="${line - 1}"]`)
      if (lineEle) {
        // eslint-disable-next-line
        TweenLite.to(
          document.body,
          0.4,
          {
            scrollTop: lineEle.offsetTop - 100,
            ease: Power2.easeOut // eslint-disable-line
          }
        )
        // eslint-disable-next-line
        TweenLite.to(
          document.documentElement,
          0.4,
          {
            scrollTop: lineEle.offsetTop - 100,
            ease: Power2.easeOut // eslint-disable-line
          }
        )
      }
    })
  }

  render () {
    const { content } = this.state
    return (
      <React.Fragment>
        <Head>
          <title>preview page</title>
          <link rel="stylesheet" href="/_static/markdown.css" />
          <link rel="stylesheet" href="/_static/highlight.css" />
          <link rel="stylesheet" href="/_static/katex@0.5.1.css" />
          <script type="text/javascript" src="/_static/tweenlite.min.js"></script>
        </Head>
        <section
          className="markdown-body"
          dangerouslySetInnerHTML={{
            __html: content
          }}
        />
      </React.Fragment>
    )
  }
}

