import { inspectorService } from 'domains/Inspector/lib/interceptor'
import { useInspectorStore } from 'domains/Inspector/model/store'
import { InspectorButton } from 'domains/Inspector/ui/InspectorButton'
import React, { Suspense, useEffect } from 'react'
import { isDev } from 'shared/lib/utils'
import '../../styles/insp.css'

const InspectorModal = React.lazy(() =>
	import('domains/Inspector/ui/InspectorModal').then(module => ({
		default: module.InspectorModal,
	}))
)

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const isVisible = useInspectorStore(state => state.isVisible)

	useEffect(() => {
		inspectorService.initialize()
	}, [])

	if (!isDev) return <>{children}</>

	return (
		<>
			{children}
			<InspectorButton />
			{isVisible && (
				<Suspense fallback={null}>
					<InspectorModal />
				</Suspense>
			)}
		</>
	)
}
