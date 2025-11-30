export const isDev = process.env.NODE_ENV !== 'production'

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Очистка стека вызовов от мусора библиотеки
export function getStackTrace(): string {
	const err = new Error()
	if (!err.stack) return ''
	return err.stack
		.split('\n')
		.slice(2)
		.filter(
			l =>
				!l.includes('interceptor.ts') &&
				!l.includes('useDebugRender') &&
				!l.includes('renderWithHooks')
		)
		.join('\n')
}

// Безопасный парсинг JSON с лимитом размера
export function safeParseBody(body: any): any {
	if (body === undefined || body === null) return null
	const MAX_BODY_SIZE = 50 * 1024 // 50KB limit to prevent UI lag

	let str = ''
	try {
		if (typeof body === 'string') {
			str = body
		} else if (body instanceof FormData) {
			const obj: Record<string, any> = {}
			body.forEach((value, key) => (obj[key] = value))
			return obj
		} else if (body instanceof URLSearchParams) {
			const obj: Record<string, any> = {}
			body.forEach((value, key) => (obj[key] = value))
			return obj
		} else {
			str = JSON.stringify(body)
		}
	} catch {
		return '[Circular/Unserializable]'
	}

	if (str && str.length > MAX_BODY_SIZE) {
		return `[Data Too Large: ${Math.round(str.length / 1024)}KB] - Truncated`
	}

	try {
		return JSON.parse(str)
	} catch {
		return str
	}
}

export function copyToClipboard(text: string): Promise<void> {
	if (!navigator?.clipboard) return Promise.resolve()
	return navigator.clipboard.writeText(text)
}

export const highlightJson = (jsonStr: string): string => {
	if (!jsonStr) return ''
	const safe = jsonStr
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

	return safe.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
		match => {
			let cls = 'color: #e4e4e7' // default
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'color: #c084fc' // key (purple)
				} else {
					cls = 'color: #7dd3fc' // string (blue)
				}
			} else if (/true|false/.test(match)) {
				cls = 'color: #f87171' // boolean (red)
			} else if (/null/.test(match)) {
				cls = 'color: #f87171' // null (red)
			} else {
				cls = 'color: #fbbf24' // number (yellow)
			}
			return `<span style="${cls}">${match}</span>`
		}
	)
}
