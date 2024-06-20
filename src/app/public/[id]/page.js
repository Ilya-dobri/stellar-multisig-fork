"use client";

import MainLayout from "@/components/layouts";
import {
    getAccountIssuerInformation,
    getDomainInformation,
    getMainInformation,
} from "@/hook";
import React, { useEffect, useState } from "react";
import "./public.css";

const PublicNet = () => {
    const [account, setAccount] = useState("");

    const [information, setInformation] = useState({});

    const [tabIndex, setTabIndex] = useState(1);

    const [show, setShow] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const pathname = window.location.pathname;
        const accountId = pathname.substring(pathname.lastIndexOf("/") + 1);

        setAccount(accountId);

        return () => {};
    }, []);

    useEffect(() => {
        const handler = async () => {
            setLoading(true);
            if (account != "") {
                const horizonInfo = await getMainInformation(account);
                const accountIssuer = await getAccountIssuerInformation(
                    account
                );

                let tomlInformation = "";

                if (horizonInfo.home_domain != undefined) {
                    tomlInformation = await getDomainInformation(
                        horizonInfo.home_domain
                    );
                }

                const splittedInformation = tomlInformation.split("\n");
                let document = false;
                let documentInfo = {};

                for (let i in splittedInformation) {
                    if (splittedInformation[i] == "[DOCUMENTATION]") {
                        document = true;
                        continue;
                    }

                    if (!document) {
                        continue;
                    }

                    if (splittedInformation[i] == "" && document) {
                        document = false;
                        continue;
                    }

                    const _pattern = splittedInformation[i].split("=");
                    documentInfo[_pattern[0]] = _pattern[1].replace(/"/g, "");
                }

                setInformation({
                    home_domain: horizonInfo.home_domain,
                    created_at: horizonInfo.last_modified_time,
                    thresholds: horizonInfo.thresholds,
                    flags: horizonInfo.flags,
                    signers: horizonInfo.signers,
                    entries: horizonInfo.data_attr,
                    balances: horizonInfo.balances,
                    meta_data: documentInfo,
                    issuers: accountIssuer.records,
                    tomlInfo: tomlInformation,
                });
            }
            setLoading(false);
        };
        handler();
    }, [account]);

    const collapseAccount = (accountId) => {
        if (accountId == "" || accountId == null || accountId == undefined) {
            return <br />;
        }
        const first4Str = accountId.substring(0, 4);
        const last4Str = accountId.substr(-4);
        return first4Str + "..." + last4Str;
    };

    return (
        <MainLayout>
            <div className="container">
                <div className="account-view">
                    {loading ? (
                        "Loading..."
                    ) : (
                        <h2 className="word-break relative condensed">
                            <span className="dimmed">Account&nbsp;&nbsp;</span>
                            <span className="account-address plain">
                                <span className="account-key">{account}</span>
                            </span>
                            <div className="row space">
                                <div className="column column-50">
                                    <div className="segment blank">
                                        <h3>Summary</h3>
                                        <hr className="flare"></hr>
                                        <dl>
                                            <dt>Home domain:</dt>
                                            <dd>
                                                <a
                                                    href={`${
                                                        information?.home_domain ==
                                                        undefined
                                                            ? "#"
                                                            : information?.home_domain
                                                    }`}
                                                    rel="noreferrer noopener"
                                                    target="_blank"
                                                >
                                                    {information?.home_domain ==
                                                    undefined
                                                        ? "None"
                                                        : information?.home_domain}
                                                </a>
                                                <i className="trigger icon info-tooltip small icon-help">
                                                    <div
                                                        className="tooltip-wrapper"
                                                        style={{
                                                            maxWidth: "20em",
                                                            left: "-193px",
                                                            top: "-142px",
                                                        }}
                                                    >
                                                        <div className="tooltip top">
                                                            <div className="tooltip-content">
                                                                A domain name
                                                                that can
                                                                optionally be
                                                                added to the
                                                                account. Clients
                                                                can look up a
                                                                stellar.toml
                                                                from this
                                                                domain. The
                                                                federation
                                                                procol can use
                                                                the home domain
                                                                to look up more
                                                                details about a
                                                                transaction’s
                                                                memo or address
                                                                details about an
                                                                account.
                                                                <a
                                                                    href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#home-domain"
                                                                    className="info-tooltip-link"
                                                                    target="_blank"
                                                                >
                                                                    Read more…
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </i>
                                            </dd>
                                            <dt>Account lock status:</dt>
                                            <dd>
                                                unlocked
                                                <i className="trigger icon info-tooltip small icon-help">
                                                    <div
                                                        className="tooltip-wrapper"
                                                        style={{
                                                            maxWidth: "20em",
                                                            left: "-193px",
                                                            top: "-105px",
                                                        }}
                                                    >
                                                        <div className="tooltip top">
                                                            <div className="tooltip-content">
                                                                The account is
                                                                unlocked, all
                                                                operations are
                                                                permitted,
                                                                including
                                                                payments,
                                                                trades, settings
                                                                changes, and
                                                                assets issuing.
                                                                <a
                                                                    href="https://www.stellar.org/developers/guides/concepts/operations.html#thresholds"
                                                                    className="info-tooltip-link"
                                                                    target="_blank"
                                                                >
                                                                    Read more…
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </i>
                                            </dd>
                                            <dt>Operation thresholds:</dt>
                                            <dd>
                                                <span title="Low threshold">
                                                    {
                                                        information?.thresholds
                                                            ?.low_threshold
                                                    }
                                                </span>{" "}
                                                /
                                                <span title="Medium threshold">
                                                    {" "}
                                                    {
                                                        information?.thresholds
                                                            ?.med_threshold
                                                    }
                                                </span>{" "}
                                                /
                                                <span title="High threshold">
                                                    {" "}
                                                    {
                                                        information?.thresholds
                                                            ?.high_threshold
                                                    }
                                                </span>
                                                <i className="trigger icon info-tooltip small icon-help">
                                                    <div
                                                        className="tooltip-wrapper"
                                                        style={{
                                                            maxWidth: "20em",
                                                            left: "-193px",
                                                            top: "-86px",
                                                        }}
                                                    >
                                                        <div className="tooltip top">
                                                            <div className="tooltip-content">
                                                                This field
                                                                specifies
                                                                thresholds for
                                                                low-, medium-,
                                                                and high-access
                                                                level
                                                                operations.
                                                                <a
                                                                    href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#thresholds"
                                                                    className="info-tooltip-link"
                                                                    target="_blank"
                                                                >
                                                                    Read more…
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </i>
                                            </dd>
                                            <dt>Asset authorization flags:</dt>
                                            <dd>
                                                {information?.flags
                                                    ?.auth_required == true
                                                    ? "required, "
                                                    : ""}
                                                {information?.flags
                                                    ?.auth_revocable == true
                                                    ? "revocable, "
                                                    : ""}
                                                {information?.flags
                                                    ?.auth_clawback_enabled ==
                                                true
                                                    ? "clawback_enabled, "
                                                    : ""}
                                                {information?.flags
                                                    ?.auth_immutable == true
                                                    ? "immutable, "
                                                    : ""}
                                                {information?.flags
                                                    ?.auth_required == false &&
                                                information?.flags
                                                    ?.auth_revocable == false &&
                                                information?.flags
                                                    ?.auth_clawback_enabled ==
                                                    false &&
                                                information?.flags
                                                    ?.auth_immutable == false
                                                    ? "None"
                                                    : ""}

                                                <i className="trigger icon info-tooltip small icon-help">
                                                    <div
                                                        className="tooltip-wrapper"
                                                        style={{
                                                            maxWidth: "20em",
                                                            left: "-193px",
                                                            top: "-256px",
                                                        }}
                                                    >
                                                        <div className="tooltip top">
                                                            <div className="tooltip-content">
                                                                <ul>
                                                                    <li>
                                                                        <code>
                                                                            AUTH_REQUIRED
                                                                        </code>{" "}
                                                                        Requires
                                                                        the
                                                                        issuing
                                                                        account
                                                                        to give
                                                                        other
                                                                        accounts
                                                                        permission
                                                                        before
                                                                        they can
                                                                        hold the
                                                                        issuing
                                                                        account’s
                                                                        credit.
                                                                    </li>
                                                                    <li>
                                                                        <code>
                                                                            AUTH_REVOCABLE
                                                                        </code>{" "}
                                                                        Allows
                                                                        the
                                                                        issuing
                                                                        account
                                                                        to
                                                                        revoke
                                                                        its
                                                                        credit
                                                                        held by
                                                                        other
                                                                        accounts.
                                                                    </li>
                                                                    <li>
                                                                        <code>
                                                                            AUTH_CLAWBACK_ENABLED
                                                                        </code>{" "}
                                                                        Allows
                                                                        the
                                                                        issuing
                                                                        account
                                                                        to
                                                                        clawback
                                                                        tokens
                                                                        without
                                                                        the
                                                                        account
                                                                        consent
                                                                        in case
                                                                        of
                                                                        service
                                                                        terms
                                                                        violation.
                                                                    </li>
                                                                    <li>
                                                                        <code>
                                                                            AUTH_IMMUTABLE
                                                                        </code>{" "}
                                                                        If set
                                                                        then
                                                                        none of
                                                                        the
                                                                        authorization
                                                                        flags
                                                                        can be
                                                                        set and
                                                                        the
                                                                        account
                                                                        can
                                                                        never be
                                                                        deleted.
                                                                    </li>
                                                                </ul>
                                                                <a
                                                                    href="https://www.stellar.org/developers/guides/concepts/accounts.html#flags"
                                                                    className="info-tooltip-link"
                                                                    target="_blank"
                                                                >
                                                                    Read more…
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </i>
                                            </dd>
                                        </dl>
                                        <div className="account-issued-assets">
                                            <h4 style={{ marginBottom: "0px" }}>
                                                Assets Issued by this Account
                                                <i className="trigger icon info-tooltip small icon-help">
                                                    <div
                                                        className="tooltip-wrapper"
                                                        style={{
                                                            maxWidth: "20em",
                                                            left: "-193px",
                                                            top: "-86px",
                                                        }}
                                                    >
                                                        <div className="tooltip top">
                                                            <div className="tooltip-content">
                                                                An account can
                                                                issue custom
                                                                Stellar assets.
                                                                Any asset on the
                                                                network can be
                                                                traded and
                                                                exchanged with
                                                                any other.
                                                                <a
                                                                    href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/assets"
                                                                    className="info-tooltip-link"
                                                                    target="_blank"
                                                                >
                                                                    Read more…
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </i>
                                            </h4>
                                            <div className="text-small">
                                                <ul>
                                                    {information?.issuers?.map(
                                                        (issuer, key) => {
                                                            if (
                                                                issuer.amount ==
                                                                0
                                                            )
                                                                return;
                                                            return (
                                                                <li key={key}>
                                                                    <a
                                                                        aria-label={
                                                                            issuer.paging_token
                                                                        }
                                                                        className="asset-link"
                                                                        href="#"
                                                                    >
                                                                        <span
                                                                            className="asset-icon"
                                                                            style={{
                                                                                backgroundImage:
                                                                                    'url("https://ipfs.io/ipfs/bafkreidkhoqgjf42z3jxjd7wqgxy47vulncpnr5wdlib5pbb3inklcipzy")',
                                                                            }}
                                                                        ></span>
                                                                        {
                                                                            issuer.asset_code
                                                                        }
                                                                    </a>
                                                                    &nbsp;
                                                                    <span className="">
                                                                        (
                                                                        {
                                                                            issuer
                                                                                .accounts
                                                                                .authorized
                                                                        }{" "}
                                                                        trustlines)
                                                                    </span>
                                                                </li>
                                                            );
                                                        }
                                                    )}
                                                </ul>
                                                {information?.issuers?.length >
                                                0 ? (
                                                    <a
                                                        href="#"
                                                        className=""
                                                        onClick={() => {
                                                            setShow(!show);
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                borderBottom:
                                                                    "1px dotted",
                                                            }}
                                                        >
                                                            Hide assets with
                                                            zero supply
                                                        </span>
                                                        <i className="icon angle double down vtop"></i>
                                                    </a>
                                                ) : (
                                                    <></>
                                                )}
                                                {show && (
                                                    <ul>
                                                        {information?.issuers?.map(
                                                            (issuer, key) => {
                                                                if (
                                                                    issuer.amount !=
                                                                    0
                                                                )
                                                                    return;
                                                                return (
                                                                    <li
                                                                        key={
                                                                            key
                                                                        }
                                                                    >
                                                                        <a
                                                                            aria-label={
                                                                                issuer.paging_token
                                                                            }
                                                                            className="asset-link"
                                                                            href="#"
                                                                        >
                                                                            <span
                                                                                className="asset-icon"
                                                                                style={{
                                                                                    backgroundImage:
                                                                                        'url("https://ipfs.io/ipfs/bafkreig7wvit3ottowoopyizrvhqx6it6lksx4yqyyevahirli27fb4lb4")',
                                                                                }}
                                                                            ></span>
                                                                            {
                                                                                issuer.asset_code
                                                                            }
                                                                        </a>
                                                                        &nbsp;
                                                                        <span className="">
                                                                            (
                                                                            {
                                                                                issuer
                                                                                    .accounts
                                                                                    .authorized
                                                                            }{" "}
                                                                            trustlines)
                                                                        </span>
                                                                    </li>
                                                                );
                                                            }
                                                        )}
                                                    </ul>
                                                )}
                                                <ul></ul>
                                            </div>
                                        </div>
                                        <h4 style={{ marginBottom: "0px" }}>
                                            Account Signers
                                            <i className="trigger icon info-tooltip small icon-help">
                                                <div
                                                    className="tooltip-wrapper"
                                                    style={{
                                                        maxWidth: "20em",
                                                        left: "0px",
                                                        top: "0px",
                                                    }}
                                                >
                                                    <div className="tooltip top">
                                                        <div className="tooltip-content">
                                                            Used for multi-sig.
                                                            This field lists
                                                            other public keys
                                                            and their weights,
                                                            which can be used to
                                                            authorize
                                                            transactions for
                                                            this account.
                                                            <a
                                                                href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#signers"
                                                                className="info-tooltip-link"
                                                                target="_blank"
                                                            >
                                                                Read more…
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </i>
                                        </h4>
                                        <ul className="text-small condensed">
                                            {information?.signers?.map(
                                                (item, index) => {
                                                    return (
                                                        <li key={index}>
                                                            <a
                                                                title={item.key}
                                                                aria-label={
                                                                    item.key
                                                                }
                                                                className="account-address word-break"
                                                                href={`/public/${item.key}`}
                                                            >
                                                                <img
                                                                    className="identicon"
                                                                    src='data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 448" fill="hsl(18,58%,52%)"><rect x="128" y="0" width="64" height="64"/><rect x="256" y="0" width="64" height="64"/><rect x="192" y="0" width="64" height="64"/><rect x="192" y="0" width="64" height="64"/><rect x="0" y="64" width="64" height="64"/><rect x="384" y="64" width="64" height="64"/><rect x="64" y="64" width="64" height="64"/><rect x="320" y="64" width="64" height="64"/><rect x="128" y="64" width="64" height="64"/><rect x="256" y="64" width="64" height="64"/><rect x="192" y="64" width="64" height="64"/><rect x="192" y="64" width="64" height="64"/><rect x="128" y="128" width="64" height="64"/><rect x="256" y="128" width="64" height="64"/><rect x="192" y="128" width="64" height="64"/><rect x="192" y="128" width="64" height="64"/><rect x="64" y="192" width="64" height="64"/><rect x="320" y="192" width="64" height="64"/><rect x="128" y="192" width="64" height="64"/><rect x="256" y="192" width="64" height="64"/><rect x="64" y="256" width="64" height="64"/><rect x="320" y="256" width="64" height="64"/><rect x="192" y="320" width="64" height="64"/><rect x="192" y="320" width="64" height="64"/><rect x="0" y="384" width="64" height="64"/><rect x="384" y="384" width="64" height="64"/><rect x="64" y="384" width="64" height="64"/><rect x="320" y="384" width="64" height="64"/><rect x="128" y="384" width="64" height="64"/><rect x="256" y="384" width="64" height="64"/></svg>'
                                                                    width="448"
                                                                    height="448"
                                                                />
                                                                <span className="">
                                                                    {collapseAccount(
                                                                        item.key
                                                                    )}
                                                                </span>
                                                            </a>{" "}
                                                            (w:
                                                            <b>{item.weight}</b>
                                                            )
                                                        </li>
                                                    );
                                                }
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <div className="column column-50">
                                    <div className="segment blank">
                                        <h3>
                                            Account Balances
                                            <i className="trigger icon info-tooltip small icon-help">
                                                <div
                                                    className="tooltip-wrapper"
                                                    style={{
                                                        maxWidth: "20em",
                                                        left: "0px",
                                                        top: "0px",
                                                    }}
                                                >
                                                    <div className="tooltip top">
                                                        <div className="tooltip-content">
                                                            The number of lumens
                                                            and other assets
                                                            held by the account.
                                                            <a
                                                                href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#balance"
                                                                className="info-tooltip-link"
                                                                target="_blank"
                                                            >
                                                                Read more…
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </i>
                                        </h3>
                                        <hr className="flare"></hr>
                                        <div className="all-account-balances micro-space text-header">
                                            {information?.balances?.map(
                                                (item, key) => {
                                                    const totalInfo =
                                                        item.balance.split(".");
                                                    const number = totalInfo[0];
                                                    const decimal =
                                                        Number(totalInfo[1]) ==
                                                        0
                                                            ? ""
                                                            : "." +
                                                              totalInfo[1];

                                                    return (
                                                        <a
                                                            href="#"
                                                            key={key}
                                                            className="account-balance"
                                                        >
                                                            <div className="condensed">
                                                                {number}
                                                                <span className="text-small">
                                                                    {decimal}
                                                                </span>
                                                            </div>
                                                            <div className="text-tiny condensed">
                                                                <div>
                                                                    {collapseAccount(
                                                                        item.asset_issuer
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-small">
                                                                <span
                                                                    aria-label={
                                                                        item.asset_issuer
                                                                    }
                                                                    className="asset-link"
                                                                >
                                                                    {/* <span className="asset-icon icon icon-stellar"></span> */}
                                                                    {item.asset_code ==
                                                                    undefined
                                                                        ? "XLM"
                                                                        : item.asset_code}
                                                                </span>
                                                            </span>
                                                        </a>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="toml-props">
                                <div className="tabs space inline-right">
                                    <div className="tabs-header">
                                        <div>
                                            <a
                                                href="#"
                                                className="tabs-item condensed selected"
                                                onClick={() => {
                                                    setTabIndex(1);
                                                }}
                                            >
                                                <span className="tabs-item-text">
                                                    Organization
                                                </span>
                                            </a>
                                            <a
                                                href="#"
                                                onClick={() => {
                                                    setTabIndex(2);
                                                }}
                                                className="tabs-item condensed"
                                            >
                                                <span className="tabs-item-text">
                                                    TOML code
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                    <hr className="flare"></hr>
                                    <div className="tabs-body">
                                        {tabIndex == 1 ? (
                                            <div className="segment blank">
                                                {information?.meta_data ||
                                                information?.meta_data ==
                                                    undefined ? null : (
                                                    <dl className="micro-space">
                                                        <dt>Org name:</dt>
                                                        <dd>
                                                            <span
                                                                className="block-select"
                                                                tabIndex="-1"
                                                                style={{
                                                                    whiteSpace:
                                                                        "normal",
                                                                    overflow:
                                                                        "visible",
                                                                    display:
                                                                        "inline",
                                                                }}
                                                            >
                                                                {information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_NAME"
                                                                    ]}
                                                            </span>
                                                        </dd>
                                                        <dt>Org url:</dt>
                                                        <dd>
                                                            <a
                                                                href={
                                                                    information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_URL"
                                                                    ]
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer noopener"
                                                            >
                                                                {information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_URL"
                                                                    ]}
                                                            </a>
                                                        </dd>
                                                        <dt>Org logo:</dt>
                                                        <dd>
                                                            <a
                                                                href={
                                                                    information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_LOGO"
                                                                    ]
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer noopener"
                                                            >
                                                                {information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_LOGO"
                                                                    ]}
                                                            </a>
                                                        </dd>
                                                        <dt>
                                                            Org description:
                                                        </dt>
                                                        <dd>
                                                            <span
                                                                className="block-select"
                                                                tabIndex="-1"
                                                                style={{
                                                                    whiteSpace:
                                                                        "normal",
                                                                    overflow:
                                                                        "visible",
                                                                    display:
                                                                        "inline",
                                                                }}
                                                            >
                                                                {information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_DESCRIPTION"
                                                                    ]}
                                                            </span>
                                                        </dd>
                                                        <dt>
                                                            Org physical
                                                            address:
                                                        </dt>
                                                        <dd>
                                                            <span
                                                                className="block-select"
                                                                tabIndex="-1"
                                                                style={{
                                                                    whiteSpace:
                                                                        "normal",
                                                                    overflow:
                                                                        "visible",
                                                                    display:
                                                                        "inline",
                                                                }}
                                                            >
                                                                {information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_PHYSICAL_ADDRESS"
                                                                    ]}
                                                            </span>
                                                        </dd>
                                                        <dt>
                                                            Org official email:
                                                        </dt>
                                                        <dd>
                                                            <a
                                                                href={`mailto:${
                                                                    information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_OFFICIAL_EMAIL"
                                                                    ]
                                                                }`}
                                                                target="_blank"
                                                                rel="noreferrer noopener"
                                                            >
                                                                {information?.meta_data &&
                                                                    information
                                                                        ?.meta_data[
                                                                        "ORG_OFFICIAL_EMAIL"
                                                                    ]}
                                                            </a>
                                                        </dd>
                                                    </dl>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <pre
                                                    className="hljs"
                                                    style={{
                                                        maxHeight: "80vh",
                                                    }}
                                                >
                                                    {information?.tomlInfo
                                                        ?.split("\n")
                                                        ?.map(
                                                            (toml, keyinfo) => {
                                                                if (
                                                                    toml ==
                                                                        null ||
                                                                    toml.startsWith(
                                                                        "#"
                                                                    )
                                                                ) {
                                                                    return;
                                                                }
                                                                if (
                                                                    toml.indexOf(
                                                                        "="
                                                                    ) > 0
                                                                ) {
                                                                    const patterns =
                                                                        toml.split(
                                                                            "="
                                                                        );
                                                                    const key_pattern =
                                                                        patterns[0];
                                                                    const value_pattern =
                                                                        patterns[1];
                                                                    return (
                                                                        <React.Fragment
                                                                            key={
                                                                                keyinfo
                                                                            }
                                                                        >
                                                                            <span className="hljs-attr">
                                                                                {
                                                                                    key_pattern
                                                                                }
                                                                            </span>{" "}
                                                                            ={" "}
                                                                            <span className="hljs-string">
                                                                                {
                                                                                    value_pattern
                                                                                }
                                                                            </span>
                                                                            <br />
                                                                        </React.Fragment>
                                                                    );
                                                                } else {
                                                                    if (
                                                                        toml.startsWith(
                                                                            "["
                                                                        )
                                                                    )
                                                                        return (
                                                                            <React.Fragment
                                                                                key={
                                                                                    keyinfo
                                                                                }
                                                                            >
                                                                                <span className="hljs-section">
                                                                                    {
                                                                                        toml
                                                                                    }
                                                                                </span>
                                                                                <br />
                                                                            </React.Fragment>
                                                                        );
                                                                    else {
                                                                        return (
                                                                            <React.Fragment
                                                                                key={
                                                                                    keyinfo
                                                                                }
                                                                            >
                                                                                <span className="hljs-string">
                                                                                    {
                                                                                        toml
                                                                                    }
                                                                                </span>
                                                                                <br />
                                                                            </React.Fragment>
                                                                        );
                                                                    }
                                                                }
                                                            }
                                                        )}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </h2>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default PublicNet;
