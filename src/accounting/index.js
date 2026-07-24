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

    switch (choice.trim()) {
      case '1':
        console.log(`Current balance: ${formatCurrency(store.readBalance())}`);
        break;
      case '2': {
        const amountInput = await askQuestion(rl, 'Enter credit amount: ');
        const amountCents = parseAmountToCents(amountInput);
        if (amountCents === null) {
          console.log('Invalid amount. Please enter a positive number.');
          break;
        }

        const newBalance = store.writeBalance(store.readBalance() + amountCents);
        console.log(`Amount credited. New balance: ${formatCurrency(newBalance)}`);
        break;
      }
      case '3': {
        const amountInput = await askQuestion(rl, 'Enter debit amount: ');
        const amountCents = parseAmountToCents(amountInput);
        if (amountCents === null) {
          console.log('Invalid amount. Please enter a positive number.');
          break;
        }

        const currentBalance = store.readBalance();
        if (currentBalance >= amountCents) {
          const newBalance = store.writeBalance(currentBalance - amountCents);
          console.log(`Amount debited. New balance: ${formatCurrency(newBalance)}`);
        } else {
          console.log('Insufficient funds for this debit.');
        }
        break;
      }
      case '4':
        console.log('Exiting the program. Goodbye!');
        continueFlag = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  rl.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
