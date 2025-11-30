import { Check, Copy, Terminal } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { copyToClipboard } from 'shared/lib/utils'

interface Props {
	title: string
	data: any
	icon?: React.ReactNode
	collapsed?: boolean
}

// Custom Syntax Highlighter
const syntaxHighlight = (json: string): string => {
	if (!json) return ''

	// Escape HTML entities first to prevent XSS issues if display user content
	let safeJson = json
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')

	return safeJson.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[\[\]{},])/g,
		match => {
			let cls = 's-num'

			// Punctuation
			if (/^[\[\]{},]$/.test(match)) {
				cls = 's-punct'
				return `<span class="${cls}">${match}</span>`
			}

			// String or Key
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 's-key'
					// Separate the colon
					return `<span class="${cls}">${match.slice(
						0,
						-1
					)}</span><span class="s-punct">:</span>`
				} else {
					cls = 's-str'
				}
			}
			// Boolean
			else if (/true|false/.test(match)) {
				cls = 's-bool'
			}
			// Null
			else if (/null/.test(match)) {
				cls = 's-null'
			}

			return `<span class="${cls}">${match}</span>`
		}
	)
}

export const CodeBlock: React.FC<Props> = ({
	title,
	data,
	icon,
	collapsed = false,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(collapsed)
	const [copied, setCopied] = useState(false)

	if (
		data === undefined ||
		data === null ||
		(typeof data === 'string' && data === '')
	)
		return null

	const jsonString = useMemo(() => {
		try {
			// If it's already a string, try to parse it to format it pretty, otherwise verify if it's an object
			if (typeof data === 'string') {
				try {
					const parsed = JSON.parse(data)
					return JSON.stringify(parsed, null, 2)
				} catch {
					return data // Not JSON string
				}
			}
			return JSON.stringify(data, null, 2)
		} catch (e) {
			return String(data)
		}
	}, [data])

	const htmlContent = useMemo(() => syntaxHighlight(jsonString), [jsonString])
	const lines = htmlContent.split('\n')

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation()
		copyToClipboard(jsonString)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className='d-code-container'>
			<div className='d-code-head' onClick={() => setIsCollapsed(!isCollapsed)}>
				<div className='d-code-title'>
					{icon || <Terminal size={14} color='var(--s-key)' />}
					{title}
					{isCollapsed && (
						<span
							style={{
								fontSize: 9,
								background: 'var(--d-border)',
								padding: '1px 4px',
								borderRadius: 3,
								marginLeft: 8,
								color: 'var(--d-text-dim)',
							}}
						>
							HIDDEN
						</span>
					)}
				</div>
				<button
					className={`d-code-copy-btn ${copied ? 'copied' : ''}`}
					onClick={handleCopy}
				>
					{copied ? <Check size={12} /> : <Copy size={12} />}
					{copied ? 'Copied' : 'Copy'}
				</button>
			</div>

			{!isCollapsed && (
				<div className='d-code-body d-scroll'>
					{lines.map((line, i) => (
						<div key={i} className='d-code-line'>
							<span className='d-code-num' style={{ whiteSpace: 'pre' }}>
								{i + 1}
							</span>
							<span
								style={{ whiteSpace: 'pre' }}
								dangerouslySetInnerHTML={{ __html: line || ' ' }}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
