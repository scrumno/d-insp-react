import { MAX_BODY_SIZE, SKIP_URLS } from 'shared/config'
import {
	generateId,
	getStackTrace,
	isDev,
	safeParseBody,
} from 'shared/lib/utils'
import { useDebugRender } from '../hooks/useDebugRender'
import { useInspectorStore } from '../model/store'

let initialized = false

export const inspectorService = {
	initialize: () => {
		if (typeof window === 'undefined' || initialized) return

		if (!isDev) {
			const win = window as any
			if (!win.d) win.d = <T>(v: T) => v
			if (!win.useDebugRender) win.useDebugRender = () => {}
			initialized = true
			return
		}

		try {
			patchD()

			// @ts-ignore
			window.useDebugRender = useDebugRender

			patchFetch()
			patchXHR()
		} catch (e) {
			console.error('Инициализация словила ошибку', e)
		}

		initialized = true
	},
}

function patchFetch() {
	const originalFetch = window.fetch

	window.fetch = async (...args) => {
		const startTime = Date.now()
		const trace = getStackTrace()

		const [resource, config] = args
		const url =
			typeof resource === 'string'
				? resource
				: resource instanceof Request
				? resource.url
				: ''

		if (SKIP_URLS.some(u => url.includes(u))) {
			return originalFetch(...args)
		}

		const method =
			config?.method || (resource instanceof Request ? resource.method : 'GET')
		const reqBody = safeParseBody(config?.body)

		const reqHeaders: Record<string, string> = {}
		if (config?.headers) {
			new Headers(config.headers).forEach((v, k) => (reqHeaders[k] = v))
		}

		let status = 0
		let statusText = ''
		let resBody: any = null
		let response: Response

		try {
			response = await originalFetch(...args)
			status = response.status
			statusText = response.statusText
		} catch (err) {
			const duration = Date.now() - startTime
			useInspectorStore.getState().add({
				id: generateId(),
				type: 'fetch',
				timestamp: startTime,
				duration,
				trace,
				request: { url, method, body: reqBody, headers: reqHeaders },
				response: {
					status: 0,
					statusText: 'Network Error',
					body: err instanceof Error ? err.message : String(err),
				},
			})
			throw err
		}

		const contentType = response.headers.get('content-type') || ''
		const contentLength = Number(response.headers.get('content-length')) || 0
		const isJsonOrText =
			contentType.includes('json') || contentType.includes('text')
		const isTooBig = contentLength > MAX_BODY_SIZE

		if (isJsonOrText && !isTooBig) {
			try {
				const clone = response.clone()
				clone
					.text()
					.then(text => {
						const duration = Date.now() - startTime
						useInspectorStore.getState().add({
							id: generateId(),
							type: 'fetch',
							timestamp: startTime,
							duration,
							trace,
							request: { url, method, body: reqBody, headers: reqHeaders },
							response: {
								status: response.status,
								statusText: response.statusText,
								body: safeParseBody(text),
							},
						})
					})
					.catch(() => {})
			} catch (e) {}
		} else {
			const duration = Date.now() - startTime
			useInspectorStore.getState().add({
				id: generateId(),
				type: 'fetch',
				timestamp: startTime,
				duration,
				trace,
				request: { url, method, body: reqBody, headers: reqHeaders },
				response: {
					status,
					statusText,
					body: isTooBig
						? `[Blob/File too big: ${(contentLength / 1024).toFixed(2)}KB]`
						: '[Binary/Stream]',
				},
			})
		}

		return response
	}
}

function patchXHR() {
	const originalOpen = XMLHttpRequest.prototype.open
	const originalSend = XMLHttpRequest.prototype.send

	XMLHttpRequest.prototype.open = function (
		method: string,
		url: string | URL,
		...args: any[]
	) {
		// @ts-ignore
		this._debug = {
			method,
			url: url.toString(),
			startTime: Date.now(),
			trace: getStackTrace(),
		}
		// @ts-ignore
		return originalOpen.call(this, method, url, ...args)
	}

	XMLHttpRequest.prototype.send = function (body?: any) {
		// @ts-ignore
		const debug = this._debug
		if (debug && !debug.url.includes('hot-update')) {
			const onFinish = (isError: boolean) => {
				// @ts-ignore
				const xhr = this as XMLHttpRequest
				const duration = Date.now() - debug.startTime

				let resBody = null

				try {
					const isText =
						!xhr.responseType ||
						xhr.responseType === 'text' ||
						xhr.responseType === 'json'

					if (
						isText &&
						xhr.responseText &&
						xhr.responseText.length < MAX_BODY_SIZE
					) {
						resBody = safeParseBody(xhr.responseText)
					} else {
						resBody = `[Hidden: ${xhr.responseType || 'Blob'} or Too Large]`
					}
				} catch {
					resBody = '[Read Error / CORS Opaque]'
				}

				useInspectorStore.getState().add({
					id: generateId(),
					type: 'fetch',
					timestamp: debug.startTime,
					duration,
					trace: debug.trace,
					request: {
						url: debug.url,
						method: debug.method,
						body: safeParseBody(body),
					},
					response: {
						status: isError ? 0 : xhr.status,
						statusText: isError ? 'Network Error' : xhr.statusText,
						body: resBody,
					},
				})
			}

			this.addEventListener('load', () => onFinish(false), { once: true })
			this.addEventListener('error', () => onFinish(true), { once: true })
			this.addEventListener('abort', () => onFinish(true), { once: true })
		}
		return originalSend.call(this, body)
	}
}

function patchD() {
	;(window as any).d = <T>(value: T | Promise<T>) => {
		const trace = getStackTrace()
		const timestamp = Date.now()

		const add = (val: any, error?: any) => {
			useInspectorStore.getState().add({
				id: generateId(),
				type: 'value',
				timestamp,
				trace,
				value: val,
				...(error && { error: String(error) }),
			})
		}

		if (value instanceof Promise) {
			// Возвращаем исходный промис, но вешаем "жучок"
			value
				.then(res => {
					add(res)
					return res
				})
				.catch(err => {
					add(null, err)
					throw err
				})
			return value
		}

		add(value)
		return value
	}
}
