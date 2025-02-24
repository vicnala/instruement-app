'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { useStateContext } from '@/app/context'
import { ButtonLink } from '@/components/UI/ButtonLink'

export const BottomNav = () => {
	const t = useTranslations()
	const { address, isMinter } = useStateContext()
	const pathname = usePathname();

	// console.log(pathname === '/');

	return (
		<div className='sm:hidden'>
			{
				address &&
				<nav className='fixed z-100 bottom-0 w-full bg-white pb-safe dark:border-t dark:border-gray-900 shadow-[0_0px_10px_0px_rgba(0,0,0,0.2)]'>
					{
						<div className='mx-auto flex h-16 max-w-md items-center justify-around px-6'>
							<Link key="home" href="/">
								<div
									className={`flex h-full w-full flex-col items-center justify-center space-y-1 ${pathname === '/'
											? 'text-indigo-500 dark:text-indigo-400'
											: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
										}`}
								>
									<svg
										viewBox="0 0 24 24"
										fill="currentColor"
										height="1em"
										width="1em"
										className="text-gray-100 dark:text-gray-600"
									>
										<path
											fillRule="evenodd"
											d="M11.03 2.59a1.5 1.5 0 011.94 0l7.5 6.363a1.5 1.5 0 01.53 1.144V19.5a1.5 1.5 0 01-1.5 1.5h-5.75a.75.75 0 01-.75-.75V14h-2v6.25a.75.75 0 01-.75.75H4.5A1.5 1.5 0 013 19.5v-9.403c0-.44.194-.859.53-1.144l7.5-6.363zM12 3.734l-7.5 6.363V19.5h5v-6.25a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v6.25h5v-9.403L12 3.734z"
										/>
									</svg>
									<span className='text-xs text-gray-300 dark:text-gray-700'>
										{t('navbar.home')}
									</span>
								</div>
							</Link>
							{
								isMinter &&
								<ButtonLink href="/drafts/new" size="sm" colorSchema="it">
									{t('components.Header.new_instrument')}
							  	</ButtonLink>
							}
							<Link key="account" href="/account">
								<div
									className={`flex h-full w-full flex-col items-center justify-center space-y-1 ${pathname.includes('/account')
											? 'text-indigo-500 dark:text-indigo-400'
											: 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
										}`}
								>
									<svg
										viewBox="0 0 24 24"
										fill="currentColor"
										height="1em"
										width="1em"
										className="text-gray-100 dark:text-gray-600"
									>
										<path
											fillRule="evenodd"
											d="M12 2.5a5.5 5.5 0 00-3.096 10.047 9.005 9.005 0 00-5.9 8.18.75.75 0 001.5.045 7.5 7.5 0 0114.993 0 .75.75 0 101.499-.044 9.005 9.005 0 00-5.9-8.181A5.5 5.5 0 0012 2.5zM8 8a4 4 0 118 0 4 4 0 01-8 0z"
										/>
									</svg>
									<span className='text-xs text-gray-300 dark:text-gray-700'>
										{t('navbar.account')}
									</span>
								</div>
							</Link>
						</div>
					}
				</nav>
			}
		</div>
	)
}
