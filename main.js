window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('animation-container');
    const elements = document.querySelectorAll('.bouncing-element');
    const elementData = [];
    let score = 0;

    elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const data = {
            el: element,
            width: rect.width,
            height: rect.height,
            x: Math.random() * (container.clientWidth - rect.width),
            y: Math.random() * (container.clientHeight - rect.height),
            vx: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2),
            vy: (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2),
            collisionWidth: rect.width,
            collisionHeight: rect.height,
        };

        if (element.id === 'disc-logo') {
            data.collisionWidth = rect.width * 0.3;
            data.collisionHeight = rect.height * 0.3;
        }

        element.addEventListener('click', () => {
            element.style.display = 'none';
            score++;
            updateScore();
            setTimeout(() => {
                element.style.display = 'block';
                data.x = Math.random() * (container.clientWidth - data.width);
                data.y = Math.random() * (container.clientHeight - data.height);
                data.vx = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
                data.vy = (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2);
            }, 1000);
        });

        elementData.push(data);
    });

    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score-display';
    scoreDisplay.textContent = 'Score: 0';
    container.appendChild(scoreDisplay);

    function updateScore() {
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function animate() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        elementData.forEach((data, index) => {
            if (data.el.style.display === 'none') return;

            data.x += data.vx;
            data.y += data.vy;

            if (data.x <= 0) {
                data.x = 0;
                data.vx = -data.vx;
            } else if (data.x + data.width >= containerWidth) {
                data.x = containerWidth - data.width;
                data.vx = -data.vx;
            }

            if (data.y <= 0) {
                data.y = 0;
                data.vy = -data.vy;
            } else if (data.y + data.height >= containerHeight) {
                data.y = containerHeight - data.height;
                data.vy = -data.vy;
            }

            for (let j = index + 1; j < elementData.length; j++) {
                const other = elementData[j];
                if (other.el.style.display === 'none') continue;
                if (isColliding(data, other)) {
                    [data.vx, other.vx] = [other.vx, data.vx];
                    [data.vy, other.vy] = [other.vy, data.vy];
                }
            }

            data.el.style.transform = `translate(${data.x}px, ${data.y}px)`;
        });

        requestAnimationFrame(animate);
    }

    function isColliding(a, b) {
        return !(
            a.x + a.collisionWidth < b.x ||
            a.x > b.x + b.collisionWidth ||
            a.y + a.collisionHeight < b.y ||
            a.y > b.y + b.collisionHeight
        );
    }

    animate();

    const loginButton = document.getElementById('login-button');
    let accounts = [];
    let web3;

    async function connectMetaMask() {
        if (window.ethereum) {
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                web3 = new Web3(window.ethereum);

                const chainId = await web3.eth.getChainId();
                if (chainId !== 8453) {
                    await switchToBaseNetwork();
                }

                updateLoginStatus(true);
                fetchUserBalance();
                showThanksBalanceSection();
                showScrollingBalance();
            } catch (error) {
                console.error(error);
            }
        } else {
            modal.style.display = 'block';
            modalBody.innerHTML = `
                <h2>No Wallet Detected</h2>
                <p>Please install a wallet to use this feature.</p>
                <p>
                    <a href="https://rabby.io/" target="_blank">Install Rabby</a><br>
                    <a href="https://metamask.io/" target="_blank">Install MetaMask</a>
                </p>
            `;
        }
    }

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

    function showThanksBalanceSection() {
        document.getElementById('thanks-balance-container').style.display = 'block';
    }

    function hideThanksBalanceSection() {
        document.getElementById('thanks-balance-container').style.display = 'none';
    }

    function showScrollingBalance() {
        document.getElementById('scrolling-balance').style.display = 'block';
    }

    function hideScrollingBalance() {
        document.getElementById('scrolling-balance').style.display = 'none';
    }

    loginButton.addEventListener('click', async () => {
        if (accounts.length === 0) {
            await connectMetaMask();
        } else {
            accounts = [];
            web3 = null;
            updateLoginStatus(false);
            document.getElementById('thanks-balance').textContent = 'Connect your wallet to see your balance.';
            hideThanksBalanceSection();
            hideScrollingBalance();
        }
    });

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

        document.getElementById('thanks-balance').textContent = tokenBalance + ' THANKS';
        document.getElementById('balance-display').textContent = `Account: ${accounts[0]} | THANKS Balance: ${tokenBalance}`;
    }

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

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.getElementById('close-modal');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        modalBody.innerHTML = '';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            modalBody.innerHTML = '';
        }
    });

    document.getElementById('tts-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('tts');
    });

    document.getElementById('patreon-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('patreon');
    });

    document.getElementById('discord-link').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('discord');
    });

    function openModal(type) {
        modal.style.display = 'block';

        let contentHTML = '';

        if (type === 'tts') {
            contentHTML = `
                <h2>TTS Donation</h2>
                <p>You can support us via TTS donations on Streamlabs.</p>
                <a href="https://streamlabs.com/willsmusichouse8515/tip" target="_blank">Go to Streamlabs</a>
            `;
        } else if (type === 'patreon') {
            contentHTML = `
                <h2>Support us on Patreon</h2>
                <p>Become a patron to access exclusive content.</p>
                <a href="https://www.patreon.com/willsmusichouse" target="_blank">Go to Patreon</a>
            `;
        } else if (type === 'discord') {
            contentHTML = `
                <h2>Join our Discord Server</h2>
                <p>Connect with us and the community on Discord.</p>
                <a href="https://discord.gg/9UrtGqkK22" target="_blank">Join Discord</a>
            `;
        }

        modalBody.innerHTML = contentHTML;
    }
});
