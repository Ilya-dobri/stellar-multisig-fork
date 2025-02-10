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
import Error from "next/error";
import TableList from "./TableList";

interface InputGroupProps {
  sequenceNumber?: string;
  transactionFee?: string;
  numberOfOperations?: string;
  numberOfSignatures?: string;
  ID: string;
}


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
        createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    },
  };
  const [isFirestoreActive, setIsFirestoreActive] = useState(true);
  
  const [transactionsBySigner, setTransactionsBySigner] = useState<Record<string, Date>>({});

 // Move this inside the component

 

  const sortedSigners = React.useMemo(() => {
    if (!information?.signers?.length) return [];
    return [...information.signers]
      .filter((signer) => signer.key && signer.weight)
      .sort((a, b) => b.weight - a.weight)
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [information?.signers]);

  useEffect(() => {
    let isMounted = true;
    console.log("⚡ useEffect запустился");
  
    const loadInformation = async () => {
      try {
        let localDates: Record<string, Date> = {};
  
        if (!information || Object.keys(information).length === 0) {
          const storedInformation = localStorage.getItem("information");
          console.log("🗄️ Данные из localStorage:", storedInformation);
  
          if (storedInformation) {
            const parsedInfo = JSON.parse(storedInformation);
            if (isMounted) {
              setInformation(parsedInfo);
              if (parsedInfo.createdAt) {
                localDates[parsedInfo.signerKey] = new Date(parsedInfo.createdAt);
              }
            }
          }
        } else {
          if (information.created_at) {
            localDates[tx.tx.source_account] = new Date(information.created_at);
          }
        }
  
        if (!isFirestoreActive) {
          console.warn("⚠️ Firestore отключен, пропускаем запрос.");
          return;
        }
  
        const querySnapshot = await getDocs(collection(firestore, "TransactionsForSignPublic"));
  
        if (!isMounted) return;
  
        console.log("🔥 Firestore документов:", querySnapshot.docs.length);
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const signerKey = data.signerKey || doc.id; 
          if (typeof data.createdAt === "number" && signerKey) {
            localDates[signerKey] = new Date(data.createdAt);
          }
          console.log("📄 ID:", doc.id, "➡️ Данные:", doc.data());
        });
  
        console.log("📅 Привязанные даты:", localDates);
  
        if (isMounted) {
          setTransactionsBySigner(localDates);
        }
      } catch (error: any) {
        console.error("❌ Ошибка при загрузке информации:", error);
        if (error.message.includes("terminated")) {
          setIsFirestoreActive(false);
        }
      }
    };
  
    loadInformation();
  
    return () => {
      isMounted = false;
      console.log("🛑 useEffect размонтирован");
    };
  }, [information, setInformation, ID, isFirestoreActive]);
  
  
  

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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSigners.sort((a) => (a.key === ID ? -1 : 1)).map((item: Signer) => (
          
              <tr key={item.key}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/${net}/account?id=${item.key}`} legacyBehavior>
                    <a title={item.key} className="account-address word-break">
                      <span>{collapseAccount(item.key)}</span>
                    </a>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span>(w: <b>{item.weight}</b>)</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <td className="px-6 py-4 whitespace-nowrap">
  {transactionsBySigner[item.key.trim()] ? (
    transactionsBySigner[item.key.trim()].toLocaleString()
  ) : (
    <span style={{ color: "red" }}>N/A</span>
  )}
</td>

</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};  

export default InputTable;
