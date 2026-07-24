const {
  AccountingStore,
  formatCurrency,
  parseAmountToCents,
  executeAction,
} = require('./index');

describe('Accounting application behavior', () => {
  test('TC-01: displays the initial balance', () => {
    const store = new AccountingStore(100000);
    const result = executeAction(store, '1');

    expect(result.type).toBe('view');
    expect(result.message).toBe('Current balance: 1000.00');
  });

  test('TC-02: credits funds and updates the balance', () => {
    const store = new AccountingStore(100000);
    const result = executeAction(store, '2', '250.00');

    expect(result.type).toBe('credit');
    expect(result.message).toBe('Amount credited. New balance: 1250.00');
    expect(store.readBalance()).toBe(125000);
  });

  test('TC-03: debits funds successfully when sufficient balance exists', () => {
    const store = new AccountingStore(100000);
    const result = executeAction(store, '3', '300.00');

    expect(result.type).toBe('debit');
    expect(result.message).toBe('Amount debited. New balance: 700.00');
    expect(store.readBalance()).toBe(70000);
  });

  test('TC-04: rejects debit when balance is insufficient', () => {
    const store = new AccountingStore(100000);
    const result = executeAction(store, '3', '1500.00');

    expect(result.type).toBe('insufficientFunds');
    expect(result.message).toBe('Insufficient funds for this debit.');
    expect(store.readBalance()).toBe(100000);
  });

  test('TC-05: handles invalid menu choices', () => {
    const store = new AccountingStore(100000);
    const result = executeAction(store, '5');

    expect(result.type).toBe('invalidChoice');
    expect(result.message).toBe('Invalid choice, please select 1-4.');
  });

  test('TC-06: exits the application cleanly', () => {
    const store = new AccountingStore(100000);
    const result = executeAction(store, '4');

    expect(result.type).toBe('exit');
    expect(result.message).toBe('Exiting the program. Goodbye!');
  });

  test('TC-07: preserves balance across sequential operations in a session', () => {
    const store = new AccountingStore(100000);
    executeAction(store, '2', '200.00');
    executeAction(store, '3', '100.00');
    const result = executeAction(store, '1');

    expect(result.type).toBe('view');
    expect(result.message).toBe('Current balance: 1100.00');
    expect(store.readBalance()).toBe(110000);
  });

  test('formatCurrency converts cents to a two-decimal string', () => {
    expect(formatCurrency(125000)).toBe('1250.00');
    expect(formatCurrency(70000)).toBe('700.00');
  });

  test('parseAmountToCents validates positive amounts', () => {
    expect(parseAmountToCents('250.00')).toBe(25000);
    expect(parseAmountToCents('-10')).toBeNull();
    expect(parseAmountToCents('0')).toBeNull();
  });
});
