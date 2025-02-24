interface Props {
	children: React.ReactNode
	id?: string
	className?: string
}

const Section = ({ children, id, className }: Props) => (
	<section 
		id={id} 
		className={className || 'pb-6'}
	>
		{children}
	</section>
)

export default Section
