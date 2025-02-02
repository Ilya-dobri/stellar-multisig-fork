import React, { FC, useEffect, useState } from "react";
import { useStore } from "@/shared/store";

import {
  Timestamp,
  FirestoreDataConverter,
  getDocs,
  collection,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { useShallow } from "zustand/react/shallow";
import { TransactionIcon } from "@/entities";
import Link from "next/link";
import { collapseAccount } from "@/shared/helpers";
import { Information, Signer, TransactionData } from "@/shared/types";
import { firestore } from "./firebaseClient";
import { getAllTransactions } from "@/shared/api/firebase";

interface InputGroupProps {
  sequenceNumber?: string;
  transactionFee?: string;
  numberOfOperations?: string;
  numberOfSignatures?: string;
  ID: string;
}

const informationConverter: FirestoreDataConverter<TransactionData> = {
  toFirestore(transaction: TransactionData): DocumentData {
    return {
      xdr: transaction.xdr,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): TransactionData {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      xdr: data.xdr,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};


const InputTable: FC<InputGroupProps> = ({ ID }) => {
  const {
    tx,
    net,
    information,
    setInformation,
    selectedMemoType,
    setSelectedMemoType,
  } = useStore(
    useShallow((state) => ({
      tx: state.tx,
      net: state.net,
      information: state.information,
      setInformation: state.setInformation,
      selectedMemoType: state.selectedMemoType,
      setSelectedMemoType: state.setSelectedMemoType,
    }))
  );

  const [transactionCreatedAt, setTransactionCreatedAt] = useState<Date[]>([]);
 // Move this inside the component

  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  const sortedSigners = React.useMemo(() => {
    if (!information?.signers?.length) return [];
    return [...information.signers]
      .filter((signer) => signer.key && signer.weight)
      .sort((a, b) => b.weight - a.weight)
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [information?.signers]);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if unmounted
  
    const loadInformation = async () => {
      try {
        if (!information || Object.keys(information).length === 0) {
          const storedInformation = localStorage.getItem("information");
          if (storedInformation) {
            const parsedInfo = JSON.parse(storedInformation);
            if (isMounted) {
              setInformation(parsedInfo);
              setTransactionCreatedAt(parsedInfo.createdAt ? [new Date(parsedInfo.createdAt)] : []);
            }
          } else if (ID) {
            const response = await fetch(`/api/information?id=${ID}`);
            if (!response.ok) throw new Error("Ошибка загрузки данных");
            const data = await response.json();
            if (isMounted) {
              setInformation(data);
              setTransactionCreatedAt(data.createdAt ? [new Date(data.createdAt)] : []);
            }
          }
        } else {
          if (isMounted) {
            setTransactionCreatedAt(information.created_at ? [new Date(information.created_at)] : []);
          }
        }
  
        // Firebase request to get transaction data
        const querySnapshot = await getDocs(collection(firestore, "transactions"));
        if (!isMounted) return;
  
        const transactionsData: TransactionData[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            xdr: data.xdr || "",
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toMillis() : 0,
            updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toMillis() : 0,
          };
        });
  
        if (isMounted) {
          setTransactions(transactionsData);
  
          // Collect unique dates
          const allDates = new Set<number>(
            transactionsData.filter((transaction) => transaction.createdAt).map((transaction) => transaction.createdAt)
          );
  
          if (isMounted) {
            setTransactionCreatedAt(Array.from(allDates).map((ts) => new Date(ts)));
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке информации:", error);
      }
    };
  
    loadInformation();
  
    return () => {
      isMounted = false; // Cleanup when the component is unmounted
    };
  }, [information, setInformation, ID]);
  
  

  if (!information) {
    return <div>Loading...</div>;
  }


  if (!information) {
    return <div>Нет данных для отображения</div>;
  }
  
  return (
    <div className="segment blank">
      <div className="container" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <table className="table">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Public Key</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Weight</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSigners.sort((a) => (a.key === ID ? -1 : 1)).map((item: Signer) => (
              <tr key={item.key}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TransactionIcon
                    memoText={tx.tx.memo.toString()}
                    selectedMemoType={selectedMemoType}
                    setSelectedMemoType={setSelectedMemoType}
                    lowerTime={tx.tx.cond.time.max_time}
                    upperTime={tx.tx.cond.time.min_time}
                    baseFee={tx.tx.fee || 100}
                    isVisible={false}
                    typeIcon="Change"
                    typeOp="set_options"
                    masterWeight={item.weight}
                    weight={item.weight}
                    sourceAccount={item.key}
                    ID={""}
                  />
                  <Link href={`/${net}/account?id=${item.key}`} legacyBehavior>
                    <a title={item.key} className="account-address word-break">
                      <span>{collapseAccount(item.key)}</span>
                    </a>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span>(w: <b>{item.weight}</b>)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 text-gray-700">
          <h3>Transaction Creation Time:</h3>
          <ul>
            {transactionCreatedAt.length > 0 ? (
              transactionCreatedAt.map((date, index) => <li key={index}>{date.toLocaleString()}</li>)
            ) : (
              <span>N/A</span>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InputTable;
