interface Props {
	children: React.ReactNode
	id?: string
}

const Section = ({ children, id }: Props) => (
	<section id={id} className='pb-6'>{children}</section>
)

export default Section
