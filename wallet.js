window.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    let accounts = [];
    let web3;

    // Function to connect to MetaMask and handle login
    async function connectMetaMask() {
        if (window.ethereum) {
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                web3 = new Web3(window.ethereum);

                const chainId = await web3.eth.getChainId();
                if (chainId !== 8453) {
                    await switchToBaseNetwork();
                }

                // Update login status and fetch balance
                updateLoginStatus(true);
                fetchUserBalance();
                showScrollingBalance();
                showTextSections();  // Ensure this is called after login
                showTopThanksHolders();  // Show top holders after login
            } catch (error) {
                console.error(error);
            }
        } else {
            modal.style.display = 'block';
            modalBody.innerHTML = `
    <h2>No Wallet Detected</h2>
    <p>Please install a wallet to log in and access other features on willsmusichouse.com.</p>
    <p><a href="https://rabby.io/" target="_blank">Install Rabby</a><br>
    <a href="https://metamask.io/" target="_blank">Install MetaMask</a></p>
    <p>For the best mobile login experience, we recommend using <strong><a href="https://www.coinbase.com/wallet" target="_blank">Coinbase Wallet</a></strong>.</p>
`;
        }
    }

    // Function to switch to Base network
    async function switchToBaseNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2105' }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x2105',
                            chainName: 'Base Network',
                            rpcUrls: ['https://mainnet.base.org'],
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            blockExplorerUrls: ['https://basescan.org'],
                        }],
                    });
                } catch (addError) {
                    console.error(addError);
                }
            } else {
                console.error(switchError);
            }
        }
    }

    // Function to update login button and status
    function updateLoginStatus(connected) {
        const statusDot = document.createElement('span');
        statusDot.classList.add('status-dot');
        if (connected) {
            statusDot.classList.add('green-dot');
            loginButton.innerHTML = '';
            loginButton.appendChild(statusDot);
            loginButton.appendChild(document.createTextNode(' Connected'));
        } else {
            statusDot.classList.add('red-dot');
            loginButton.innerHTML = '';
            loginButton.appendChild(statusDot);
            loginButton.appendChild(document.createTextNode(' Log In'));
        }
    }

    // Show/Hide different sections based on wallet connection
    function showScrollingBalance() {
        document.getElementById('scrolling-balance').style.display = 'block';
    }

    function hideScrollingBalance() {
        document.getElementById('scrolling-balance').style.display = 'none';
    }

    function showTextSections() {
        const textSections = document.getElementById('story-sections');
        if (textSections) {
            textSections.style.display = 'block';  // Ensure the stories are shown after login
        }
    }

    function hideTextSections() {
        const textSections = document.getElementById('story-sections');
        if (textSections) {
            textSections.style.display = 'none';  // Ensure the stories are hidden after logout
        }
    }

    function showTopThanksHolders() {
        document.getElementById('thanks-top-holders').style.display = 'block';
    }

    function hideTopThanksHolders() {
        document.getElementById('thanks-top-holders').style.display = 'none';
    }

    // Handle login button click (MetaMask connection)
    loginButton.addEventListener('click', async () => {
        if (accounts.length === 0) {
            await connectMetaMask();
        } else {
            // Reset on logout
            accounts = [];
            web3 = null;
            updateLoginStatus(false);
            hideScrollingBalance();
            hideTextSections();  // Hide the stories after logout
            hideTopThanksHolders();
        }
    });

    // Fetch user's THANKS balance and update display
    async function fetchUserBalance() {
        const contractAddress = '0x819cF7Fa5024EE479D7e55865C149730c808a165';
        const abi = [
            {
                constant: true,
                inputs: [{ name: '_owner', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: 'balance', type: 'uint256' }],
                type: 'function',
            },
            {
                constant: true,
                inputs: [],
                name: 'decimals',
                outputs: [{ name: '', type: 'uint8' }],
                type: 'function',
            },
        ];
        const contract = new web3.eth.Contract(abi, contractAddress);
        const balance = await contract.methods.balanceOf(accounts[0]).call();
        const decimals = await contract.methods.decimals().call();
        const tokenBalance = balance / Math.pow(10, decimals);

        document.getElementById('balance-display').textContent = `Account: ${accounts[0]} | THANKS Balance: ${tokenBalance}`;
    }

    // Handle mouse hover events on login button to show disconnect option
    loginButton.addEventListener('mouseenter', () => {
        if (accounts.length > 0) {
            const statusDot = document.createElement('span');
            statusDot.classList.add('status-dot', 'green-dot');
            loginButton.innerHTML = '';
            loginButton.appendChild(statusDot);
            loginButton.appendChild(document.createTextNode(' Disconnect?'));
        }
    });

    loginButton.addEventListener('mouseleave', () => {
        if (accounts.length > 0) {
            const statusDot = document.createElement('span');
            statusDot.classList.add('status-dot', 'green-dot');
            loginButton.innerHTML = '';
            loginButton.appendChild(statusDot);
            loginButton.appendChild(document.createTextNode(' Connected'));
        }
    });
});
