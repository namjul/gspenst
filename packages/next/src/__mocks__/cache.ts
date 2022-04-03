/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument  */

export class Cache {
  cache: object | undefined

  async set(data?: object) {
    this.cache = data
  }
  async get(): Promise<any> {
    return this.cache
  }

  async flushall() {
    void this.set()
  }

  async hset(key: string, field: string, value: any) {
    const cache = await this.get()
    if (!cache[key]) {
      cache[key] = {}
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    cache[key]![field] = value
  }
  async hmget(key: string, ...fields: string[]) {
    const cache = await this.get()
    return Object.keys(cache[key] ?? {})
      .filter((field) => fields.includes(field))
      .map((field) => {
        return cache[key]?.[field]
      })
  }
  async hkeys(key: string) {
    const cache = await this.get()
    return Object.keys(cache[key] ?? {})
  }
}
