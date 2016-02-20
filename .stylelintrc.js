module.exports = {
  'rules': {
    'at-rule-empty-line-before': [
      'always', {
        'except': ['blockless-group', 'first-nested'],
        'ignore': ['after-comment']
      }
    ],
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always-multi-line',
    'block-closing-brace-space-before': 'always-single-line',
    'block-no-empty': true,
    'block-opening-brace-newline-after': 'always-multi-line',
    'block-opening-brace-space-after': 'always-single-line',
    'block-opening-brace-space-before': 'always',
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'color-no-invalid-hex': true,
    'comment-empty-line-before': [
      'always', {
        'except': ['first-nested'],
        'ignore': ['stylelint-commands', 'between-comments']
      }
    ],
    'comment-whitespace-inside': 'always',
    'declaration-bang-space-after': 'never',
    'declaration-bang-space-before': 'always',
    'declaration-block-semicolon-newline-after': 'always-multi-line',
    'declaration-block-semicolon-space-after': 'always-single-line',
    'declaration-block-semicolon-space-before': 'never',
    'declaration-block-single-line-max-declarations': 1,
    'declaration-colon-newline-after': 'always-multi-line',
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    'font-family-name-quotes': 'single-where-recommended',
    'function-calc-no-unspaced-operator': true,
    'function-comma-newline-after': 'always-multi-line',
    'function-comma-space-after': 'always-single-line',
    'function-comma-space-before': 'never',
    'function-linear-gradient-no-nonstandard-direction': true,
    'function-parentheses-newline-inside': 'always-multi-line',
    'function-parentheses-space-inside': 'never-single-line',
    'function-whitespace-after': 'always',
    'function-url-quotes': 'single',
    'indentation': 2,
    'max-empty-lines': 1,
    'max-line-length': 120,
    'media-feature-colon-space-after': 'always',
    'media-feature-colon-space-before': 'never',
    'media-feature-range-operator-space-after': 'always',
    'media-feature-range-operator-space-before': 'always',
    'media-query-list-comma-newline-after': 'always-multi-line',
    'media-query-list-comma-space-after': 'always-single-line',
    'media-query-list-comma-space-before': 'never',
    'media-query-parentheses-space-inside': 'never',
    'no-eol-whitespace': true,
    'no-invalid-double-slash-comments': true,
    'no-missing-eof-newline': true,
    'no-unknown-animations': true,
    'number-leading-zero': 'always',
    'number-max-precision': 2,
    'number-no-trailing-zeros': true,
    'number-zero-length-no-unit': true,
    'property-no-vendor-prefix': true,
    'rule-no-duplicate-properties': true,
    'root-no-standard-properties': true,
    'rule-nested-empty-line-before': [
      'always-multi-line', {
        'except': ['first-nested'],
        'ignore': ['after-comment']
      }
    ],
    'rule-no-shorthand-property-overrides': true,
    'rule-non-nested-empty-line-before': [
      'always-multi-line', {
        'ignore': ['after-comment']
      }
    ],
    'rule-properties-order': [[{
      // https://www.w3.org/TR/css-2015/
      // https://www.w3.org/TR/2011/REC-CSS2-20110607/propidx.html
      // https://www.w3.org/TR/2015/CR-css-cascade-3-20150416/#property-index
      // https://www.w3.org/TR/2011/REC-css3-color-20110607/#property
      // https://www.w3.org/TR/2014/CR-css3-background-20140909/#property-index
      // https://www.w3.org/TR/2012/CR-css3-images-20120417/#property-index
      // https://www.w3.org/TR/2013/CR-css-fonts-3-20131003/#property-index
      // https://www.w3.org/TR/2011/CR-css3-multicol-20110412#property-index
      // https://www.w3.org/TR/2015/CR-css-ui-3-20150707/#property-index
      // https://www.w3.org/TR/2013/WD-css3-transitions-20131119/#property-index
      // https://www.w3.org/TR/2013/WD-css3-animations-20130219/#property-index
      // https://www.w3.org/TR/2015/WD-css-flexbox-1-20150514/#property-index
      // https://www.w3.org/TR/2013/WD-css-transforms-1-20131126/#property-index
      // https://www.w3.org/TR/2012/CR-css3-speech-20120320/#property-index
      // https://www.w3.org/TR/2014/CR-css-shapes-1-20140320/#property-index
      // https://www.w3.org/TR/2013/CR-css-text-decor-3-20130801/

      // https://drafts.csswg.org/css-will-change/#property-index
      // https://www.w3.org/TR/2011/REC-SVG11-20110816/propidx.html
      // https://drafts.csswg.org/css-text-3/#property-index (2 February 2016)
      properties: [
        'all', // css cascade 3
        'content', // css2
        'counter-increment', // css2
        'counter-reset', // css2
        'will-change' // css will change 1
      ]
    }, {
      properties: [
        'clear', // css2
        'float', // css2
        'position', // css2
        'top', // css2
        'right', // css2
        'bottom', // css2
        'left' // css2
      ],
      emptyLineBefore: true
    }, {
      properties: [
        'align-items', // css flex box 1
        'align-self', // css flex box 1
        'align-content', // css flex box 1
        'border', // css background 3
        'border-color', // css background 3
        'border-collapse', // css background 3
        'border-spacing', // css background 3
        'border-style', // css background 3
        'border-width', // css background 3
        'border-top', // css background 3
        'border-top-color', // css background 3
        'border-top-style', // css background 3
        'border-top-width', // css background 3
        'border-right', // css background 3
        'border-right-color', // css background 3
        'border-right-style', // css background 3
        'border-right-width', // css background 3
        'border-bottom', // css background 3
        'border-bottom-color', // css background 3
        'border-bottom-style', // css background 3
        'border-bottom-width', // css background 3
        'border-left', // css background 3
        'border-left-color', // css background 3
        'border-left-style', // css background 3
        'border-left-width', // css background 3
        'box-sizing', // css ui 3
        'display', // css2
        'flex', // css flex box 1
        'flex-basis', // css flex box 1
        'flex-direction', // css flex box 1
        'flex-flow', // css flex box 1
        'flex-grow', // css flex box 1
        'flex-shrink', // css flex box 1
        'flex-wrap', // css flex box 1
        'height', // css2
        'justify-content', // css flex box 1
        'min-height', // css2
        'max-height', // css2
        'margin', // css2
        'margin-top', // css2
        'margin-right', // css2
        'margin-bottom', // css2
        'margin-left', // css2
        'order', // css flex box 1
        'overflow', // css2
        'padding', // css2
        'padding-top', // css2
        'padding-right', // css2
        'padding-bottom', // css2
        'padding-left', // css2
        'shape-image-threshold', // css shape 1
        'shape-outside', // css shape 1
        'shape-margin', // css shape 1
        'width', // css2
        'min-width', // css2
        'max-width' // css2
      ],
      emptyLineBefore: true
    }, {
      properties: [
        'caret-color', // css ui 3
        'color', // css color 3
        'direction', // css2
        'font', // css font 3
        'font-family', // css font 3
        'font-feature-settings', // css font 3
        'font-kerning', // css font 3
        'font-language-override', // css font 3
        'font-size', // css font 3
        'font-size-adjust', // css font 3
        'font-stretch', // css font 3
        'font-style', // css font 3
        'font-synthesis', // css font 3
        'font-variant', // css font 3
        'font-variant-alternates', // css font 3
        'font-variant-caps', // css font 3
        'font-variant-east-asian', // css font 3
        'font-variant-ligatures', // css font 3
        'font-variant-numeric', // css font 3
        'font-variant-position', // css font 3
        'font-weight', // css font 3
        'hanging-punctuation', // css test 3
        'hyphens', // css test 3
        'letter-spacing', // css test 3
        'line-break', // css test 3
        'line-height', // css2
        'orphans', // css2
        'overflow-wrap', // css test 3
        'quotes',  // css2
        'tab-size', // css test 3
        'text-align', // css test 3
        'text-align-all', // css test 3
        'text-align-last', // css test 3
        'text-decoration', // css text decorator 3
        'text-decoration-color', // css text decorator 3
        'text-decoration-line', // css text decorator 3
        'text-decoration-skip', // css text decorator 3
        'text-decoration-style', // css text decorator 3
        'text-emphasis', // css text decorator 3
        'text-emphasis-color', // css text decorator 3
        'text-emphasis-style', // css text decorator 3
        'text-emphasis-position', // css text decorator 3
        'text-indent', // css test 3
        'text-justify', // css test 3
        'text-overflow', // css ui 3
        'text-shadow', // css text decorator 3
        'text-transform', // css test 3
        'text-underline-position', // css text decorator 3
        'unicode-bidi',  // css2
        'white-space', // css test 3
        'widows', //css2
        'word-break', // css test 3
        'word-spacing', // css test 3
        'word-wrap' // css test 3
      ],
      emptyLineBefore: true
    }, {
      properties: [
        'cue', // css speech 1
        'cue-before', // css speech 1
        'cue-after', // css speech 1
        'pause', // css speech 1
        'pause-before', // css speech 1
        'pause-after', // css speech 1
        'rest', // css speech 1
        'rest-before', // css speech 1
        'rest-after', // css speech 1
        'speak', // css speech 1
        'speak-as', // css speech 1
        'voice-balance', // css speech 1
        'voice-duration', // css speech 1
        'voice-family', // css speech 1
        'voice-pitch', // css speech 1
        'voice-rance', // css speech 1
        'voice-rate', // css speech 1
        'voice-stress', // css speech 1
        'voice-volume' // css speech 1
      ],
      emptyLineBefore: true
    }, {
      properties: [
        'animation', // css animation 1
        'animation-delay', // css animation 1
        'animation-direction', // css animation 1
        'animation-duration', // css animation 1
        'animation-fill-mode', // css animation 1
        'animation-iteration-count', // css animation 1
        'animation-name', // css animation 1
        'animation-play-state', // css animation 1
        'animation-timing-function', // css animation 1
        'appearance', // css ui 4
        'backface-visibility', // css transform 1
        'background', // css background 3
        'background-attachment', // css background 3
        'background-clip', // css background 3
        'background-color', // css background 3
        'background-image', // css background 3
        'background-origin', // css background 3
        'background-position', // css background 3
        'background-repeat', // css background 3
        'background-size', // css background 3
        'border-image', // css background 3
        'border-image-outset', // css background 3
        'border-image-repeat', // css background 3
        'border-image-slice', // css background 3
        'border-image-source', // css background 3
        'border-image-width', // css background 3
        'border-radius', // css background 3
        'border-top-left-radius', // css background 3
        'border-top-right-radius', // css background 3
        'border-bottom-right-radius', // css background 3
        'border-bottom-left-radius', // css background 3
        'box-shadow', // css background 3
        'break-before', // css multi-column 1
        'break-after', // css multi-column 1
        'break-inside', // css multi-column 1
        'caption-side', // css2
        'clip', // css masking 1
        'clip-path', // css masking 1
        'clip-rule', // css masking 1
        'column-count', // css multi-column 1
        'column-fill', // css multi-column 1
        'column-gap', // css multi-column 1
        'column-rule', // css multi-column 1
        'column-rule-color', // css multi-column 1
        'column-rule-style', // css multi-column 1
        'column-rule-width', // css multi-column 1
        'columns', // css multi-column 1
        'columns-span', // css multi-column 1
        'columns-width', // css multi-column 1
        'cursor', // css ui 3
        'empty-cells', // css2
        'image-orientation', // css images 3
        'image-resolution', // css images 3
        'list-style', // css2
        'list-style-image', // css2
        'list-style-position', // css2
        'list-style-type', // css2
        'mask', // css masking 1
        'mask-border', // css masking 1
        'mask-border-mode', // css masking 1
        'mask-border-outset', // css masking 1
        'mask-border-repeat', // css masking 1
        'mask-border-slice', // css masking 1
        'mask-border-width', // css masking 1
        'mask-clip', // css masking 1
        'mask-composite', // css masking 1
        'mask-image', // css masking 1
        'mask-mode', // css masking 1
        'mask-origin', // css masking 1
        'mask-position', // css masking 1
        'mask-repeat', // css masking 1
        'mask-size', // css masking 1
        'mask-type', // css masking 1
        'nav-up', // css ui 3
        'nav-right', // css ui 3
        'nav-down', // css ui 3
        'nav-left', // css ui 3
        'object-fit', // css images 3
        'object-position', // css images 3
        'opacity', // css color 3
        'outline', // css ui 3
        'outline-color', // css ui 3
        'outline-offset', // css ui 3
        'outline-style', // css ui 3
        'outline-width', // css ui 3
        'page-break-before', // css2
        'page-break-after', // css2
        'page-break-inside', // css2
        'perspective', // css transform 1
        'perspective-origin', // css transform 1
        'resize', // css ui 3
        'table-layout', // css2
        'transform', // css transform 1
        'transform-origin', // css transform 1
        'transform-style', // css transform 1
        'transition', // css transition 1
        'transition-delay', // css transition 1
        'transition-duration', // css transition 1
        'transition-property', // css transition 1
        'transition-timing-function', // css transition 1
        'vertical-align', // css2
        'visibility', //css2
        'z-index' //css2
      ],
      emptyLineBefore: true
    }], {
      unspecified: 'bottom'
    }],
    'rule-trailing-semicolon': 'always',
    'selector-combinator-space-after': 'always',
    'selector-combinator-space-before': 'always',
    'selector-list-comma-newline-after': 'always',
    'selector-list-comma-space-before': 'never',
    'selector-pseudo-element-colon-notation': 'double',
    'string-quotes': 'single',
    'unit-blacklist': ['cm', 'mm', 'q', 'in', 'pc', 'pt'],
    'value-list-comma-newline-after': 'always-multi-line',
    'value-list-comma-space-after': 'always-single-line',
    'value-list-comma-space-before': 'never',
    'value-no-vendor-prefix': true
  }
};
