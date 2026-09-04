import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('corporate sections contain the new copy, not old placeholders', () => {
  for (const text of ['The Company', 'Our Businesses', 'Technology and support for day-to-day operations',
    'Our Approach', 'Employee accounts, workplace records', 'Opening public information services']) {
    assert.ok(html.includes(text), text);
  }
  for (const text of ['participation loops', 'Brand Rituals', 'Password wall comes next',
    'Mounting Influence Layer', 'gamified, measurable, and monetized']) {
    assert.ok(!html.includes(text), text);
  }
});

test('About explains Egocorp and approved Project Virtu announcement while preserving Fame Farm', () => {
  const about=html.match(/id="about">([\s\S]*?)id="projects"/)[1];
  for(const text of ['automate influence','social solutions','cognitive data restoration','branding',
    'one streamlined experience','Project Virtu is breaking ground','northern Nevada','pinnacle of human innovation'])assert.ok(about.includes(text),text);
  assert.ok(html.includes('<h2>Fame Farm</h2>'));
  assert.ok(html.includes('https://books.apple.com/us/book/fame-farm/id6743888201'));
});

test('CRT Sample emphasizes web links, local/external files and in-DAW chopping', () => {
  const section = html.match(/id="crt-sample">([\s\S]*?)id="vision"/)[1];
  for (const text of ['Modern crate digging. Built for your DAW.', 'Crate digging has moved beyond the record store.',
    'Copy and paste a YouTube or Instagram link', 'from your computer or external drives',
    'directly inside your DAW', 'Paste YouTube + Instagram links', 'Load local + external drive media']) {
    assert.ok(section.includes(text), text);
  }
  assert.ok(section.includes('crt-sample-official.jpg'));
  assert.ok(section.includes('id="crt-download-count"'));
  assert.ok(section.includes('CRT-Sample-1.1.0-Open-V1-Beta-Fully-Unlocked-Windows-x64-Setup.exe'));
});

test('SMSX follows CRT Sample directly and navigation matches the page order', () => {
  const sections=[...html.matchAll(/class="section" id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(sections[sections.indexOf('crt-sample')+1],'smsx');
  assert.ok(html.indexOf('href="#crt-sample"')<html.indexOf('href="#smsx"'));
  assert.equal([...html.matchAll(/id="smsx-frame"/g)].length,1);
  assert.ok(html.includes('src="./smsx/?embed=1"'));
});

test('SMSX loads the official TradingView ticker-tape component once',()=>{
  const app=readFileSync(new URL('../smsx/index.html',import.meta.url),'utf8');
  assert.equal((app.match(/tv-ticker-tape\.js/g)||[]).length,1);
  assert.ok(app.includes('https://www.tradingview-widget.com/w/en/tv-ticker-tape.js'));
});

test('navigation has real targets and inline scripts still parse', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]));
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(match[1]);
});
