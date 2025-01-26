import React, { FC } from 'react'
import SignTransaction from "@/views/SignTransaction/page"
interface PageProps {
  ID?: string // specify the type of the ID property
}
const Page: FC<PageProps> = ({ID}) => {
  return <SignTransaction ID={ID || ""} />
}

export default Page
