import React, { useState } from 'react'
import { copyToClipboard } from 'shared/lib/utils'
import { CopyIcon } from 'shared/ui/Icons'

interface Props {
	title: string
	data: any
}

export const JsonView: React.FC<Props> = ({ title, data }) => {
	const [copied, setCopied] = useState(false)

	if (data === undefined || data === null || data === '') return null

	const jsonStr =
		typeof data === 'string' ? data : JSON.stringify(data, null, 2)

	const handleCopy = () => {
		copyToClipboard(jsonStr)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleOpenRaw = () => {
		const blob = new Blob([jsonStr], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		window.open(url, '_blank')
	}

	return (
		<div className='d-insp-json-section'>
			<div className='d-insp-json-header'>
				<span className='d-insp-json-title'>{title}</span>
				<div className='d-insp-json-actions'>
					<button
						onClick={handleOpenRaw}
						className='d-insp-action-btn'
						title='Open in new tab'
					>
						Raw ↗
					</button>
					<button
						onClick={handleCopy}
						className={`d-insp-action-btn ${copied ? 'success' : ''}`}
					>
						{copied ? (
							'Copied'
						) : (
							<>
								<span className='d-insp-icon-box'>
									<CopyIcon />
								</span>{' '}
								Copy
							</>
						)}
					</button>
				</div>
			</div>
			<pre className='d-insp-pre'>{jsonStr}</pre>
		</div>
	)
}
