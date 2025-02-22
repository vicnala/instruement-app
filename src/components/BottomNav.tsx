'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { useStateContext } from '@/app/context'

export const BottomNav = () => {
	const t = useTranslations()
	const { address, isMinter } = useStateContext()
	const pathname = usePathname();

	// console.log(pathname === '/');

	return (
		<div className='sm:hidden'>
			{
				address &&
				<nav className='fixed bottom-0 w-full bg-black pb-safe dark:border-t dark:border-gray-900'>
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
								<Link key="drafts_new" href="/drafts/new">
									<div
										className={`flex h-full w-full flex-col items-center justify-center space-y-1 ${pathname.includes('/drafts')
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
											<path d="M17.03 9.78a.75.75 0 00-1.06-1.06l-5.47 5.47-2.47-2.47a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l6-6z" />
											<path
												fillRule="evenodd"
												d="M14.136 1.2a3.61 3.61 0 00-4.272 0L8.489 2.21a2.11 2.11 0 01-.929.384l-1.686.259a3.61 3.61 0 00-3.021 3.02L2.594 7.56a2.11 2.11 0 01-.384.929L1.2 9.864a3.61 3.61 0 000 4.272l1.01 1.375c.2.274.333.593.384.929l.259 1.686a3.61 3.61 0 003.02 3.021l1.687.259c.336.051.655.183.929.384l1.375 1.01a3.61 3.61 0 004.272 0l1.375-1.01a2.11 2.11 0 01.929-.384l1.686-.259a3.61 3.61 0 003.021-3.02l.259-1.687a2.11 2.11 0 01.384-.929l1.01-1.375a3.61 3.61 0 000-4.272l-1.01-1.375a2.11 2.11 0 01-.384-.929l-.259-1.686a3.61 3.61 0 00-3.02-3.021l-1.687-.259a2.11 2.11 0 01-.929-.384L14.136 1.2zm-3.384 1.209a2.11 2.11 0 012.496 0l1.376 1.01a3.61 3.61 0 001.589.658l1.686.258a2.11 2.11 0 011.765 1.766l.26 1.686a3.61 3.61 0 00.657 1.59l1.01 1.375a2.11 2.11 0 010 2.496l-1.01 1.376a3.61 3.61 0 00-.658 1.589l-.258 1.686a2.11 2.11 0 01-1.766 1.765l-1.686.26a3.61 3.61 0 00-1.59.657l-1.375 1.01a2.11 2.11 0 01-2.496 0l-1.376-1.01a3.61 3.61 0 00-1.589-.658l-1.686-.258a2.11 2.11 0 01-1.766-1.766l-.258-1.686a3.61 3.61 0 00-.658-1.59l-1.01-1.375a2.11 2.11 0 010-2.496l1.01-1.376a3.61 3.61 0 00.658-1.589l.258-1.686a2.11 2.11 0 011.766-1.766l1.686-.258a3.61 3.61 0 001.59-.658l1.375-1.01z"
											/>
										</svg>
										<span className='text-xs text-gray-300 dark:text-gray-700'>
											{t('components.Header.new_instrument')}
										</span>
									</div>
								</Link>
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
