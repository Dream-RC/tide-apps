export const isUrl = (path: string): boolean => {
    const reg =
        /(((^https?:(?:\/\/)?)(?:[-:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&%@.\w_]*)#?(?:[\w]*))?)$/
    return reg.test(path)
}

export const is = (val: unknown, type: string) => {
    return toString.call(val) === `[object ${type}]`
}

export const isNumber = (val: unknown): val is number => {
    return is(val, 'Number')
}

export const isEmpty = (val: any): boolean => {
    if (val === null || val === undefined || typeof val === 'undefined') {
        return true
    }
    if (isArray(val) || isString(val)) {
        return val.length === 0
    }

    if (val instanceof Map || val instanceof Set) {
        return val.size === 0
    }

    if (isObject(val)) {
        return Object.keys(val).length === 0
    }

    return false
}

export const isArray = (val: any): val is Array<any> => {
    return val && Array.isArray(val)
}
export const isString = (val: unknown): val is string => {
    return is(val, 'String')
}
export const isObject = (val: any): val is Record<any, any> => {
    return val !== null && is(val, 'Object')
}

export const isDark = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
