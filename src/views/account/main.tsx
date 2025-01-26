'use client';
import React, { FC, useEffect, useState } from "react";
import StellarSdk from "stellar-sdk";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/widgets";
import InputTable from "@/widgets/SignTransaction/ui/widgets/InputTable";
import AccountInfo from "./AccountInfo";
import SignTransaction from "../SignTransaction/page";
import Page from "app/public/sign-transaction/page";

const Account: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isValidId, setIsValidId] = useState<boolean | null>(null);
  const params = useSearchParams();
  const id: string | undefined | null = params?.get("id");

  useEffect(() => {
    if (id) setIsValidId(StellarSdk.StrKey.isValidEd25519PublicKey(id));
  }, [id]);

  useEffect(() => {
    if (isValidId === true) {
      setLoading(false);
    }
  }, [isValidId]);

  if (!id || isValidId === null || loading) {
    return (
      <MainLayout>
        <center>
          <h1>Loading...</h1>
        </center>
      </MainLayout>
    );
  }

  if (!id || isValidId === false) {
    return (
      <MainLayout >
        <div className="container">
          <div
            className="search error container narrow"
            style={{ padding: "20px" }}
          >
            <h2 className="text-overflow">Search results for {id}</h2>
            <div>User ID not found or invalid.</div>
          </div>
        </div>
        <Page


        />
      </MainLayout>
    );
  }

  return typeof id === "string" && <AccountInfo ID={id} />;
};

export default Account;
