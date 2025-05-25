'use client'

import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  ReactNode
} from "react"
import { getContract } from "thirdweb";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { mainnet, arbitrumSepolia } from "thirdweb/chains";
import {
  useActiveAccount,
  useActiveWallet,
  useSwitchActiveWalletChain,
  useActiveWalletChain
} from "thirdweb/react";
import { client } from "./client";
import { getLuthierPermissions } from "@/lib/luthierPermissions";
import chain from "@/lib/chain";

type Props = {
  children: ReactNode
}

type StateContextType = {
  address: string | undefined,
  contract: any,
  isMinter: boolean,
  isLuthier: boolean,
  isVerified: boolean,
  isLoading: boolean
  minter: any,
  setReloadUser: Function,
  owned: any[]
}

const stateContextDefaultValues: StateContextType = {
  address: undefined,
  contract: undefined,
  isMinter: false,
  isLoading: true,
  minter: false,
  isLuthier: false,
  isVerified: false,
  setReloadUser: () => { },
  owned: []
}

const StateContext = createContext<StateContextType>(stateContextDefaultValues)

export const getWPUser = async (activeAccount: any, setIsLuthier: Function, setIsVerified: Function, setIsMinter: Function, setMinter: Function) => {
  try {
    const result = await fetch(`/api/user/${activeAccount.address}`, { cache: 'no-store' })
    const data = await result.json();
    // data is the "data", there is NO { code: 'xx', ... }
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
    const getOwned = await getOwnedNFTs({
      contract: getContract({
        client,
        address: process.env.NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
        chain: process.env.NEXT_PUBLIC_CHAIN_ID === '1' ? mainnet : arbitrumSepolia
      }),
      owner: activeAccount.address
    });

    if (getOwned) {
      setOwned(getOwned)
    }
  } catch (err: any) {
    console.error(`getOwnedNFTs for ${activeAccount.address} error ${err.message}`)
    setOwned([])
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
  const [contract, setContract] = useState<any>()
  const [reloadUser, setReloadUser] = useState(false)
  const [owned, setOwned] = useState<any[]>([])

  if (!contract) {
    if (process.env.NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS) {
      const _contract = getContract({
        address: process.env.NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
        client,
        chain,
      });
      setContract(_contract);
    }
  }

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
        contract,
        isMinter,
        minter,
        isLuthier,
        isVerified,
        isLoading: isLoading && (contract ? true : false),
        setReloadUser,
        owned
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext)