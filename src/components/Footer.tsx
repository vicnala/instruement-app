import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import Image from 'next/image'
import { useTranslations } from "next-intl";
import { ModeToggle } from "./ModeToggle";
import LocalSwitcher from "./LocalSwitcher";
import { useStateContext } from "@/app/context";

export function Footer() {
  const t = useTranslations();
  const { address, isMinter } = useStateContext()
  const pathname = usePathname();
  
  return (
    <footer className="justify-center items-center flex pb-6">
            {/* <LocalSwitcher /> */}
            {/* <ModeToggle /> */}
    </footer>
  )
}