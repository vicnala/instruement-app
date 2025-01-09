'use client';

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
			{
				<main className="mx-auto max-w-screen-md sm:pt-20 pb-16 px-safe sm:pb-0">
					<div className='p-6'>{children}</div>
				</main>
			}
			<BottomNav />
		</>
	)

}

export default Page
