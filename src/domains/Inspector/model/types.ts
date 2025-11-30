export type DebugEntryType = 'fetch' | 'value' | 'render'

export interface DebugBaseEntry {
	id: string
	timestamp: number
	trace: string
}

export interface DebugFetchRequest {
	readonly url: string
	readonly method: string
	readonly body?: unknown
	readonly headers?: Record<string, string>
}

export interface DebugFetchResponse {
	readonly status: number
	readonly statusText: string
	readonly body: unknown
}

export interface DebugFetchEntry extends DebugBaseEntry {
	readonly type: 'fetch'
	readonly request: DebugFetchRequest
	readonly response: DebugFetchResponse
	readonly duration: number
}

export interface DebugValueEntry extends DebugBaseEntry {
	readonly type: 'value'
	readonly value: unknown
	readonly label?: string
	readonly varName?: string
}

export interface DebugRenderEntry extends DebugBaseEntry {
	readonly type: 'render'
	readonly componentName: string
	readonly count: number
	readonly message: string
	props?: Record<string, any>
}

export type DebugEntry = DebugFetchEntry | DebugValueEntry | DebugRenderEntry
export type InspectorTab = 'all' | 'fetch' | 'value' | 'render'
