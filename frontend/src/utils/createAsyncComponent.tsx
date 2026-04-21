import {
  createElement,
  startTransition,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode
} from "react"

type Loader<TModule> = () => Promise<TModule>

type AsyncComponentProps<TProps> = TProps & {
  loadingFallback?: ReactNode
}

type AsyncComponentState<TProps> = {
  component: ComponentType<TProps> | null
  error: unknown
  promise: Promise<void> | null
}

const asyncComponentCache = new WeakMap<
  Loader<unknown>,
  AsyncComponentState<unknown>
>()

function getCachedState<TProps>(
  loader: Loader<unknown>
): AsyncComponentState<TProps> {
  const existing = asyncComponentCache.get(loader)
  if (existing) {
    return existing as AsyncComponentState<TProps>
  }

  const state: AsyncComponentState<TProps> = {
    component: null,
    error: null,
    promise: null
  }

  asyncComponentCache.set(loader, state as AsyncComponentState<unknown>)
  return state
}

export function createAsyncComponent<TProps, TModule>(
  loader: Loader<TModule>,
  selector: (module: TModule) => ComponentType<TProps>
): ComponentType<AsyncComponentProps<TProps>> {
  const cachedState = getCachedState<TProps>(loader as Loader<unknown>)

  const load = async () => {
    if (cachedState.component || cachedState.promise) {
      return cachedState.promise ?? Promise.resolve()
    }

    cachedState.promise = loader()
      .then((module) => {
        cachedState.component = selector(module)
        cachedState.error = null
      })
      .catch((error: unknown) => {
        cachedState.error = error
      })
      .finally(() => {
        cachedState.promise = null
      })

    return cachedState.promise
  }

  function AsyncComponent({
    loadingFallback,
    ...props
  }: AsyncComponentProps<TProps>) {
    const [loadedComponent, setLoadedComponent] =
      useState<ComponentType<TProps> | null>(() => cachedState.component)

    useEffect(() => {
      let isMounted = true

      if (cachedState.component) {
        setLoadedComponent(() => cachedState.component)
        return
      }

      void load().then(() => {
        if (!isMounted || !cachedState.component) {
          return
        }

        startTransition(() => {
          setLoadedComponent(() => cachedState.component)
        })
      })

      return () => {
        isMounted = false
      }
    }, [])

    if (cachedState.error) {
      console.error("Failed to load async component:", cachedState.error)
      return <>{loadingFallback ?? null}</>
    }

    if (!loadedComponent) {
      return <>{loadingFallback ?? null}</>
    }

    return createElement(
      loadedComponent as ComponentType<Record<string, unknown>>,
      props as Record<string, unknown>
    )
  }

  return AsyncComponent
}
