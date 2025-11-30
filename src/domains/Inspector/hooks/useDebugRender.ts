import { useEffect, useRef } from 'react'
import { generateId, getStackTrace, isDev } from 'shared/lib/utils'
import { useInspectorStore } from '../model/store'

export function useDebugRender(
	componentName: string,
	props?: Record<string, any>
) {
	if (!isDev) return

	const count = useRef(0)
	const prevProps = useRef<Record<string, any> | undefined>(props)
	const isMounted = useRef(false)

	useEffect(() => {
		if (!isMounted.current) {
			isMounted.current = true
			count.current = 1

			useInspectorStore.getState().add({
				id: generateId(),
				type: 'render',
				timestamp: Date.now(),
				trace: getStackTrace(),
				componentName,
				count: 1,
				message: 'mount',
				props: props,
			})
			return
		}

		count.current += 1

		const changes: string[] = []
		if (props && prevProps.current) {
			Object.keys({ ...props, ...prevProps.current }).forEach(key => {
				if (props[key] !== prevProps.current![key]) {
					changes.push(
						`${key}: ${typeof prevProps.current![key]} -> ${typeof props[key]}`
					)
				}
			})
		}
		prevProps.current = props

		useInspectorStore.getState().add({
			id: generateId(),
			type: 'render',
			timestamp: Date.now(),
			trace: '',
			componentName,
			count: count.current,
			message: `update ${
				changes.length ? `(${changes.join(', ')})` : '(State/Context)'
			}`,
			props: props,
		})

		return () => {
			useInspectorStore.getState().add({
				id: generateId(),
				type: 'render',
				timestamp: Date.now(),
				trace: '',
				componentName,
				count: count.current,
				message: 'unmount',
				props: props,
			})
		}
	})
}
