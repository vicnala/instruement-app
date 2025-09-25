'use client'

import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  ReactNode
} from "react"
import {
  useActiveAccount,
  useActiveWallet,
  useSwitchActiveWalletChain,
  useActiveWalletChain
} from "thirdweb/react";
import { getLuthierPermissions } from "@/lib/luthierPermissions";
import chain from "@/lib/chain";


type Props = {
  children: ReactNode
}

type StateContextType = {
  address: string | undefined,
  isMinter: boolean,
  isLuthier: boolean,
  isVerified: boolean,
  isLoading: boolean
  minter: any,
  setReloadUser: Function,
  owned: any[],
  mintedIds: number[];
}

const stateContextDefaultValues: StateContextType = {
  address: undefined,
  isMinter: false,
  isLoading: true,
  minter: false,
  isLuthier: false,
  isVerified: false,
  setReloadUser: () => { },
  owned: [],
  mintedIds: [],
}

const StateContext = createContext<StateContextType>(stateContextDefaultValues)

export const getWPUser = async (activeAccount: any, setIsLuthier: Function, setIsVerified: Function, setIsMinter: Function, setMinter: Function) => {
  try {
    const result = await fetch(`/api/user/${activeAccount.address}`, { cache: 'no-store' })
    const data = await result.json();
    // console.log(`/api/user/${address}`, data);

    const { isLuthier, isVerified, isMinter } = getLuthierPermissions(data);

    if (isLuthier) setIsLuthier(true);
    else setIsLuthier(false);

    if (isVerified) setIsVerified(true);
    else setIsVerified(false)

    if (isMinter) {
      setIsMinter(true)
      setMinter(data)
    } else {
      setIsMinter(false)
      setMinter(false)
    }
  } catch (error) {
    setIsMinter(false)
    setMinter(false)
    setIsVerified(false)
    setIsLuthier(false)
  }
}

export const getUserTokens = async (activeAccount: any, setOwned: Function) => {
  if (!process.env.NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS || !process.env.NEXT_PUBLIC_CHAIN_ID) {
    return
  }

  try {
    const result = await fetch(`/api/tokens/${activeAccount.address}`, { cache: 'no-store' })
    const data = await result.json();
    setOwned(data);
  } catch (error) {
    setOwned([]);
  }
}

export const getUserInstruments = async (setMintedIds: Function) => {
  try {
    const result = await fetch(`/api/user/instruments`, { cache: 'no-store' })
    const data = await result.json();
    setMintedIds(data.data.ids);
  } catch (error) {
    setMintedIds({ids: []});
  }
}

export const StateContextProvider = ({ children }: Props) => {
  const activeAccount = useActiveAccount();
  const activeWallet = useActiveWallet();
  const activeChain = useActiveWalletChain();
  const switchActiveWalletChain = useSwitchActiveWalletChain();

  const [isLuthier, setIsLuthier] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isMinter, setIsMinter] = useState(false)
  const [minter, setMinter] = useState(false)
  const [address, setAddress] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [reloadUser, setReloadUser] = useState(false)
  const [owned, setOwned] = useState<any[]>([])
  const [mintedIds, setMintedIds] = useState<number[]>([])

  useEffect(() => {
      if (activeWallet && activeChain?.id !== chain.id) {
          switchActiveWalletChain(chain);
      }
  }, [activeWallet, activeChain, switchActiveWalletChain]);

  useEffect(() => {
    async function getUser() {
      // console.log("context", activeAccount);
      setIsLoading(true);
      setReloadUser(false);
      if (activeAccount?.address) {
        setAddress(activeAccount.address);
        await getWPUser(activeAccount, setIsLuthier, setIsVerified, setIsMinter, setMinter);
        await getUserTokens(activeAccount, setOwned);
        await getUserInstruments(setMintedIds);
      }
      setIsLoading(false)
    }

    if (!isLoading) {
      if (activeAccount?.address === undefined) {
        setAddress(undefined);
        setIsMinter(false)
        setMinter(false)
        setIsLoading(false)
      } else {
        if (activeAccount?.address !== address) {
          getUser().catch((e) => {
            console.log('context error', e.message);
          })
        } else if (reloadUser) {
          getUser().catch((e) => {
            console.log('context error', e.message);
          })
        }
      }
    }
  }, [activeAccount, reloadUser, isLoading, address])

  return (
    <StateContext.Provider
      value={{
        address,
        isMinter,
        minter,
        isLuthier,
        isVerified,
        isLoading: isLoading,
        setReloadUser,
        owned,
        mintedIds
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext)