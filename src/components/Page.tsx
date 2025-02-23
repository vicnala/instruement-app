import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useStateContext } from "@/app/context";

interface Props {
	title?: string
	children: React.ReactNode
}

const Page = ({ children }: Props) => {
	const { address } = useStateContext()
	return (
		<>
			<Header />
			{
				<main className={`${address ? 'pt-0' : 'pt-[15vh]'} md:pt-[10vh] mx-auto max-w-screen-lg px-safe`}>
					<div className='px-3.5'>{children}</div>
				</main>
			}
			<Footer />
			<BottomNav />
		</>
	)
}

export default Page
