const doNothing = () => {
}

export const findInLowerCase = <E, T extends { [id: number | string]: number | string }>(enumType: T, name?: string): E => {
  const lower = name?.toLowerCase()
  const map = mapInLowerCase(enumType)
  const id = lower in map ? map[lower] : undefined
  return enumType[id] as unknown as E
}

const mapInLowerCase = <T extends { [id: number | string]: number | string }>(enumType: T): Record<string, number> => {
  const values = selectByTypeName(enumType, 'number')
  const map = {} as Record<string, number>
  let index = 0 as number
  for (const name of selectByTypeName(enumType, 'string'))
    map[name.toLowerCase()] = values[index++]
  return map
}

function selectByTypeName<T extends { [id: number | string]: number | string }>(type: T, typeName: 'number'): number[]
function selectByTypeName<T extends { [id: number | string]: number | string }>(type: T, typeName: 'string'): string[]
function selectByTypeName<T extends { [id: number | string]: number | string }>(type: T, typeName: 'number' | 'string'): number[] | string[] {
  const list = [] as unknown[]
  const push = Array.prototype.push.bind(list)
  const functions = [doNothing, push]
  for (const value in type)
    functions[+(typeof value === typeName)](value)
  return list as number[] | string[]
}
