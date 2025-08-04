declare global {
  namespace NodeJS {
    interface Timeout {
      _id: number
    }
  }
}

export {}