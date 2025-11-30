import { Bug } from 'lucide-react'
import { Portal } from 'shared/ui/Portal'
import { useInspectorStore } from '../model/store'

export const InspectorButton = () => {
	const { toggle, items } = useInspectorStore()

	return (
		<Portal>
			<div className='d-insp-reset'>
				<button onClick={toggle} className='d-insp-btn-root group'>
					{/* Glow effect behind */}
					<div className='d-insp-btn-glow' />

					<Bug size={28} />
					<span className='d-insp-btn-count'>{items.length}</span>
				</button>
			</div>
		</Portal>
	)
}
