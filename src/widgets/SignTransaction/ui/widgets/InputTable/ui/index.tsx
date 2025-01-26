import { formatDistanceStrict } from "date-fns";
import React, { FC, useEffect, useState } from "react";
import { useStore } from "@/shared/store";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, Timestamp } from "firebase/firestore";
import { useShallow } from "zustand/react/shallow";
import { TransactionIcon } from "@/entities";
import Link from "next/link";
import { collapseAccount } from "@/shared/helpers";
import { Information, Signer } from "@/shared/types";

interface InputGroupProps {
  sequenceNumber?: string;
  transactionFee?: string;
  numberOfOperations?: string;
  numberOfSignatures?: string;
  ID: string;
}

const firebaseConfig = {
  apiKey: "AIzaSyCKlxZDJPFm9Nljen13J-IzJ8FVbnd21YA",
  authDomain: "mtl-stellar-multisig.firebaseapp.com",
  projectId: "mtl-stellar-multisig",
  storageBucket: "mtl-stellar-multisig.firebasestorage.app",
  messagingSenderId: "438713537751",
  appId: "1:438713537751:web:fa75665e11733c5f178c92",
  measurementId: "G-BYBM9KW3GM"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const InputTable: FC<InputGroupProps> = ({ ID }) => {
  const { tx, net, information, setInformation } = useStore(
    useShallow((state) => state)
  );
  const [transactionCreatedAt, setTransactionCreatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);  // Move this inside the component
   const [error, setError] = useState<string | null>(null); // Move this inside the component
 

  const { selectedMemoType, setSelectedMemoType } = useStore(
    useShallow((state) => ({
      selectedMemoType: state.selectedMemoType,
      setSelectedMemoType: state.setSelectedMemoType,
    }))
  );

  const sortedSigners = React.useMemo(() => {
    if (!information?.signers?.length) return [];
    return [...information.signers]
      .filter((signer) => signer.key && signer.weight)
      .sort((a, b) => b.weight - a.weight)
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [information?.signers]);

  useEffect(() => {
    const loadInformation = async () => {
      try {
        if (!information || Object.keys(information).length === 0) {
          const storedInformation = localStorage.getItem("information");
          if (storedInformation) {
            setInformation(JSON.parse(storedInformation));
          } else if (ID) {
            const response = await fetch(`/api/information?id=${ID}`);
            if (!response.ok) throw new Error("Ошибка загрузки данных");
            const data = await response.json();
            setInformation(data);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке информации:", error);
      }
    };

    loadInformation();
  }, [ID, information, setInformation]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (firestore && ID) {
          const transactionRef = doc(firestore, "TransactionsForSignPublic", ID);
          const transactionSnapshot = await getDoc(transactionRef);

          if (transactionSnapshot.exists()) {
            const transactionData = transactionSnapshot.data();

            console.log("Полученные данные из Firestore:", transactionData);

            setInformation(transactionData as Information);

            if (transactionData.createdAt) {
              const createdAtTimestamp = transactionData.createdAt;
              // Убедитесь, что это объект Firestore Timestamp и преобразуйте в Date
              if (createdAtTimestamp instanceof Timestamp) {
                const createdAtDate = createdAtTimestamp.toDate();
                console.log("Дата создания транзакции:", createdAtDate);
                setTransactionCreatedAt(createdAtDate);
              } else {
                console.warn("Неверный формат времени.");
              }
            } else {
              console.warn("Поле createdAt отсутствует в документе.");
            }
          } else {
            throw new Error("Документ не найден в Firestore.");
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных из Firestore:", error);
        setError("Не удалось загрузить данные. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [firestore, ID, setInformation]);

  if (!information) {
    return <div>Loading...</div>;
  }

  return (
    <div className="segment blank">
      <div className="container" style={{ borderRadius: "10px", overflow: "hidden" }}>
        <table className="table">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700" style={{ fontSize: "18px", borderRadius: "5px" }}>
                Public Key
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700" style={{ fontSize: "18px", borderRadius: "5px", padding: "10px 100px" }}>
                Weight
              </th>
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
                    ID={ID}
                    lowerTime={tx.tx.cond.time.max_time}
                    upperTime={tx.tx.cond.time.min_time}
                    baseFee={tx.tx.fee || 100}
                    isVisible={false}
                    typeIcon="Change"
                    typeOp="set_options"
                    masterWeight={item.key === ID ? item.weight : null}
                    weight={item.key !== ID ? item.weight : null}
                    sourceAccount={item.key !== ID ? item.key : null}
                  />
                  <Link href={`/${net}/account?id=${item.key}`} legacyBehavior>
                    <a title={item.key} aria-label={item.key} className="account-address word-break">
                      <span>{collapseAccount(item.key)}</span>
                    </a>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span style={{ paddingLeft: "105px" }}>(w: <b>{item.weight}</b>)</span>
                </td>
              </tr>
            ))}
          <tr>
    <td colSpan={2} className="px-6 py-4 text-gray-700">
      <div>
        <h3>Время создания:</h3>
        <span>{transactionCreatedAt ? transactionCreatedAt.toLocaleString() : "N/A"}</span>
        <div>{error}</div>;

      </div>
    </td>
  </tr>
             
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InputTable;