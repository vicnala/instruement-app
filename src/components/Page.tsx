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
				<main className="mx-auto max-w-screen-lg sm:pt-40 pb-16 px-safe sm:pb-100">
					<div className='p-6'>{children}</div>
				</main>
			}
			<Footer />
			<BottomNav />
		</>
	)
}

export default Page
