const readline = require('readline');

class AccountingStore {
  constructor(initialBalanceCents = 100000) {
    this.balanceCents = initialBalanceCents;
  }

  readBalance() {
    return this.balanceCents;
  }

  writeBalance(newBalanceCents) {
    if (!Number.isInteger(newBalanceCents)) {
      throw new Error('Balance must be stored in cents.');
    }
    this.balanceCents = newBalanceCents;
    return this.balanceCents;
  }
}

function formatCurrency(cents) {
  return (cents / 100).toFixed(2);
}

function parseAmountToCents(input) {
  const amount = Number(input);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Math.round(amount * 100);
}

function displayMenu() {
  console.log('--------------------------------');
  console.log('Account Management System');
  console.log('1. View Balance');
  console.log('2. Credit Account');
  console.log('3. Debit Account');
  console.log('4. Exit');
  console.log('--------------------------------');
}

function executeAction(store, choice, amountInput = null) {
  switch (choice.trim()) {
    case '1':
      return {
        type: 'view',
        message: `Current balance: ${formatCurrency(store.readBalance())}`,
      };
    case '2': {
      const amountCents = parseAmountToCents(amountInput);
      if (amountCents === null) {
        return {
          type: 'invalidAmount',
          message: 'Invalid amount. Please enter a positive number.',
        };
      }

      const newBalance = store.writeBalance(store.readBalance() + amountCents);
      return {
        type: 'credit',
        message: `Amount credited. New balance: ${formatCurrency(newBalance)}`,
      };
    }
    case '3': {
      const amountCents = parseAmountToCents(amountInput);
      if (amountCents === null) {
        return {
          type: 'invalidAmount',
          message: 'Invalid amount. Please enter a positive number.',
        };
      }

      const currentBalance = store.readBalance();
      if (currentBalance >= amountCents) {
        const newBalance = store.writeBalance(currentBalance - amountCents);
        return {
          type: 'debit',
          message: `Amount debited. New balance: ${formatCurrency(newBalance)}`,
        };
      }

      return {
        type: 'insufficientFunds',
        message: 'Insufficient funds for this debit.',
      };
    }
    case '4':
      return {
        type: 'exit',
        message: 'Exiting the program. Goodbye!',
      };
    default:
      return {
        type: 'invalidChoice',
        message: 'Invalid choice, please select 1-4.',
      };
  }
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const store = new AccountingStore();
  let continueFlag = true;

  while (continueFlag) {
    displayMenu();
    const choice = await askQuestion(rl, 'Enter your choice (1-4): ');

    let result;
    if (choice.trim() === '2') {
      const amountInput = await askQuestion(rl, 'Enter credit amount: ');
      result = executeAction(store, choice, amountInput);
    } else if (choice.trim() === '3') {
      const amountInput = await askQuestion(rl, 'Enter debit amount: ');
      result = executeAction(store, choice, amountInput);
    } else {
      result = executeAction(store, choice);
    }

    console.log(result.message);
    if (result.type === 'exit') {
      continueFlag = false;
    }
  }

  rl.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  AccountingStore,
  formatCurrency,
  parseAmountToCents,
  executeAction,
};
