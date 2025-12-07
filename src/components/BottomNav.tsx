'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/routing'
import { TransitionLink } from '@/components/UI/TransitionLink'
import { House, User } from 'lucide-react'
import RegisterPlus from '@/components/Icons/RegisterPlus'


export const BottomNav = ({ context }: { context: any }) => {
	const bottomNavt = useTranslations('components.BottomNav')
	const pathname: string = usePathname();
	const locale = useLocale();
	const isMinter = context?.ctx?.isMinter;
	const address = context?.sub;

	return pathname !== '/login' && address &&
	<div className='bottom-nav fixed z-50 bottom-5 left-4 right-4 flex justify-center' data-theme="us">
		<nav className='sm:hidden min-w-[10rem] px-4 bg-scope-100 border border-scope-200 transition-all duration-200 rounded-full shadow-[0_2px_10px_0px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_10px_0px_rgba(0,0,0,0.8)]'>
			<div className={`mx-auto py-2 grid items-center ${isMinter ? 'grid-cols-[1fr_auto_1fr] gap-6' : !address ? '' : 'grid-cols-[1fr_1fr] gap-3'}`}>
				<TransitionLink key="home" href="/" locale={locale}>
					<div className={
						`flex flex-col items-center ${pathname === '/'
						? 'text-scope-1000'
						: 'text-scope-400'
						}`}
					>
						<House className='w-5 h-5' />
						<span className='text-xs'>{bottomNavt('home')}</span>
					</div>
				</TransitionLink>
				{
					isMinter && 
					(pathname === '/' || pathname === '/account' || pathname.includes('/instrument')) ? (
						<TransitionLink 
						href="/drafts/new" 
						locale={locale}
						theme="it"
						className="flex flex-col items-center text-it-600"
						aria-label={bottomNavt('new_instrument')}
					  >
						<RegisterPlus className="w-5 h-5" />
						<span className="text-xs">{bottomNavt('new_instrument')}</span>
					  </TransitionLink>
					) : isMinter && (pathname.includes('/drafts') || pathname.includes('/pay') || pathname.includes('/preview')) && (
						<div></div>
					)
				}
				{
					address && (
						<TransitionLink key="account" href="/account" locale={locale}>
							<div className={
								`flex flex-col items-center ${pathname.includes('/account')
								? 'text-scope-1000'
								: 'text-scope-400'
								}`}
							>
								<User className="w-5 h-5" />
								<span className="text-xs">{bottomNavt('account')}</span>
							</div>
						</TransitionLink>
					)
				}
			</div>
		</nav>
	</div>
}
