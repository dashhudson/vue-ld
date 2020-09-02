import { formatFlags } from '@/utils';

describe('Utils', () => {
  it('formats keys', () => {
    const formattedFlags = formatFlags({
      'hyph-en-ated': true,
      'sp acy': true,
    });
    const keys = Object.keys(formattedFlags);
    expect(keys).toStrictEqual(['hyphEnAted', 'spAcy']);
  });
});
