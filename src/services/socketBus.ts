type EventCallback = (payload: unknown) => void

class SocketEventBus {
  private listeners = new Map<string, Set<EventCallback>>()

  on(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    const callbacks = this.listeners.get(eventType)!
    callbacks.add(callback)

    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  emit(typeName: string, data: unknown) {
    const callbacks = this.listeners.get(typeName)
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data)
        } catch (e) {
          console.error(`Error processing socket event '${typeName}':`, e)
        }
      })
    }
  }
}

export const socketBus = new SocketEventBus()
