const main = async (): Promise<void> => console.log(await valueAsync(123))

const valueAsync = <T>(value: T): Promise<T> => new Promise((resolve: (value: T) => void) => setImmediate(() => resolve(value)))

main()
