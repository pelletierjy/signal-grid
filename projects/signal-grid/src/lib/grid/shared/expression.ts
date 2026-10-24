import type { FormGroup } from '@angular/forms';

/**
 * Context available to Formly-style column expressions.
 *
 * A schema can express per-row dynamics as plain strings instead of callbacks:
 *
 * ```jsonc
 * {
 *   "field": "name",
 *   "expressions": {
 *     "type": "formGroup.get('isActive').value ? 'status-badge' : 'string'",
 *     "editable": "index % 2 === 0"
 *   }
 * }
 * ```
 *
 * SECURITY: expressions are compiled with `new Function` — the same trust model
 * as @ngx-formly. Column schemas are configuration-as-code: only load
 * expression-bearing schemas from sources you trust (your own repo, your own
 * backend), never from user input.
 */
export interface ExpressionContext {
  /** The row's current values (row form group raw values when available). */
  row: Record<string, unknown>;
  /** The current cell value. */
  value: unknown;
  /** The row index. */
  index: number;
  /** The column field name. */
  field: string;
  /** The row's form group — read other fields with `formGroup.get('otherField').value`. */
  formGroup: FormGroup | null | undefined;
}

type ExpressionFn = (
  row: Record<string, unknown>,
  value: unknown,
  index: number,
  field: string,
  formGroup: FormGroup | null | undefined
) => unknown;

/** Compiled once per distinct source string. */
const compiled = new Map<string, ExpressionFn | null>();

const warned = new Set<string>();

function warnOnce(key: string, message: string, error?: unknown): void {
  if (warned.has(key)) {
    return;
  }
  warned.add(key);
  console.warn(message, error ?? '');
}

/**
 * Evaluates a column expression against the row context.
 * Returns `undefined` on syntax errors or runtime throws (logged once), so a
 * broken expression degrades to the column's static value instead of killing
 * the grid render — mirroring Formly's behaviour.
 */
export function evaluateExpression<T = unknown>(
  source: string,
  context: ExpressionContext
): T | undefined {
  let fn = compiled.get(source);
  if (fn === undefined) {
    try {
      // eslint-disable-next-line no-new-func -- configuration-as-code, same model as @ngx-formly
      fn = new Function(
        'row',
        'value',
        'index',
        'field',
        'formGroup',
        `"use strict"; return (${source});`
      ) as ExpressionFn;
    } catch (error) {
      fn = null;
      warnOnce(
        `syntax:${source}`,
        `signal-grid: invalid column expression "${source}" — falling back to static values.`,
        error
      );
    }
    compiled.set(source, fn);
  }
  if (!fn) {
    return undefined;
  }
  try {
    return fn(context.row, context.value, context.index, context.field, context.formGroup) as T;
  } catch (error) {
    warnOnce(
      `throw:${source}`,
      `signal-grid: column expression "${source}" threw — falling back to static values.`,
      error
    );
    return undefined;
  }
}
