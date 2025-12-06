import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

interface Props {
	title?: string
	children: React.ReactNode
	context?: any
}

const Page = ({ children, context }: Props) => {
	return (
		<>
			<Header context={context} />
				<main className={`px-3.5`}>
					<div className='pt-6 pb-[4rem] sm:px-0 mx-auto max-w-screen-lg'>{children}</div>
				</main>
			<BottomNav context={context} />
		</>
	)
}

export default Page
