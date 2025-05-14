<template>
  <div class="highlight-container">
    <pre class="hljs" v-html="highlightHTML" ref="highlightBlock"></pre>
  </div>
</template>

<script>
import highlight from 'highlight.js'
import htmlFormat from '@/components/d2-highlight/libs/htmlFormat'
import 'highlight.js/styles/github.css'
import { lineNumbersBlock } from '@/assets/js/highlight-line-number'

export default {
  name: 'd2-highlight',
  props: {
    code: {
      type: String,
      required: false,
      default: ''
    },
    formatHtml: {
      type: Boolean,
      required: false,
      default: false
    },
    lang: {
      type: String,
      required: false,
      default: ''
    },
    redLines: {
      type: Array,
      required: false,
      default: () => []
    },
    confidenceData: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data () {
    return {
      highlightHTML: ''
    }
  },
  mounted () {
    this.highlight()
  },
  watch: {
    code () {
      this.highlight()
      this.$nextTick(() => {
        const block = this.$el
        lineNumbersBlock(block)
      })
    },
    redLines () {
      // 清除之前的高亮行
      const highlightedRows = document.querySelectorAll('.red-line')
      highlightedRows.forEach((tr) => {
        tr.classList.remove('red-line')
      })
      this.highlightHTML = this.highlightHTML + ' '
      this.$nextTick(() => {
        const block = this.$el
        lineNumbersBlock(block)
        this.$nextTick(() => {
          let flag = 0
          this.redLines.forEach((redLine) => {
            const selector = `td[data-line-number="${redLine}"]`
            const td = document.querySelector(selector)
            if (td) {
              const tr = td.parentNode
              if (flag === 0) {
                tr.scrollIntoView({ behavior: 'smooth', block: 'start' })
                flag = 1
              }
              tr.classList.add('red-line')
            }
          })
        })
      })
    }
  },
  methods: {
    highlight () {
      const code = this.formatHtml ? htmlFormat(this.code) : this.code
      if (code) {
        const highlighted = highlight.highlightAuto(code, [
          this.lang,
          'html',
          'solidity',
          'javascript',
          'json',
          'css',
          'scss',
          'less'
        ]).value
        const lines = highlighted.split('\n')
        this.highlightHTML = lines.map((line, index) => {
          const confidence = this.confidenceData[index] || 0
          const backgroundColor = this.getBackgroundColor(confidence)
          return `<span style="background-color: ${backgroundColor}; display: block;">${line}<span class="confidence-value">置信度: ${confidence.toFixed(2)}</span>`
        }).join('\n')
        // highlightHTML = highlightedHTML
        if (this.code) {
          this.highlightHTML = this.formatCodeWithConfidence(this.code, this.confidenceData)
        } else {
          this.highlightHTML = ''
        }
      }
    },
    getBackgroundColor (confidence) {
      if (confidence >= 3) return '#f8d7da' // 浅红
      if (confidence >= 2) return '#fff3cd' // 黄
      if (confidence >= 1) return '#d4edda' // 绿
      return '#d4edda'
    }
  }
}
</script>

<style>
.highlight-container {
  position: relative;
}

.hljs {
  padding: 0;
}

.confidence-value {
  float: right;
  margin-right: 5px;
  color: black;
  opacity: 0.6;
}
.highlight-container {
  font-family: monospace;
}
</style>

<style>
.red-line {
  background-color: #ffcece;
}
</style>
