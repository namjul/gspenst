const redis = {
  cache: {} as Record<string, Record<string, any>>,
  async flushall() {
    this.cache = {}
    return 'OK'
  },
  async hset(key: string, field: string, value: any) {
    if (!this.cache[key]) {
      this.cache[key] = {}
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.cache[key]![field] = value
    return 1
  },
  async hmget(key: string, ...fields: string[]) {
    return (await this.hkeys(key))
      .filter((field) => fields.includes(field))
      .map((field) => {
        return this.cache[key]?.[field]
      })
  },
  async hkeys(key: string) {
    return Object.keys(this.cache[key] ?? {})
  },
}

export default redis
