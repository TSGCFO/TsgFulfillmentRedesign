import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
vi.mock("../vite.config", () => ({ 
  default: {
    build: { outDir: 'dist' },
    server: { port: 3000 },
    plugins: []
  } 
}));
vi.mock("vite", () => ({ createLogger: () => ({ error: vi.fn() }), createServer: vi.fn() }));
import express from 'express';
import { TextEncoder } from "util";
(globalThis as any).TextEncoder = TextEncoder;

describe('vite helpers', () => {
  it('formats log output', async () => {
    const { log } = await import('../vite');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('hello', 'test');
    const called = spy.mock.calls[0][0] as string;
    expect(called).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    expect(called).toMatch(/\[test\] hello/);
    spy.mockRestore();
  });

  it('serveStatic registers middleware', async () => {
    const { serveStatic } = await import('../vite');
    const use = vi.fn();
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const staticSpy = vi.spyOn(express, 'static').mockReturnValue('mw' as any);
    serveStatic({ use } as any);
    expect(staticSpy).toHaveBeenCalled();
    expect(use).toHaveBeenCalledWith('mw');
    expect(use).toHaveBeenCalledWith('*', expect.any(Function));
  });

  it('throws if build dir missing', async () => {
    const { serveStatic } = await import('../vite');
    const use = vi.fn();
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    expect(() => serveStatic({ use } as any)).toThrow();
  });
});
