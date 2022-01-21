import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from './contract.config'

class App extends Component {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    if (window.ethereum) {
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error(error);
      }
    }
    const web3 = new Web3(Web3.givenProvider || "https://rinkeby.infura.io/v3/")
    const rinkeby = (web3.givenProvider.chainId === '0x4')
    this.setState({ rinkeby })
    const accounts = await web3.eth.getAccounts()
    if(accounts.length > 0 && rinkeby) {
      this.setState({ account: accounts[0] })
      const myContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS)
      this.setState({ myContract })
      const releasableAmount = await myContract.methods.releasableAmount().call()
      this.setState({ releasableAmount })
      const beneficiaries = await myContract.methods.beneficiaries(accounts[0]).call()
      this.setState({ beneficiaries })
    }
    this.setState({ loading: false })

    window.ethereum.on("accountsChanged", (accounts) => {
      window.location.reload();
    });
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      rinkeby: false,
      releasableAmount: 0,
      beneficiaries: [],
      myContract: 0,
      loading: true,
      pending: false
    }
    this.release = this.release.bind(this)
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" target="_blank">Welcome | Test</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small><a className="nav-link" href="#"><span id="account"></span></a></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 justify-content-center">
              { !this.state.loading && this.state.rinkeby && (
                <div className="text-center"><p className="text-center"><b>Connected!</b></p></div>
              )}
              { !this.state.loading && this.state.rinkeby && (
                <div className="text-center"><p className="text-center">releasableAmount: {this.state.releasableAmount}</p></div>
              )}
              { !this.state.loading && this.state.rinkeby && (
                <div className="text-center"><p className="text-center"><b>beneficiaries</b></p></div>
              )}
              { !this.state.loading && this.state.rinkeby && (
                <div className="text-center"><p className="text-center">amount: {this.state.beneficiaries.amount}</p></div>
              )}
              { !this.state.loading && this.state.rinkeby && (
                <div className="text-center"><p className="text-center">released: {this.state.beneficiaries.released}</p></div>
              )}
              { !this.state.loading && this.state.rinkeby && (
                <div className="text-center"><p className="text-center">revoked: {this.state.beneficiaries.revoked? "true" : "false"}</p></div>
              )}
              { this.state.loading && (
                <div className="text-center"><p className="text-center">Loading...</p></div>
              )}
              { !this.state.loading && this.state.rinkeby && (
                <div className="text-center"><input type="button" onClick={this.release} value="release" /></div>
              )}           
              { !this.state.loading && !this.state.rinkeby && (
                <div className="text-center"><p className="text-center">Please select Rinkeby test net!</p></div>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  release() {
    // this.setState({ loading: true })
    try{
      this.state.myContract.methods.release().send({ from: this.state.account })
      .on('receipt', (receipt) => {
        this.setState({ loading: true })
        setTimeout(() => {
          window.location.reload();
        }, 10000);        
      })
      .on('error', (error, receipt) => {
        this.setState({ loading: false })
        console.log("error")
      });
    } catch (error) {
        this.setState({ loading: false })
    }
  }
}

export default App;
