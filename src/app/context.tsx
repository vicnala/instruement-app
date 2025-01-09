'use client'

import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  ReactNode
} from "react"
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import { client } from "./client";
import { getLuthierPermissions } from "@/lib/luthierPermissions";

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

export const StateContextProvider = ({ children }: Props) => {
  const activeAccount = useActiveAccount();

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
        chain: baseSepolia,
      });
      setContract(_contract);
    }
  }

  useEffect(() => {
    async function getUser() {
      // console.log("context", activeAccount);

      setIsLoading(true);
      setReloadUser(false);
      if (activeAccount?.address) {
        setAddress(activeAccount.address);
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
          console.log(error)
          setIsMinter(false)
          setMinter(false)
          setIsVerified(false)
          setIsLuthier(false)
        }

        try {
          const result = await fetch(`/api/tokens/${activeAccount.address}`, { cache: 'no-store' })
          const data = await result.json();

          if (data && data.length) {
            setOwned(data);
          } else {
            setOwned([]);
          }
        } catch (error) {
          console.log(error)
          setOwned([]);
        }

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