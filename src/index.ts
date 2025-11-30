export { DebugProvider } from './app/providers/DebugProvider'
export { useDebugRender } from './domains/Inspector/hooks/useDebugRender'
export type {
	DebugEntry,
	DebugFetchEntry,
} from './domains/Inspector/model/types'

declare global {
	interface Window {
		__d_insp_initialized?: boolean

		d: <T>(value: T | Promise<T>) => T | Promise<T>

		useDebugRender: (componentName: string, props?: Record<string, any>) => void
	}

	interface XMLHttpRequest {
		_debug?: {
			method: string
			url: string
			startTime: number
			trace: string
			timestamp: number
			reqBody?: any
		}
	}

	/**
	 * Logs a value or a promise to the Inspector.
	 * Returns the value (pass-through).
	 */
	var d: <T>(value: T | Promise<T>) => T | Promise<T>

	/**
	 * Hooks into a component to track its render count.
	 * @param componentName Unique identifier for the component
	 * @param props Optional object to track prop changes (diff)
	 */
	var useDebugRender: (
		componentName: string,
		props?: Record<string, any>
	) => void
}
