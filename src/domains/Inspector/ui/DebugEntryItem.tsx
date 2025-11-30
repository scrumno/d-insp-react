import {
	AlertTriangle,
	ArrowRight,
	CheckCircle2,
	Copy,
	Cpu,
	Globe,
	Layers,
	Terminal,
} from 'lucide-react'
import React, { useState } from 'react'
import { copyToClipboard } from 'shared/lib/utils'
import { DebugEntry } from '../model/types'
import { CodeBlock } from './CodeBlock'

export const DebugEntryItem = ({ entry }: { entry: DebugEntry }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [urlCopied, setUrlCopied] = useState(false)

	const getVisuals = () => {
		if (entry.type === 'fetch') {
			const isErr = entry.response.status >= 400 || entry.response.status === 0
			if (isErr)
				return {
					themeClass: 'd-theme-red',
					icon: <AlertTriangle size={18} strokeWidth={2} />,
				}
			return {
				themeClass: 'd-theme-blue',
				icon: <Globe size={18} strokeWidth={2} />,
			}
		}
		if (entry.type === 'render')
			return {
				themeClass: 'd-theme-purple',
				icon: <Cpu size={18} strokeWidth={2} />,
			}
		return {
			themeClass: 'd-theme-yellow',
			icon: <Terminal size={18} strokeWidth={2} />,
		}
	}

	const { themeClass, icon } = getVisuals()

	const handleCopyUrl = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (entry.type === 'fetch') {
			copyToClipboard(entry.request.url)
			setUrlCopied(true)
			setTimeout(() => setUrlCopied(false), 2000)
		}
	}

	return (
		<div className={`d-row ${themeClass}`}>
			{/* --- HEAD --- */}
			<div className='d-row-head' onClick={() => setIsOpen(!isOpen)}>
				<div className='d-row-indicator'></div>

				<div className='d-icon-box'>{icon}</div>

				<div className='d-row-content'>
					<div className='d-row-title'>
						{entry.type === 'fetch' && (
							<>
								<span
									className={`d-badge ${entry.request.method.toLowerCase()}`}
								>
									{entry.request.method}
								</span>
								<span
									title={entry.request.url}
									style={{
										flex: 1,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{new URL(entry.request.url, 'http://localhost').pathname}
								</span>
								<button
									onClick={handleCopyUrl}
									className='d-icon-btn'
									style={{
										padding: 2,
										height: 'auto',
										opacity: urlCopied ? 1 : 0.5,
									}}
								>
									{urlCopied ? (
										<CheckCircle2 size={12} color='var(--c-green)' />
									) : (
										<Copy size={12} />
									)}
								</button>
							</>
						)}
						{entry.type === 'render' && (
							<span
								style={{
									color: 'var(--c-purple)',
									fontFamily: 'var(--d-font-mono)',
								}}
							>
								{entry.componentName}
							</span>
						)}
						{entry.type === 'value' && (
							<span style={{ color: 'var(--c-yellow)' }}>
								{entry.label || 'Log Output'}
							</span>
						)}
					</div>

					<div className='d-row-subtitle'>
						{entry.type === 'fetch' && entry.request.url}
						{entry.type === 'render' &&
							`Render #${entry.count} • ${entry.message}`}
						{entry.type === 'value' &&
							(typeof entry.value === 'object'
								? JSON.stringify(entry.value)
								: String(entry.value))}
					</div>
				</div>

				<div className='d-row-meta'>
					{entry.type === 'fetch' && (
						<div className='d-flex d-items-center' style={{ marginBottom: 4 }}>
							{(() => {
								const isErr =
									entry.response.status >= 400 || entry.response.status === 0
								return (
									<>
										<span
											className={`d-status-dot ${isErr ? 'err' : 'ok'}`}
										></span>
										<span className={`d-status-text ${isErr ? 'err' : 'ok'}`}>
											{entry.response.status || 'ERR'}
										</span>
									</>
								)
							})()}
						</div>
					)}
					<div
						style={{
							display: 'flex',
							gap: '0.5rem',
						}}
					>
						<span className='d-time'>
							{new Date(entry.timestamp).toLocaleTimeString('ru-RU', {
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
							})}
						</span>
						{entry.type === 'fetch' && (
							<span className='d-duration'>{entry.duration}ms</span>
						)}
					</div>
				</div>
			</div>

			{/* --- BODY --- */}
			{isOpen && (
				<div className='d-details'>
					{entry.type === 'fetch' && (
						<>
							{!!entry.request.body && (
								<CodeBlock
									title='Request Payload'
									data={entry.request.body}
									icon={<ArrowRight size={14} color='var(--c-blue)' />}
								/>
							)}
							<CodeBlock
								title='Response Body'
								data={entry.response.body}
								icon={
									<ArrowRight
										size={14}
										color={
											entry.response.status >= 400
												? 'var(--c-red)'
												: 'var(--c-green)'
										}
									/>
								}
							/>
							{entry.request.headers && (
								<CodeBlock
									title='Headers'
									data={entry.request.headers}
									collapsed
								/>
							)}
						</>
					)}

					{entry.type === 'render' && (
						<>
							<div
								style={{
									display: 'flex',
									gap: 12,
									padding: 12,
									background: 'var(--c-purple-bg)',
									border: '1px solid var(--c-purple-border)',
									borderRadius: 8,
								}}
							>
								<Layers
									size={16}
									color='var(--c-purple)'
									style={{ marginTop: 2 }}
								/>
								<div>
									<div
										style={{
											fontSize: 10,
											fontWeight: 700,
											color: 'var(--c-purple)',
											textTransform: 'uppercase',
											marginBottom: 4,
										}}
									>
										Trigger Reason
									</div>
									<div
										style={{
											fontSize: 12,
											color: 'var(--d-text)',
											fontFamily: 'var(--d-font-mono)',
										}}
									>
										{entry.message}
									</div>
								</div>
							</div>
							{entry.props && (
								<CodeBlock title='Component Props' data={entry.props} />
							)}
						</>
					)}

					{entry.type === 'value' && (
						<CodeBlock title='Value' data={entry.value} />
					)}

					{entry.trace && (
						<div className='d-trace-wrap'>
							<div className='d-trace-label'>Stack Trace</div>
							<div className='d-trace-content d-scroll'>{entry.trace}</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
