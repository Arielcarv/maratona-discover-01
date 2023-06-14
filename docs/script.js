//const doc = document.querySelector('.modal-overlay')

const Modal = {
    open() {
        // Open modal document
        document 
            // Search for a specific class
            .querySelector('.modal-overlay')
            // Add an active class to modal
            .classList
                .add('active')
    },
    close() {
        // Close modal
        // Remove active class from modal
        document
            .querySelector('.modal-overlay')
            .classList
                .remove('active')
    },
    
    // toggle() {
    //     if (doc.classList.contains('active')) {
    //         doc.classList.remove('active');
    //     } else {
    //         doc.classList.add('active');
    //     }
    // }

    toggleActive() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const Storage = {
    get() {
        console.log(localStorage)
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction); //Push transaction inside an array

        App.reload();
    },
    remove(index) {
        Transaction.all.splice(index, 1); //Remove one transaction, how many elements

        App.reload();
    },

    incomes() {
        let income = 0;
        // Take all transactions
        Transaction.all.forEach(transaction => {
            // For each transaction,
            if (transaction.amount > 0) {
                // Sum all incomes
                income += transaction.amount;
            }
        })
        return income;
    },
    expenses() {
        let expense = 0;
        // Sum all Expenses
        Transaction.all.forEach(transaction => {
            if (transaction.amount <= 0) {
                expense += transaction.amount;
            }
        })
        return expense
    },
    total() {
        // Incomes + (-Expenses)
        return this.incomes() + this.expenses();
    }
}

// The javascript will create the element and add it to the HTML
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense' // If transaction amount is greater than 0, it's an income, else, it's expense

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remove transaction">
        </td>`

        return html
    },
    updateBalance(transaction) {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    }
}

const Utils = {
    formatAmount(value) {
        value = (value) * 100
        return Math.round(value)
    },
    formatDate(date) {
        const splitedDate = date.split('-')
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },
    formatCurrency(value) { // Forcing the value to be a number
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '') // Replace all non-number digits for ''

        value = Number(value) / 100 // Divide to add comma

        value = value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        }) 

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date:Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        if( description.trim() === '' || 
            amount.trim() === ''|| 
            date.trim() === '') {
                throw new Error('Please, fill all fields.')
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            // Verify if all inputs were filled
            Form.validateFields()
            // Format all data to save
            const transaction = Form.formatValues()
            // Save all
            Form.saveTransaction(transaction)
            // Delete all data from forms
            Form.clearFields()
            // Close Modal Overlay
            Modal.close()
            // Update application on add function

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}


App.init()
