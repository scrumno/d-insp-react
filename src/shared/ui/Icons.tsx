export const CopyIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		width='12'
		height='12'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<rect x='9' y='9' width='13' height='13' rx='2' ry='2'></rect>
		<path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
	</svg>
)

export const CloseIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		width='20'
		height='20'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<line x1='18' y1='6' x2='6' y2='18'></line>
		<line x1='6' y1='6' x2='18' y2='18'></line>
	</svg>
)

export const BugIcon = () => (
	<div style={{ fontSize: 24, lineHeight: 1 }}>🐛</div>
)
