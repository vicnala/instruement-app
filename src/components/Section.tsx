interface Props {
	children: React.ReactNode
}

const Section = ({ children }: Props) => (
	<section className='pb-6'>{children}</section>
)

export default Section
