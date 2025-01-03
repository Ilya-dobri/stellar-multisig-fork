import React, { FC, useEffect, useState } from "react";
import s from "@/widgets/OperationTypes/index.module.scss";

export interface IFlag {
  id: number;
  name: string;
  points: number;
}

interface FlagSelectorProps {
  title: string;
  flags: IFlag[];
  selectedFlagsBitmask: number; 
  onToggle: (flagId: number) => void;
  operationIndex: number;
}

const FlagSelector: FC<FlagSelectorProps> = ({
  title,
  operationIndex,
  flags,
  selectedFlagsBitmask,
  onToggle,
}) => {
  const [currentFlags, setCurrentFlags] = useState<number>(selectedFlagsBitmask);


  const isSelected = (flagId: number) => (currentFlags & (1 << flagId)) !== 0;


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flagParam = title === "Set Flags" ? `SetFlags${operationIndex}` : `ClearFlags${operationIndex}`;


    const flagFromUrl = params.get(flagParam);
    if (flagFromUrl) {
      setCurrentFlags(parseInt(flagFromUrl, 10));
    }
  }, [operationIndex, title]);

  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flagParam = title === "Set Flags" ? `SetFlags${operationIndex}` : `ClearFlags${operationIndex}`;
  
    if (currentFlags !== 0) {
      params.set(flagParam, currentFlags.toString()); 
    } else {
      params.delete(flagParam); 
    }
  
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [currentFlags, operationIndex, title]);


  
  const totalPoints = flags.reduce((sum, flag) => {
    return sum + (isSelected(flag.id) ? flag.points : 0);
  }, 0);

  return (
    <div className={s.section}>
      <h4 className={s.sectionTitle}>
        {title} <span className={s.optional}>(optional)</span>
      </h4>
      <div className={`tabs ${s.tabs}`}>
        <div className={`tabs-header ${s.tabsheader}`}>
          <div className={s.flagsContainer}>
            <div className={s.flags}>
              {flags.map((flag) => (
                <a
                  key={flag.id}
                  onClick={(e) => {
                    e.preventDefault();
                    const newFlags = isSelected(flag.id)
                      ? currentFlags & ~(1 << flag.id)  
                      : currentFlags | (1 << flag.id); 

                    setCurrentFlags(newFlags);  
                    onToggle(flag.id);  
                  }}
                  className={`tabs-item ${s.tabsitem} condensed ${isSelected(flag.id) ? "selected" : ""}`}
                  style={{ cursor: "pointer", width: "140px", height: "90%", textDecoration: "none", flexWrap: "nowrap" }}
                  href="#"
                >
                  <span className="tabs-item-text" style={{ fontSize: "100%", border: "none" }}>
                    {flag.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
        {currentFlags !== 0 && (
          <p>
            {flags.map((flag, index) => {
              return isSelected(flag.id) ? (
                <React.Fragment key={flag.id}>
                  {index > 0 && " + "}
                  <span>
                    {flag.name} ({flag.points})
                  </span>
                </React.Fragment>
              ) : null;
            })}{" "}
            = {totalPoints}
          </p>
        )}
        <p>
          Selected{" "}
          <a href="https://en.wikipedia.org/wiki/Bit_field" target="_blank" rel="noopener noreferrer">
            flags
          </a>{" "}
          mean to {title.includes("Set") ? "add" : "remove"} selected flags{" "}
          {title.includes("Set") ? "in addition to" : "from"} flags already present on the account.
        </p>
      </div>
    </div>
  );
};

export default FlagSelector;
