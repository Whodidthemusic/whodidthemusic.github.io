import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('corporate sections contain the new copy, not old placeholders', () => {
  for (const text of ['The Company', 'Our Businesses', 'Our smart-city program, centered on Virtu City',
    'Our Approach', 'Employee accounts, workplace records', 'Opening public information services']) {
    assert.ok(html.includes(text), text);
  }
  for (const text of ['participation loops', 'Brand Rituals', 'Password wall comes next',
    'Mounting Influence Layer', 'gamified, measurable, and monetized']) {
    assert.ok(!html.includes(text), text);
  }
});

test('CRT Sample emphasizes web links, local/external files and in-DAW chopping', () => {
  const section = html.match(/id="crt-sample">([\s\S]*?)id="vision"/)[1];
  for (const text of ['Copy and paste a YouTube or Instagram link', 'from your computer or external drives',
    'directly inside your DAW', 'Paste YouTube + Instagram links', 'Load local + external drive media']) {
    assert.ok(section.includes(text), text);
  }
  assert.ok(section.includes('crt-sample-official.jpg'));
  assert.ok(section.includes('id="crt-download-count"'));
  assert.ok(section.includes('CRT-Sample-1.1.0-Open-V1-Beta-Fully-Unlocked-Windows-x64-Setup.exe'));
});

test('navigation has real targets and inline scripts still parse', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]));
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(match[1]);
});
