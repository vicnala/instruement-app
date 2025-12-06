interface Props {
	children: React.ReactNode
	id?: string
	className?: string
	dataTheme?: string
}

const Section = ({ children, id, className, dataTheme }: Props) => (
	<section 
		id={id} 
		className={className || 'pb-6'}
		data-theme={dataTheme}
	>
		{children}
	</section>
)

export default Section
