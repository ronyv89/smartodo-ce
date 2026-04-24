import { schema } from '../schema.js';

describe('schema', () => {
  it('is an object', () => {
    expect(typeof schema).toBe('object');
  });

  it('has no keys (starter schema is empty)', () => {
    expect(Object.keys(schema)).toHaveLength(0);
  });
});
