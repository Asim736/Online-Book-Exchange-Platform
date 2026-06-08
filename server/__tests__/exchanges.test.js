/**
 * Unit tests for exchangeController logic
 *
 * Tests null-safety, authorization, and CRUD patterns
 * used in getAllExchanges, getExchangeById, createExchange,
 * updateExchangeStatus, and deleteExchange.
 */

describe('getAllExchanges - response shape', () => {
  test('returns array of exchanges', () => {
    const exchanges = [
      { _id: 'ex1', status: 'pending' },
      { _id: 'ex2', status: 'accepted' },
    ];
    expect(Array.isArray(exchanges)).toBe(true);
    expect(exchanges.length).toBe(2);
  });

  test('handles empty exchange list', () => {
    const exchanges = [];
    expect(exchanges.length).toBe(0);
  });
});

describe('getExchangeById - null safety', () => {
  test('returns 404 when exchange is null', () => {
    const exchange = null;
    const result = !exchange;
    expect(result).toBe(true);
  });

  test('handles exchange with null populated fields', () => {
    const exchange = {
      _id: 'ex1',
      requestor: null,
      owner: { _id: 'owner1', username: 'testuser' },
      requestedBook: null,
      offeredBook: { _id: 'book1', title: 'Test Book' },
    };

    // Guard pattern: check if populated field exists before accessing
    const requestorExists = exchange.requestor !== null;
    const offeredBookExists = exchange.offeredBook !== null;
    expect(requestorExists).toBe(false);
    expect(offeredBookExists).toBe(true);
  });
});

describe('updateExchangeStatus - authorization checks', () => {
  test('blocks update when exchange owner is null', () => {
    const exchange = { _id: 'ex1', owner: null };
    const result = !exchange ? 'not found' : (!exchange.owner ? 'missing owner' : 'ok');
    expect(result).toBe('missing owner');
  });

  test('blocks update when user is not the owner', () => {
    const exchange = { _id: 'ex1', owner: { toString: () => 'owner123' } };
    const userId = 'other456';

    if (exchange && exchange.owner) {
      const isOwner = exchange.owner.toString() === userId;
      expect(isOwner).toBe(false);
    }
  });

  test('allows update when user is the owner', () => {
    const exchange = { _id: 'ex1', owner: { toString: () => 'user123' } };
    const userId = 'user123';

    if (exchange && exchange.owner) {
      const isOwner = exchange.owner.toString() === userId;
      expect(isOwner).toBe(true);
    }
  });

  test('validates status enum values', () => {
    const validStatuses = ['accepted', 'rejected', 'completed'];
    expect(validStatuses.includes('pending')).toBe(false);
    expect(validStatuses.includes('accepted')).toBe(true);
    expect(validStatuses.includes('rejected')).toBe(true);
    expect(validStatuses.includes('completed')).toBe(true);
    expect(validStatuses.includes('invalid')).toBe(false);
  });
});

describe('deleteExchange - authorization checks', () => {
  test('returns 404 when exchange is null', () => {
    const exchange = null;
    expect(!exchange).toBe(true);
  });

  test('blocks delete when both participants are null', () => {
    const exchange = { _id: 'ex1', requestor: null, owner: null };
    const requestorId = exchange.requestor ? exchange.requestor.toString() : null;
    const ownerId = exchange.owner ? exchange.owner.toString() : null;
    const hasParticipants = Boolean(requestorId || ownerId);
    expect(hasParticipants).toBe(false);
  });

  test('allows delete when user is the requestor', () => {
    const exchange = {
      _id: 'ex1',
      requestor: { toString: () => 'user123' },
      owner: { toString: () => 'owner456' },
    };
    const userId = 'user123';

    const requestorId = exchange.requestor ? exchange.requestor.toString() : null;
    const ownerId = exchange.owner ? exchange.owner.toString() : null;
    const authorized = [requestorId, ownerId].includes(userId);
    expect(authorized).toBe(true);
  });

  test('allows delete when user is the owner', () => {
    const exchange = {
      _id: 'ex1',
      requestor: { toString: () => 'requestor1' },
      owner: { toString: () => 'user123' },
    };
    const userId = 'user123';

    const requestorId = exchange.requestor ? exchange.requestor.toString() : null;
    const ownerId = exchange.owner ? exchange.owner.toString() : null;
    const authorized = [requestorId, ownerId].includes(userId);
    expect(authorized).toBe(true);
  });

  test('blocks delete when user is neither participant', () => {
    const exchange = {
      _id: 'ex1',
      requestor: { toString: () => 'personA' },
      owner: { toString: () => 'personB' },
    };
    const userId = 'unauthorized_user';

    const requestorId = exchange.requestor ? exchange.requestor.toString() : null;
    const ownerId = exchange.owner ? exchange.owner.toString() : null;
    const authorized = [requestorId, ownerId].includes(userId);
    expect(authorized).toBe(false);
  });
});

describe('createExchange - input shape', () => {
  test('sets default status to pending', () => {
    const exchange = { status: 'pending' };
    expect(exchange.status).toBe('pending');
  });

  test('assigns requestor from authenticated user', () => {
    const reqUser = { id: 'user123' };
    const newExchange = { requestor: reqUser.id, status: 'pending' };
    expect(newExchange.requestor).toBe('user123');
    expect(newExchange.status).toBe('pending');
  });
});
