// script.js

// Toastr configuration
toastr.options = {
    "positionClass": "toast-top-right",
    "timeOut": 3000,
    "closeButton": true,
    "progressBar": true
};

// Mock cryptocurrency data with colors
const cryptoData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 43256.78, change: 2.34, color: '#F7931A' },
    { symbol: 'ETH', name: 'Ethereum', price: 2345.67, change: 1.23, color: '#627EEA' },
    { symbol: 'BNB', name: 'Binance Coin', price: 312.45, change: -0.56, color: '#F3BA2F' },
    { symbol: 'SOL', name: 'Solana', price: 98.76, change: 5.67, color: '#00FFA3' },
    { symbol: 'XRP', name: 'Ripple', price: 0.6234, change: 0.89, color: '#23292F' },
    { symbol: 'ADA', name: 'Cardano', price: 0.4567, change: -1.23, color: '#0033AD' },
    { symbol: 'DOT', name: 'Polkadot', price: 7.89, change: 3.45, color: '#E6007A' },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.1234, change: 8.90, color: '#C2A633' },
    { symbol: 'MATIC', name: 'Polygon', price: 0.9876, change: 2.34, color: '#8247E5' },
    { symbol: 'AVAX', name: 'Avalanche', price: 34.56, change: -0.78, color: '#E84142' }
];

// Initialize crypto ticker
function initializeCryptoTicker() {
    const ticker = document.getElementById('crypto-ticker');
    
    // Create duplicate items for seamless loop
    cryptoData.forEach(crypto => {
        // Create original
        ticker.appendChild(createTickerItem(crypto));
        // Create duplicate for seamless loop
        ticker.appendChild(createTickerItem(crypto));
    });
    
    // Simulate price updates
    setInterval(updatePrices, 3000);
}

function createTickerItem(crypto) {
    const div = document.createElement('div');
    div.className = 'ticker-item';
    div.setAttribute('role', 'listitem');
    
    const changeClass = crypto.change >= 0 ? 'positive' : 'negative';
    const changeSign = crypto.change >= 0 ? '+' : '';
    
    const icon = document.createElement('div');
    icon.className = 'ticker-icon';
    icon.style.backgroundColor = crypto.color;
    icon.textContent = crypto.symbol.charAt(0);
    icon.setAttribute('aria-hidden', 'true');
    
    const symbol = document.createElement('div');
    symbol.className = 'ticker-symbol';
    symbol.textContent = crypto.symbol;
    
    const price = document.createElement('div');
    price.className = 'ticker-price';
    price.textContent = `$${crypto.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    const change = document.createElement('div');
    change.className = `ticker-change ${changeClass}`;
    change.textContent = `${changeSign}${crypto.change.toFixed(2)}%`;
    
    div.appendChild(icon);
    div.appendChild(symbol);
    div.appendChild(price);
    div.appendChild(change);
    
    return div;
}

function updatePrices() {
    document.querySelectorAll('.ticker-item').forEach(item => {
        const priceElem = item.querySelector('.ticker-price');
        const changeElem = item.querySelector('.ticker-change');
        
        if (priceElem && changeElem) {
            const currentPrice = parseFloat(priceElem.textContent.replace('$', '').replace(',', ''));
            const randomChange = (Math.random() - 0.5) * 2; // -1% to +1%
            const newPrice = currentPrice * (1 + randomChange / 100);
            const newChange = parseFloat(changeElem.textContent.replace('+', '').replace('%', '')) + randomChange;
            
            priceElem.textContent = `$${newPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            changeElem.textContent = `${newChange >= 0 ? '+' : ''}${newChange.toFixed(2)}%`;
            changeElem.className = `ticker-change ${newChange >= 0 ? 'positive' : 'negative'}`;
        }
    });
}

// Web3 Wallet Connection
let isConnected = false;
let currentAccount = null;

async function connectWallet() {
    // Check if Web3 is injected (MetaMask)
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
            // Update UI
            document.getElementById('walletInfo').style.display = 'block';
            document.getElementById('walletAddress').textContent = 
                `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
            
            // Get network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const networkName = getNetworkName(chainId);
            document.getElementById('networkName').textContent = networkName;
            
            // Update button
            document.getElementById('connectWalletBtn').innerHTML = 
                '<i class="fas fa-check-circle me-2" aria-hidden="true"></i>Connected';
            document.getElementById('connectWalletBtn').classList.remove('pulse');
            document.getElementById('connectWalletBtn').setAttribute('aria-label', 'Wallet connected');
            
            isConnected = true;
            
            toastr.success('Wallet connected successfully!');
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    disconnectWallet();
                } else {
                    currentAccount = accounts[0];
                    document.getElementById('walletAddress').textContent = 
                        `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
                }
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                const networkName = getNetworkName(chainId);
                document.getElementById('networkName').textContent = networkName;
                toastr.info(`Switched to ${networkName}`);
            });
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            toastr.error('Failed to connect wallet');
        }
    } else {
        toastr.error('Please install MetaMask or another Web3 wallet');
    }
}

function disconnectWallet() {
    isConnected = false;
    currentAccount = null;
    
    // Update UI
    document.getElementById('walletInfo').style.display = 'none';
    document.getElementById('connectWalletBtn').innerHTML = 
        '<i class="fas fa-plug me-2" aria-hidden="true"></i>Connect Wallet';
    document.getElementById('connectWalletBtn').classList.add('pulse');
    document.getElementById('connectWalletBtn').removeAttribute('aria-label');
    
    toastr.info('Wallet disconnected');
}

function getNetworkName(chainId) {
    const networks = {
        '0x1': 'Ethereum Mainnet',
        '0x38': 'Binance Smart Chain',
        '0x89': 'Polygon',
        '0xa86a': 'Avalanche',
        '0xfa': 'Fantom',
        '0xa4b1': 'Arbitrum',
        '0x19': 'Cronos'
    };
    return networks[chainId] || `Network (${chainId})`;
}

// Issue card animations
function setupIssueCards() {
    const cards = document.querySelectorAll('.issue-card');
    cards.forEach((card, index) => {
        // Add delay based on index
        card.style.animationDelay = `${index * 0.05}s`;
        
        // Add click effect
        card.addEventListener('click', (e) => {
            e.currentTarget.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.currentTarget.style.transform = '';
            }, 200);
            
            // Show loading toast
            const issueTitle = e.currentTarget.querySelector('.issue-title').textContent;
            toastr.info(`Redirecting to ${issueTitle} resolution...`);
        });
        
        // Add keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCryptoTicker();
    setupIssueCards();
    
    // Event listeners
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    document.getElementById('disconnectBtn').addEventListener('click', disconnectWallet);
    
    // Chain select change
    document.getElementById('networkSelect').addEventListener('change', (e) => {
        if (e.target.value && isConnected) {
            const selectedOption = e.target.options[e.target.selectedIndex].text;
            toastr.info(`Selected network: ${selectedOption}`);
        }
    });
    
    // Add click effects to all buttons
    document.querySelectorAll('a[href="wallets"]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isConnected && !link.classList.contains('btn-outline')) {
                e.preventDefault();
                toastr.warning('Please connect your wallet first');
                document.getElementById('connectWalletBtn').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Add some visual effects
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.issue-card, .web3-box');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
            card.style.setProperty('--mouse-x', `${x / rect.width * 100}%`);
            card.style.setProperty('--mouse-y', `${y / rect.height * 100}%`);
        }
    });
});

// Add Web3 capabilities
async function getWalletBalance() {
    if (isConnected && typeof window.ethereum !== 'undefined') {
        try {
            const web3 = new Web3(window.ethereum);
            const balance = await web3.eth.getBalance(currentAccount);
            const etherBalance = web3.utils.fromWei(balance, 'ether');
            return parseFloat(etherBalance).toFixed(4);
        } catch (error) {
            console.error('Error getting balance:', error);
            return null;
        }
    }
    return null;
}

// Crypto price API simulation
async function fetchCryptoPrices() {
    // Simulating API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(cryptoData.map(crypto => ({
                ...crypto,
                price: crypto.price * (1 + (Math.random() - 0.5) / 100)
            })));
        }, 1000);
    });
}