// utils.ts
export function createEmptyStructure<T>(): Partial<Record<keyof T, unknown>> {
    const result: Partial<Record<keyof T, unknown>> = {};
    for (const key in ({} as T)) {
      result[key] = undefined;
    }
    return result;
  }