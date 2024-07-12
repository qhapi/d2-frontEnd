<template>
  <pre class="hljs" v-html="highlightHTML" ref="highlightBlock"></pre>
</template>

<script>
// 相关文档
// https://highlightjs.org/usage/
// http://highlightjs.readthedocs.io/en/latest/api.html#configure-options
import highlight from 'highlight.js'
import htmlFormat from './libs/htmlFormat'
// import { lineNumbersBlock } from 'highlight-line-number.js'
// import './libs/style.github.css'
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
      // eslint-disable-next-line vue/require-valid-default-prop
      default: []
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
      this.highlightHTML = highlight.highlightAuto(code, [
        this.lang,
        'html',
        'javascript',
        'json',
        'css',
        'scss',
        'less'
      ]).value
    }
  }
}
</script>

<style>
.red-line {
  background-color: #ffcece;
}
</style>
