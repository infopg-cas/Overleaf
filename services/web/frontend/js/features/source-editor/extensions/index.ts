import {
  EditorView,
  rectangularSelection,
  tooltips,
  crosshairCursor,
  dropCursor,
  highlightActiveLineGutter,
} from '@codemirror/view'
import { EditorState, Extension } from '@codemirror/state'
import { foldGutter, indentOnInput, indentUnit } from '@codemirror/language'
import { history } from '@codemirror/commands'
import { language } from './language'
import { lineWrappingIndentation } from './line-wrapping-indentation'
import { theme } from './theme'
import { realtime } from './realtime'
import { cursorPosition } from './cursor-position'
import { scrollPosition } from './scroll-position'
import { annotations } from './annotations'
import { cursorHighlights } from './cursor-highlights'
import { autoComplete } from './auto-complete'
import { editable } from './editable'
import { autoPair } from './auto-pair'
import { phrases } from './phrases'
import { spelling } from './spelling'
import { symbolPalette } from './symbol-palette'
import { trackChanges } from './track-changes'
import { search } from './search'
import { filterCharacters } from './filter-characters'
import { keybindings } from './keybindings'
import { bracketMatching, bracketSelection } from './bracket-matching'
import { verticalOverflow } from './vertical-overflow'
import { thirdPartyExtensions } from './third-party-extensions'
import { lineNumbers } from './line-numbers'
import { highlightActiveLine } from './highlight-active-line'
import importOverleafModules from '../../../../macros/import-overleaf-module.macro'
import { emptyLineFiller } from './empty-line-filler'
import { goToLinePanel } from './go-to-line'
import { drawSelection } from './draw-selection'
import { visual } from './visual/visual'
import { inlineBackground } from './inline-background'
import { indentationMarkers } from './indentation-markers'
import { codemirrorDevTools } from '../languages/latex/codemirror-dev-tools'
import { keymaps } from './keymaps'
import { shortcuts } from './shortcuts'
import { effectListeners } from './effect-listeners'
import { highlightSpecialChars } from './highlight-special-chars'
import { toolbarPanel } from './toolbar/toolbar-panel'
import { geometryChangeEvent } from './geometry-change-event'
import { docName } from './doc-name'
import { fileTreeItemDrop } from './file-tree-item-drop'

const moduleExtensions: Array<() => Extension> = importOverleafModules(
  'sourceEditorExtensions'
).map((item: { import: { extension: Extension } }) => item.import.extension)

export const createExtensions = (options: Record<string, any>): Extension[] => [
  lineNumbers(),
  highlightSpecialChars(options.visual.visual),
  // The built-in extension that manages the history stack,
  // configured to increase the maximum delay between adjacent grouped edits
  history({ newGroupDelay: 250 }),
  // The built-in extension that displays buttons for folding code in a gutter element,
  // configured with custom openText and closeText symbols.
  foldGutter({
    openText: '▾',
    closedText: '▸',
  }),
  drawSelection(),
  // A built-in facet that is set to true to allow multiple selections.
  // This makes the editor more like a code editor than Google Docs or Microsoft Word,
  // which only have single selections.
  EditorState.allowMultipleSelections.of(true),
  // A built-in extension that enables soft line wrapping.
  EditorView.lineWrapping,
  // A built-in extension that re-indents input if the language defines an indentOnInput field in its language data.
  indentOnInput(),
  lineWrappingIndentation(options.visual.visual),
  indentationMarkers(options.visual.visual),
  bracketMatching(),
  bracketSelection(),
  // A built-in extension that enables rectangular selections, created by dragging a new selection while holding down Alt.
  rectangularSelection(),
  // A built-in extension that turns the pointer into a crosshair while Alt is pressed.
  crosshairCursor(),
  // A built-in extension that shows where dragged content will be dropped.
  dropCursor(),
  // A built-in extension that is used for configuring tooltip behaviour,
  // configured so that the tooltip parent is the document body,
  // to avoid cutting off tooltips which overflow the editor.
  tooltips({
    parent: document.body,
  }),
  keymaps,
  goToLinePanel(),
  filterCharacters(),

  // NOTE: `autoComplete` needs to be before `keybindings` so that arrow key handling
  // in the autocomplete pop-up takes precedence over Vim/Emacs key bindings
  autoComplete(options.settings),

  // NOTE: `keybindings` needs to be before `language` so that Vim/Emacs bindings take
  // precedence over language-specific keyboard shortcuts
  keybindings(),

  docName(options.docName),

  // NOTE: `annotations` needs to be before `language`
  annotations(),
  language(options.docName, options.metadata, options.settings),
  indentUnit.of('    '), // 4 spaces
  theme(options.theme),
  realtime(options.currentDoc, options.handleError),
  cursorPosition(options.currentDoc),
  scrollPosition(options.currentDoc),
  cursorHighlights(),
  autoPair(options.settings),
  editable(),
  search(),
  phrases(options.phrases),
  spelling(options.spelling),
  shortcuts,
  symbolPalette(),
  // NOTE: `emptyLineFiller` needs to be before `trackChanges`,
  // so the decorations are added in the correct order.
  emptyLineFiller(),
  trackChanges(options.currentDoc, options.changeManager),
  visual(options.visual),
  toolbarPanel(),
  verticalOverflow(),
  highlightActiveLine(options.visual.visual),
  // The built-in extension that highlights the active line in the gutter.
  highlightActiveLineGutter(),
  inlineBackground(options.visual.visual),
  codemirrorDevTools(),
  // Send exceptions to Sentry
  EditorView.exceptionSink.of(options.handleException),
  // CodeMirror extensions provided by modules
  moduleExtensions.map(extension => extension()),
  thirdPartyExtensions(),
  effectListeners(),
  geometryChangeEvent(),
  fileTreeItemDrop(),
  EditorView.updateListener.of(update => {
    if (update.docChanged) {
      const changes = update.changes;
      const cursorPos = update.state.selection.main.head;
  
      const insertedText = update.state.sliceDoc(cursorPos - 1, cursorPos);
      
      if (insertedText === '/') {
        console.log('Backslash detected at position:', cursorPos);
        showPopupAtPosition(cursorPos);
      }
    }
  })
]

function showPopupAtPosition(position: number) {
  const popup = document.createElement('div');
  popup.textContent = '测试弹框内容';
  popup.style.position = 'absolute';
  popup.style.background = 'lightcyan';
  popup.style.border = '1px solid grey';
  popup.style.borderRadius = '4px';
  popup.style.padding = '20px';
  
  popup.style.left = `${position}px`;
  popup.style.top = '50%';

  document.body.appendChild(popup);

  setTimeout(() => {
    document.body.removeChild(popup);
  }, 3000); // 3秒后自动关闭弹框
}