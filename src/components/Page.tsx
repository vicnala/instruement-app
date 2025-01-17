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
				<main className="mx-auto max-w-screen-lg px-safe ">
					<div className='px-3.5'>{children}</div>
				</main>
			}
			<BottomNav />
		</>
	)

}

export default Page
