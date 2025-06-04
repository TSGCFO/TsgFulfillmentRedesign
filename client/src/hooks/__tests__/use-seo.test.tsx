import { render } from '@testing-library/react';
import React from 'react';
import { useSEO } from '../use-seo';

function TestComp(props: Parameters<typeof useSEO>[0]) {
  useSEO(props);
  return null;
}

describe('useSEO hook', () => {
  it('updates document metadata', () => {
    render(<TestComp title="Hello" description="desc" canonicalUrl="/foo" jsonLd={{a:1}} />);
    expect(document.title).toBe('Hello | TSG Fulfillment Services');
    const meta = document.querySelector('meta[name="description"]')!;
    expect(meta.getAttribute('content')).toBe('desc');
    const link = document.querySelector('link[rel="canonical"]')!;
    expect(link.getAttribute('href')).toBe('https://tsgfulfillment.com/foo');
    const script = document.getElementById('dynamic-jsonld');
    expect(script).toBeTruthy();
  });

  it('cleans up jsonld on unmount', () => {
    const { unmount } = render(<TestComp jsonLd={{b:2}} />);
    unmount();
    expect(document.getElementById('dynamic-jsonld')).toBeNull();
  });
});
