import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

interface Props {
	title?: string
	children: React.ReactNode
}

const Page = ({ children }: Props) => {
	return (
		<>
			<Header />
				<main className={`px-3.5`}>
					<div className='pt-6 pb-[4rem] sm:px-0 sm:pt-0 mx-auto max-w-screen-lg'>{children}</div>
				</main>
			<BottomNav />
		</>
	)
}

export default Page
