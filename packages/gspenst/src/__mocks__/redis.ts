const redis = {
  hashes: new Map<string, Map<string, string>>(),
  async flushall() {
    this.hashes.clear()
    return 'OK'
  },
  async hset(key: string, field: string, value: any) {
    if (!this.hashes.get(key)) {
      this.hashes.set(key, new Map())
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.hashes.get(key)?.set(field, value)
    return 1
  },
  async hmget(key: string, ...fields: string[]) {
    return fields.map((field) => {
      return (this.hashes.get(key) ?? new Map<string, string>()).get(field)
    })
  },
  async hkeys(key: string) {
    return [...(this.hashes.get(key) ?? new Map<string, string>()).keys()]
  },
}

export default redis
