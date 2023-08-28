export const bind1st = <TArg1, TOthers extends unknown[], TResult>(arg1: TArg1, func: (arg1: TArg1, ...args: TOthers) => TResult) => (...args: TOthers): TResult => func(arg1, ...args)

export const bind2nd = <TArg1, TArg2, TOthers extends unknown[], TResult>(arg2: TArg2, func: (arg1: TArg1, arg2: TArg2, ...args: TOthers) => TResult) => (arg1: TArg1, ...args: TOthers): TResult => func(arg1, arg2, ...args)

export const bind3rd = <TArg1, TArg2, TArg3, TOthers extends unknown[], TResult>(arg3: TArg3, func: (arg1: TArg1, arg2: TArg2, arg3: TArg3, ...args: TOthers) => TResult) => (arg1: TArg1, arg2: TArg2, ...args: TOthers): TResult => func(arg1, arg2, arg3, ...args)
