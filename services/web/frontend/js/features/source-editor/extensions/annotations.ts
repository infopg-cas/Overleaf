import { EditorView, ViewUpdate } from '@codemirror/view'
import { Diagnostic, linter, lintGutter } from '@codemirror/lint'
import {
  Compartment,
  Extension,
  RangeSet,
  RangeValue,
  StateEffect,
  StateField,
  Text,
} from '@codemirror/state'
import { Annotation } from '../../../../../types/annotation'
import { debugConsole } from '@/utils/debugging'
import { sendMB } from '@/infrastructure/event-tracking'
import importOverleafModules from '../../../../macros/import-overleaf-module.macro'

interface CompileLogDiagnostic extends Diagnostic {
  compile?: true
  ruleId?: string
  id?: string
  entryIndex: number
  firstOnLine?: boolean
}

type RenderedDiagnostic = Pick<
  CompileLogDiagnostic,
  | 'message'
  | 'severity'
  | 'ruleId'
  | 'compile'
  | 'source'
  | 'id'
  | 'firstOnLine'
>

export type DiagnosticAction = (
  diagnostic: RenderedDiagnostic
) => HTMLButtonElement | null

const diagnosticActions = importOverleafModules('diagnosticActions') as {
  import: { default: DiagnosticAction }
}[]

const compileLintSourceConf = new Compartment()

export const annotations = () => [
  compileDiagnosticsState,
  compileLintSourceConf.of(compileLogLintSource()),
  /**
   * The built-in lint gutter extension, configured with zero hover delay.
   */
  lintGutter({
    hoverTime: 0,
  }),
  annotationsTheme,
]

/**
 * A theme which moves the lint gutter outside the line numbers.
 */
const annotationsTheme = EditorView.baseTheme({
  '.cm-gutter-lint': {
    order: -1,
  },
})

export const lintSourceConfig = {
  delay: 100,
  // Show highlights only for errors
  markerFilter(diagnostics: readonly Diagnostic[]) {
    return diagnostics.filter(d => d.severity === 'error')
  },
  // Do not show any tooltips for highlights within the editor content
  tooltipFilter() {
    return []
  },
  needsRefresh(update: ViewUpdate) {
    return update.selectionSet
  },
}

/**
 * A lint source using the compile log diagnostics
 */
const compileLogLintSource = (): Extension =>
  linter(view => {
    const items: CompileLogDiagnostic[] = []
    // NOTE: iter() changes the order of diagnostics on the same line
    const cursor = view.state.field(compileDiagnosticsState).iter()
    while (cursor.value !== null) {
      const { diagnostic } = cursor.value
      items.push({
        ...diagnostic,
        from: cursor.from,
        to: cursor.to,
        renderMessage: () => renderMessage(diagnostic),
      })
      cursor.next()
    }
    // restore the original order of items
    items.sort((a, b) => a.from - b.from || a.entryIndex - b.entryIndex)
    return items
  }, lintSourceConfig)

class CompileLogDiagnosticRangeValue extends RangeValue {
  constructor(public diagnostic: CompileLogDiagnostic) {
    super()
  }
}

const setCompileDiagnosticsEffect = StateEffect.define<CompileLogDiagnostic[]>()

/**
 * A state field for the compile log diagnostics
 */
export const compileDiagnosticsState = StateField.define<
  RangeSet<CompileLogDiagnosticRangeValue>
>({
  create() {
    return RangeSet.empty
  },
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setCompileDiagnosticsEffect)) {
        return RangeSet.of(
          effect.value.map(diagnostic =>
            new CompileLogDiagnosticRangeValue(diagnostic).range(
              diagnostic.from,
              diagnostic.to
            )
          ),
          true
        )
      }
    }

    if (transaction.docChanged) {
      value = value.map(transaction.changes)
    }

    return value
  },
})

export const setAnnotations = (doc: Text, annotations: Annotation[]) => {
  const diagnostics: CompileLogDiagnostic[] = []

  for (const annotation of annotations) {
    // ignore "whole document" (row: -1) annotations
    if (annotation.row !== -1) {
      try {
        diagnostics.push(convertAnnotationToDiagnostic(doc, annotation))
      } catch (error) {
        // ignore invalid annotations
        debugConsole.debug('invalid annotation position', error)
      }
    }
  }

  return {
    effects: setCompileDiagnosticsEffect.of(diagnostics),
  }
}

export const showCompileLogDiagnostics = (show: boolean) => {
  return {
    effects: [
      // reconfigure the compile log lint source
      compileLintSourceConf.reconfigure(show ? compileLogLintSource() : []),
    ],
  }
}

const convertAnnotationToDiagnostic = (
  doc: Text,
  annotation: Annotation
): CompileLogDiagnostic => {
  if (annotation.row < 0) {
    throw new Error(`Invalid annotation row ${annotation.row}`)
  }

  const line = doc.line(annotation.row + 1)

  return {
    from: line.from,
    to: line.to, // NOTE: highlight whole line as synctex doesn't output column number
    severity: annotation.type,
    message: annotation.text,
    ruleId: annotation.ruleId,
    compile: true,
    id: annotation.id,
    entryIndex: annotation.entryIndex,
    source: annotation.source,
    firstOnLine: annotation.firstOnLine,
  }
}

export const renderMessage = (diagnostic: RenderedDiagnostic) => {
  const { message, severity, ruleId, compile = false } = diagnostic

  const div = document.createElement('div')
  div.classList.add('ol-cm-diagnostic-message')

  div.append(message)

  const activeDiagnosticActions = diagnosticActions
    .map(m => m.import.default(diagnostic))
    .filter(Boolean) as HTMLButtonElement[]

  if (activeDiagnosticActions.length) {
    const actions = document.createElement('div')
    actions.classList.add('ol-cm-diagnostic-actions')
    actions.append(...activeDiagnosticActions)
    div.append(actions)
  }

  window.setTimeout(() => {
    if (div.isConnected) {
      sendMB('lint-gutter-marker-view', { severity, ruleId, compile })
    }
  }, 500) // 500ms delay to indicate intention, rather than accidental hover

  return div
}
