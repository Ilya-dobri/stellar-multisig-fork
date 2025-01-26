import { FC, useEffect, useState } from "react";
import { formatDistanceStrict, format } from "date-fns";
import { InputField } from "../..";

interface InputGroupProps {
  sequenceNumber: string;
  transactionFee: string;
  numberOfOperations: string;
  numberOfSignatures: string;
  transactionTime: string; // Время транзакции в формате UTC
  
}

const InputGroup: FC<InputGroupProps> = ({
  sequenceNumber,
  transactionFee,
  numberOfOperations,
  numberOfSignatures,


}) => {
  const [currentTime, setCurrentTime] = useState(new Date());


  useEffect(() => {
    // Обновление времени каждую секунду
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  // Форматируем разницу времени

  return (
    <>
      {/* First Row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
        <InputField label="Sequence number" value={sequenceNumber} flex={true} />
        <InputField label="Transaction Fee (stroops)" value={transactionFee} flex={true} />
      </div>

      {/* Second Row */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginTop: "10px" }}>
        <InputField label="Number of operations" value={numberOfOperations} flex={true} />
        <InputField label="Number of existing signatures" value={numberOfSignatures} flex={true} />
      </div>

      
    </>
  );
};

export default InputGroup;
