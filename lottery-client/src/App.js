import React from 'react';
import { useEffect, useState } from "react";
import './App.css';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { loadContract } from './utils/load-contract';

const App = () => {

  const [web3Api, setweb3Api] = useState({
    provider: null,
    web3: null,
    contract: null
  });

  const [account, setAccount] = useState(null);
  const [winnersaccount, setWinnersAccount] = useState(null);
  const [managersAddress, setManagersAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [reload, shouldReload] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(null);

  const reloadEffect = () => {
    shouldReload(!reload);
  }

  useEffect(() => {
    const loadProvider = async () => {

      const provider = await detectEthereumProvider();
      const contract = await loadContract("Lottery", provider);

      if (provider) {
        provider.request({ method: "eth_requestAccounts" });
        setweb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })
      }
      else {
        console.error("Please install Metamask!");
      }

    }

    loadProvider();

  }, [])

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      // const balance = await web3.eth.getBalance(contract.address);
      const balance = await contract.getBalance();
      setBalance(web3.utils.fromWei(balance, 'ether'))
    }

    web3Api.contract && loadBalance();

  }, [web3Api, reload])


  useEffect(() => {
    const loadManagersAccount = async () => {
      const { contract } = web3Api;
      const managersAddress = await contract.manager();
      setManagersAddress(managersAddress);
    }

    web3Api.contract && loadManagersAccount();

  }, [web3Api])

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();

      setAccount(accounts[0]);
    }

    web3Api.web3 && getAccount();

  }, [web3Api])

  window.ethereum.on('accountsChanged', () => {
    window.location.reload();
  });

  useEffect(() => {
    const totalPlayer = async () => {
      const { contract } = web3Api;
      const participantsCount = await contract.totalParticipants();
      // console.log(participantsCount.words[0]);
      setParticipantsCount(participantsCount.words[0]);
    }

    web3Api.contract && totalPlayer();

  }, [web3Api, reload])

  const transferFund = async () => {
    const { contract, web3 } = web3Api;
    await contract.transfer({
      from: account,
      value: web3.utils.toWei("2", "ether")
    })
    reloadEffect();
  }

  const setWinner = async () => {
    const { contract } = web3Api;
    await contract.selectWinner({
      from: account
    })
    const winnersaccount = await contract.winner();
    setWinnersAccount(winnersaccount);
    reloadEffect();
  }


  return (
    <>
      <div className="card text-center">
        <div className="card-header">Lottery</div>
        <div className="card-body">
          <p className="card-text">Manager's Account : {managersAddress ? managersAddress : `Not Connected`}</p>
          <h5 className="card-title">Lottery amount required: 2 ETH </h5>
          <h5 className="card-title">Total Participants: {participantsCount ? participantsCount : "No Participants"} </h5>
          <h5 className="card-title">Total Contract Balance: {balance} ETH </h5>
          <p className="card-text">Metamask's Account : {account ? account : `No Account or Not Connected`}</p>
          &nbsp;
          <button type="button" className="btn btn-success" onClick={transferFund}>
            Transfer
          </button>
          &nbsp;
          <button type="button" className="btn btn-primary" onClick={setWinner}>
            Winner
          </button>
          &nbsp;
          <p className="card-text">Winner's Account : {winnersaccount ? winnersaccount : `Winner yet to be selecteed`}</p>
        </div>
        <div className="card-footer text-muted">Mehul Sarda</div>
      </div>
    </>
  );
}

export default App;
