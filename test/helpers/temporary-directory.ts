import { EventEmitter } from 'events'

import {
  join as joinPath,
} from 'path'

import {
  mkdirSync,
  mkdtempSync,
  rmdirSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'fs'

type PathOrPrefix = {
  path: string
} | {
  prefix: string
}

export class TemporaryDirectory implements Disposable {
  static make(opts: TemporaryDirectoryOptions): TemporaryDirectory {
    return new TemporaryDirectory(opts)
  }

  private readonly emitter = new EventEmitter()
  private readonly list = new Set<string>()
  private readonly parents = new WeakMap<TemporaryDirectory, TemporaryDirectory>()
  readonly path: string

  constructor(opts: TemporaryDirectoryOptions) {
    if (opts.parent)
      this.parents.set(this, opts.parent)
    if ('path' in opts) {
      mkdirSync(opts.path)
      this.path = opts.path
    }
    else
      this.path = mkdtempSync(opts.prefix)
  }

  mkdirSync(name: string): TemporaryDirectory {
    return TemporaryDirectory.make({ parent: this, path: joinPath(this.path, name) })
  }

  on(event: TemporaryDirectoryEvent, listener: () => void): void {
    this.emitter.on(event, listener)
  }

  symlinkSync(target: string, path: string): void {
    const full = joinPath(this.path, path)
    symlinkSync(target, full)
    this.list.add(full)
  }

  writeFileSync(name: string, data: string): void {
    const full = joinPath(this.path, name)
    writeFileSync(full, data)
    this.list.add(full)
  }

  [Symbol.dispose](): void {
    if (this.parents.has(this)) {
      const parent = this.parents.get(this)
      this.parents.delete(this)
      parent?.on('disposing', () => this[Symbol.dispose]())
      return
    }
    this.emitter.emit('disposing')
    for (const path of this.list)
      unlinkSync(path)
    rmdirSync(this.path)
    this.emitter.emit('disposed')
  }
}

type TemporaryDirectoryEvent = 'disposing' | 'disposed'

type TemporaryDirectoryOptions = PathOrPrefix & {
  parent?: TemporaryDirectory
}
