document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const homeSection = document.getElementById('home-section');
    const transferSection = document.getElementById('transfer-section');
    const paymentSection = document.getElementById('payment-section');
    const confirmationSection = document.getElementById('confirmation-section');
    const adminSection = document.getElementById('admin-section');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    
    // Navigation Links
    document.getElementById('home-link').addEventListener('click', showHome);
    document.getElementById('transfer-link').addEventListener('click', showTransferForm);
    document.getElementById('admin-link').addEventListener('click', showAdminLogin);
    document.getElementById('send-money-btn').addEventListener('click', showTransferForm);
    document.getElementById('new-transfer').addEventListener('click', showTransferForm);
    
    // Transfer Form Elements
    const transferForm = document.getElementById('transfer-form');
    const destinationSelect = document.getElementById('destination');
    const transferMethodSelect = document.getElementById('transfer-method');
    const receiverDetails = document.getElementById('receiver-details');
    const amountInput = document.getElementById('amount');
    const feeDisplay = document.getElementById('fee');
    const totalDisplay = document.getElementById('total');
    const receiverAmountDisplay = document.getElementById('receiver-amount');
    const receiverCurrencyDisplay = document.getElementById('receiver-currency');
    const ratesDisplay = document.getElementById('rates-display');
    
    // Payment Elements
    const confirmPaymentBtn = document.getElementById('confirm-payment');
    
    // Admin Elements
    const loginBtn = document.getElementById('login-btn');
    const ratesForm = document.getElementById('rates-form');
    const statusFilter = document.getElementById('status-filter');
    const exportBtn = document.getElementById('export-btn');
    const transactionsList = document.getElementById('transactions-list');
    
    // Exchange Rates (initial values)
    let exchangeRates = {
        Rwanda: 3600,
        Uganda: 900,
        Tanzania: 6200,
        Burundi: 500,
        DRC: 2.3,
        Kenya: 300.44
    };
    
    // Transactions Data
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Admin Credentials (in a real app, this would be server-side)
    const adminCredentials = {
        username: 'admin',
        password: 'admin123'
    };
    
    // Initialize the app
    function init() {
        showHome();
        displayRates();
        loadTransactions();
        
        // Load rates from localStorage if available
        const savedRates = JSON.parse(localStorage.getItem('exchangeRates'));
        if (savedRates) {
            exchangeRates = savedRates;
            displayRates();
        }
    }
    
    // Navigation Functions
    function showHome() {
        hideAllSections();
        homeSection.classList.remove('hidden');
    }
    
    function showTransferForm() {
        hideAllSections();
        transferSection.classList.remove('hidden');
        // Reset form
        transferForm.reset();
        receiverDetails.innerHTML = '';
        updateCalculations();
    }
    
    function showPaymentInstructions() {
        hideAllSections();
        paymentSection.classList.remove('hidden');
    }
    
    function showConfirmation() {
        hideAllSections();
        confirmationSection.classList.remove('hidden');
    }
    
    function showAdminLogin() {
        hideAllSections();
        adminSection.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
    
    function showAdminPanel() {
        loginForm.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadTransactions();
    }
    
    function hideAllSections() {
        homeSection.classList.add('hidden');
        transferSection.classList.add('hidden');
        paymentSection.classList.add('hidden');
        confirmationSection.classList.add('hidden');
        adminSection.classList.add('hidden');
    }
    
    // Display Exchange Rates
    function displayRates() {
        ratesDisplay.innerHTML = '';
        
        for (const country in exchangeRates) {
            const rateItem = document.createElement('div');
            rateItem.className = 'rate-item';
            
            const countrySpan = document.createElement('span');
            countrySpan.className = 'country';
            countrySpan.textContent = `${country} ${getCountryFlag(country)}`;
            
            const rateSpan = document.createElement('span');
            rateSpan.className = 'rate';
            rateSpan.textContent = `1 RIAL = ${exchangeRates[country]} ${getCurrencyCode(country)}`;
            
            rateItem.appendChild(countrySpan);
            rateItem.appendChild(document.createElement('br'));
            rateItem.appendChild(rateSpan);
            
            ratesDisplay.appendChild(rateItem);
        }
    }
    
    function getCurrencyCode(country) {
        switch(country) {
            case 'Rwanda': return 'RWF';
            case 'Uganda': return 'UGX';
            case 'Tanzania': return 'TZS';
            case 'Burundi': return 'BIF';
            case 'DRC': return 'USD';
            case 'Kenya': return 'KES';
            default: return '';
        }
    }
    
    function getCountryFlag(country) {
        const flags = {
            'Rwanda': '🇷🇼',
            'Uganda': '🇺🇬',
            'Tanzania': '🇹🇿',
            'Burundi': '🇧🇮',
            'DRC': '🇨🇩',
            'Kenya': '🇰🇪'
        };
        return flags[country] || '';
    }
    
    // Handle Transfer Method Selection
    transferMethodSelect.addEventListener('change', function() {
        const method = this.value;
        receiverDetails.innerHTML = '';
        
        if (method === 'mobile') {
            receiverDetails.innerHTML = `
                <div class="input-group">
                    <label for="receiver-name">Receiver Full Name</label>
                    <input type="text" id="receiver-name" required>
                </div>
                <div class="input-group">
                    <label for="receiver-phone">Receiver Contact Number</label>
                    <input type="tel" id="receiver-phone" required>
                </div>
            `;
        } else if (method === 'bank') {
            receiverDetails.innerHTML = `
                <div class="input-group">
                    <label for="bank-name">Bank Name</label>
                    <input type="text" id="bank-name" required>
                </div>
                <div class="input-group">
                    <label for="account-name">Account Holder Name</label>
                    <input type="text" id="account-name" required>
                </div>
                <div class="input-group">
                    <label for="account-number">Account Number</label>
                    <input type="text" id="account-number" required>
                </div>
            `;
        }
    });
    
    // Handle Destination Selection
    destinationSelect.addEventListener('change', updateCalculations);
    amountInput.addEventListener('input', updateCalculations);
    
    function updateCalculations() {
        const destination = destinationSelect.value;
        const amount = parseFloat(amountInput.value) || 0;
        const fee = 2; // Fixed fee
        
        if (destination && amount > 0) {
            const rate = exchangeRates[destination];
            const total = amount + fee;
            const receiverAmount = amount * rate;
            
            totalDisplay.textContent = total.toFixed(2);
            receiverAmountDisplay.textContent = receiverAmount.toFixed(2);
            receiverCurrencyDisplay.textContent = getCurrencyCode(destination);
        } else {
            totalDisplay.textContent = '0';
            receiverAmountDisplay.textContent = '0';
            receiverCurrencyDisplay.textContent = '';
        }
    }
    
    // Handle Transfer Form Submission
    transferForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const destination = destinationSelect.value;
        const amount = parseFloat(amountInput.value);
        const fee = 2;
        const total = amount + fee;
        const receiverAmount = amount * exchangeRates[destination];
        
        // In a real app, you would send this data to your server
        const transferData = {
            id: Date.now(),
            senderName: document.getElementById('sender-name').value,
            senderPhone: document.getElementById('sender-phone').value,
            destination: destination,
            amount: amount,
            fee: fee,
            total: total,
            receiverAmount: receiverAmount,
            currency: getCurrencyCode(destination),
            method: transferMethodSelect.value,
            receiverDetails: getReceiverDetails(),
            status: 'pending',
            date: new Date().toISOString()
        };
        
        // Save to transactions array
        transactions.push(transferData);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        showPaymentInstructions();
    });
    
    function getReceiverDetails() {
        const method = transferMethodSelect.value;
        
        if (method === 'mobile') {
            return {
                name: document.getElementById('receiver-name').value,
                phone: document.getElementById('receiver-phone').value
            };
        } else {
            return {
                bankName: document.getElementById('bank-name').value,
                accountName: document.getElementById('account-name').value,
                accountNumber: document.getElementById('account-number').value
            };
        }
    }
    
    // Handle Payment Confirmation
    confirmPaymentBtn.addEventListener('click', function() {
        // Get the latest transaction (the one just created)
        const latestTransaction = transactions[transactions.length - 1];
        
        // Send WhatsApp notification with all details
        sendWhatsAppNotification(latestTransaction);
        
        showConfirmation();
    });
    
    function sendWhatsAppNotification(transaction) {
        // Format the WhatsApp message with all required details
        const message = `💰 *NEW MONEY TRANSFER ORDER* 💰
        
📌 *SENDER DETAILS:*
   👤 Name: ${transaction.senderName}
   📞 Contact: ${transaction.senderPhone}

📌 *RECEIVER DETAILS:*
   👤 Name: ${transaction.method === 'mobile' ? 
            transaction.receiverDetails.name : 
            transaction.receiverDetails.accountName}
   📞 Contact: ${transaction.method === 'mobile' ? 
              transaction.receiverDetails.phone : 
              transaction.receiverDetails.accountNumber}
   ${transaction.method === 'bank' ? 
     `🏦 Bank: ${transaction.receiverDetails.bankName}` : 
     ''}

📌 *TRANSACTION DETAILS:*
   💵 Amount Sent: ${transaction.amount} RIAL
   💰 Fee: ${transaction.fee} RIAL
   🔢 Total: ${transaction.total} RIAL
   💸 Receiver Gets: ${transaction.receiverAmount} ${transaction.currency}
   🌍 Destination: ${transaction.destination} ${getCountryFlag(transaction.destination)}
   🔧 Method: ${transaction.method === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}
   📅 Date: ${new Date(transaction.date).toLocaleString()}

📌 *TRANSACTION ID:* ${transaction.id}

⚠️ *PLEASE PROCESS THIS TRANSACTION* ⚠️`;

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp link
        const whatsappUrl = `https://wa.me/96878440900?text=${encodedMessage}`;
        
        // Open in new tab
        window.open(whatsappUrl, '_blank');
    }
    
    // Admin Functions
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === adminCredentials.username && password === adminCredentials.password) {
            showAdminPanel();
            
            // Populate rates form with current values
            document.getElementById('rwanda-rate').value = exchangeRates.Rwanda;
            document.getElementById('uganda-rate').value = exchangeRates.Uganda;
            document.getElementById('tanzania-rate').value = exchangeRates.Tanzania;
            document.getElementById('burundi-rate').value = exchangeRates.Burundi;
            document.getElementById('drc-rate').value = exchangeRates.DRC;
            document.getElementById('kenya-rate').value = exchangeRates.Kenya;
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });
    
    ratesForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Update exchange rates
        exchangeRates.Rwanda = parseFloat(document.getElementById('rwanda-rate').value);
        exchangeRates.Uganda = parseFloat(document.getElementById('uganda-rate').value);
        exchangeRates.Tanzania = parseFloat(document.getElementById('tanzania-rate').value);
        exchangeRates.Burundi = parseFloat(document.getElementById('burundi-rate').value);
        exchangeRates.DRC = parseFloat(document.getElementById('drc-rate').value);
        exchangeRates.Kenya = parseFloat(document.getElementById('kenya-rate').value);
        
        // Save to localStorage
        localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
        
        // Update display
        displayRates();
        
        alert('Exchange rates updated successfully!');
    });
    
    statusFilter.addEventListener('change', loadTransactions);
    
    function loadTransactions() {
        const status = statusFilter.value;
        let filteredTransactions = [...transactions].reverse(); // Show newest first
        
        if (status !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.status === status);
        }
        
        transactionsList.innerHTML = '';
        
        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = '<tr><td colspan="6" style="text-align: center;">No transactions found</td></tr>';
            return;
        }
        
        filteredTransactions.forEach(transaction => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.senderName}</td>
                <td>${transaction.amount} RIAL</td>
                <td>${transaction.destination}</td>
                <td class="status-${transaction.status}">${transaction.status}</td>
                <td>
                    ${transaction.status === 'pending' ? 
                        `<button class="action-btn complete-btn" data-id="${transaction.id}">Complete</button>` : 
                        ''}
                    <button class="action-btn details-btn" data-id="${transaction.id}">Details</button>
                </td>
            `;
            
            transactionsList.appendChild(tr);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                completeTransaction(id);
            });
        });
        
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                showTransactionDetails(id);
            });
        });
    }
    
    function completeTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            transaction.status = 'completed';
            localStorage.setItem('transactions', JSON.stringify(transactions));
            loadTransactions();
        }
    }
    
    function showTransactionDetails(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        
        let details = `
            <strong>Transaction ID:</strong> ${transaction.id}<br>
            <strong>Date:</strong> ${new Date(transaction.date).toLocaleString()}<br>
            <strong>Sender:</strong> ${transaction.senderName} (${transaction.senderPhone})<br>
            <strong>Amount:</strong> ${transaction.amount} RIAL + ${transaction.fee} RIAL fee = ${transaction.total} RIAL total<br>
            <strong>Receiver Gets:</strong> ${transaction.receiverAmount} ${transaction.currency}<br>
            <strong>Destination:</strong> ${transaction.destination}<br>
            <strong>Method:</strong> ${transaction.method === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}<br>
            <strong>Status:</strong> <span class="status-${transaction.status}">${transaction.status}</span><br><br>
        `;
        
        if (transaction.method === 'mobile') {
            details += `
                <strong>Receiver Details:</strong><br>
                Name: ${transaction.receiverDetails.name}<br>
                Phone: ${transaction.receiverDetails.phone}
            `;
        } else {
            details += `
                <strong>Receiver Bank Details:</strong><br>
                Bank: ${transaction.receiverDetails.bankName}<br>
                Account Name: ${transaction.receiverDetails.accountName}<br>
                Account Number: ${transaction.receiverDetails.accountNumber}
            `;
        }
        
        alert(details);
    }
    
    exportBtn.addEventListener('click', function() {
        // Convert transactions to CSV
        let csv = 'ID,Date,Sender Name,Sender Phone,Amount (RIAL),Fee (RIAL),Total (RIAL),Destination,Receiver Amount,Currency,Method,Status\n';
        
        transactions.forEach(t => {
            csv += `${t.id},"${new Date(t.date).toLocaleString()}","${t.senderName}","${t.senderPhone}",${t.amount},${t.fee},${t.total},"${t.destination}",${t.receiverAmount},${t.currency},"${t.method === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}","${t.status}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
    
    // Initialize the app
    init();
});
