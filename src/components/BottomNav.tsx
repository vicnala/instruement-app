'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { useStateContext } from '@/app/context'
import { ButtonLink } from '@/components/UI/ButtonLink'
import { House, User } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'

export const BottomNav = () => {
	const bottomNavt = useTranslations('components.BottomNav')
	const { isMinter } = useStateContext()
	const activeAccount = useActiveAccount();
	const pathname = usePathname();

	return (
		<nav className='sm:hidden fixed z-100 bottom-0 w-full bg-canvas pb-safe dark:bg-contrast dark:border-t dark:border-gray-900 shadow-[0_0px_4px_0px_rgba(0,0,0,0.2)]'>
			<div className={`mx-auto grid h-[4rem] max-w-md pt-2 ${isMinter ? 'grid-cols-[1fr_auto_1fr] gap-[3vw]' : !activeAccount?.address ? '' : 'grid-cols-[1fr_1fr] gap-[3vw]'}`}>
				<Link key="home" href="/">
					<div className={
						`flex flex-col items-center pt-1 ${pathname === '/'
						? 'text-it-500 dark:text-it-400'
						: 'text-gray-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
						}`}
					>
						<House className={`w-4 h-4 ${pathname === '/' ? 'text-it-400 dark:text-it-500' : 'text-gray-300 dark:text-gray-400'}`} />
						<span className={`text-sm ${pathname === '/' ? 'text-it-400 dark:text-it-500' : 'text-gray-300 dark:text-gray-400'}`}>
							{bottomNavt('home')}
						</span>
					</div>
				</Link>
				{
					isMinter && (pathname === '/' || pathname === '/account' || pathname.startsWith('/instrument')) &&
					<ButtonLink href="/drafts/new" size="md" colorSchema="it">
						{bottomNavt('new_instrument')}
					</ButtonLink>
				}
				{
				activeAccount?.address &&
				<Link key="account" href="/account">
					<div className={
						`flex flex-col items-center pt-1 ${pathname.includes('/account')
						? 'text-it-500 dark:text-it-400'
						: 'text-gray-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
						}`}
					>
						<User className={`w-4 h-4 ${pathname.includes('/account') ? 'text-it-400 dark:text-it-500' : 'text-gray-300 dark:text-gray-400'}`} />
						<span className={`text-sm ${pathname.includes('/account') ? 'text-it-400 dark:text-it-500' : 'text-gray-300 dark:text-gray-400'}`}>
							{bottomNavt('account')}
						</span>
					</div>
				</Link>
				}
			</div>
		</nav>
	)
}
