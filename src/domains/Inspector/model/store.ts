import { BATCH_DELAY, MAX_BATCH_SIZE, MAX_ITEMS } from 'shared/config'
import { create } from 'zustand'
import { DebugEntry } from './types'

interface InspectorState {
	items: DebugEntry[]
	isVisible: boolean

	add: (entry: DebugEntry) => void
	clear: () => void
	toggle: () => void
	setIsVisible: (visible: boolean) => void
}

type SetState = (
	partial: InspectorState | ((state: InspectorState) => Partial<InspectorState>)
) => void

let renderBatch: DebugEntry[] = []
let batchTimeout: ReturnType<typeof setTimeout> | null = null

const appendWithLimit = (
	currentItems: DebugEntry[],
	newItems: DebugEntry[]
) => {
	const result = [...currentItems, ...newItems]
	if (result.length > MAX_ITEMS) {
		return result.slice(-MAX_ITEMS)
	}
	return result
}

const flushBatch = (set: SetState) => {
	if (batchTimeout) {
		clearTimeout(batchTimeout)
		batchTimeout = null
	}

	if (renderBatch.length === 0) return

	const batchToProcess = [...renderBatch]
	renderBatch = []

	set(state => ({
		items: appendWithLimit(state.items, batchToProcess),
	}))
}

export const useInspectorStore = create<InspectorState>((set, get) => ({
	items: [],
	isVisible: false,

	add: entry => {
		if (entry.type === 'render') {
			renderBatch.push(entry)

			if (renderBatch.length >= MAX_BATCH_SIZE) {
				flushBatch(set)
				return
			}

			if (!batchTimeout) {
				batchTimeout = setTimeout(() => {
					flushBatch(set)
				}, BATCH_DELAY)
			}
			return
		}

		set(state => ({
			items: appendWithLimit(state.items, [entry]),
		}))
	},

	clear: () => {
		renderBatch = []
		if (batchTimeout) {
			clearTimeout(batchTimeout)
			batchTimeout = null
		}
		set({ items: [] })
	},

	toggle: () => set(state => ({ isVisible: !state.isVisible })),

	setIsVisible: visible => set({ isVisible: visible }),
}))
