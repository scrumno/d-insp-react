import { Bug, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Portal } from 'shared/ui/Portal' // Убедись, что путь корректен
import '../../../styles/insp.css'
import { useInspectorStore } from '../model/store'
import { DebugEntry, InspectorTab } from '../model/types'
import { DebugEntryItem } from './DebugEntryItem'

export const InspectorModal = () => {
	const { items, clear, toggle } = useInspectorStore()
	const [tab, setTab] = useState<InspectorTab>('all')
	const [search, setSearch] = useState('')

	const filteredItems = useMemo(() => {
		const regex = new RegExp(search, 'i')

		return items.filter((item: DebugEntry) => {
			if (tab !== 'all' && item.type !== tab) return false
			if (!search) return true

			let content = item.type

			if (item.type === 'fetch') {
				content += ` ${item.request.method} ${item.request.url} ${item.response.status}`
			} else if (item.type === 'render') {
				content += ` ${item.componentName} ${item.message}`
			} else if (item.type === 'value') {
				const valStr =
					typeof item.value === 'string'
						? item.value
						: JSON.stringify(item.value || {})
				content += ` ${valStr} ${item.label || ''}`
			}

			return regex.test(content)
		})
	}, [items, tab, search])

	return (
		<Portal>
			<div className='d-insp-reset d-overlay' onClick={toggle}>
				<div className='d-window' onClick={e => e.stopPropagation()}>
					{/* Header */}
					<div className='d-header'>
						<div className='d-flex d-items-center'>
							<div className='d-traffic-lights'>
								<div
									className='d-traffic-dot'
									style={{ background: '#ef4444' }}
								></div>
								<div
									className='d-traffic-dot'
									style={{ background: '#eab308' }}
								></div>
								<div
									className='d-traffic-dot'
									style={{ background: '#22c55e' }}
								></div>
							</div>

							<div className='d-divider-v'></div>

							<div className='d-tabs'>
								{(['all', 'fetch', 'render', 'value'] as const).map(t => (
									<button
										key={t}
										onClick={() => setTab(t)}
										className={`d-tab-btn ${tab === t ? 'active' : ''}`}
									>
										{t}
									</button>
								))}
							</div>
						</div>

						<div className='d-flex d-items-center d-gap-2'>
							<input
								value={search}
								onChange={e => setSearch(e.target.value)}
								placeholder='Filter logs...'
								className='d-search-input'
							/>
							<div
								className='d-divider-v'
								style={{ height: '16px', margin: '0 4px' }}
							></div>
							<button
								onClick={clear}
								className='d-icon-btn danger'
								title='Clear'
							>
								<Trash2 size={16} />
							</button>
							<button onClick={toggle} className='d-icon-btn' title='Close'>
								<X size={18} />
							</button>
						</div>
					</div>

					{/* List */}
					<div className='d-list d-scroll'>
						{filteredItems.length === 0 ? (
							<div className='d-empty-state'>
								<div className='d-empty-icon'>
									<Bug size={48} />
								</div>
								<span>No events captured</span>
							</div>
						) : (
							filteredItems.map(item => (
								<DebugEntryItem key={item.id} entry={item} />
							))
						)}
					</div>

					{/* Footer */}
					<div className='d-footer'>
						<span>
							Events: <span className='d-footer-val'>{items.length}</span>
						</span>
						<span>
							Press <span className='d-key-hint'>ESC</span> to close
						</span>
					</div>
				</div>
			</div>
		</Portal>
	)
}
