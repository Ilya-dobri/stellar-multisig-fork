
import React, { useEffect, useState } from 'react'
import { Header } from '../../ui/widgets'
import InputTable from '../../ui/widgets/InputTable'

import { Transaction } from "stellar-sdk";
import { useSearchParams } from 'next/navigation';
import { Firestore } from 'firebase/firestore';
interface TransactionOverviewProps {
  transactionEnvelope: string;
  transactionHash: string;
  sourceAccount: string;
  sequenceNumber: string;
  transactionFee: string;
  operationCount: string;
  signatureCount: string;
  transaction: Transaction | null
  firestore: Firestore; 
  ID: string


}


const TransactionTable: React.FC<TransactionOverviewProps> = ({  transactionEnvelope,
  firestore,
  sequenceNumber,
  transactionFee,
  operationCount,
  signatureCount,
  ID,
  }) => {

  return (
    <div className="container" style={{ color: "#fff", }}>
    <Header title="Signatures" />
    <div className="segment blank" >

    <InputTable
           ID={ID}
          sequenceNumber={sequenceNumber}
          transactionFee={transactionFee}
          numberOfOperations={operationCount}
          numberOfSignatures={signatureCount}
         
            />
      </div>
    </div>
    
  )
}
export default TransactionTable