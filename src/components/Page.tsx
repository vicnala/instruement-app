'use client';

import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { Footer } from "./Footer";
interface Props {
	title?: string
	children: React.ReactNode
}

const Page = ({ children }: Props) => {
	return (
		<>
			<Header />
			{
				<main className="mt-[15vh] md:mt-[10vh] mx-auto max-w-screen-lg px-safe ">
					<div className='px-3.5'>{children}</div>
				</main>
			}
			<Footer />
			<BottomNav />
		</>
	)

}

export default Page
