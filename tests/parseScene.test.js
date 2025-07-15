import test from 'node:test';
import { strict as assert } from 'node:assert';
import { parseScene } from '../parseScene.js';

test('parseScene returns object', () => {
  const obj = parseScene('{"description":"hi","choices":[],"theme":"FANTASY"}');
  assert.equal(obj.description, 'hi');
});

test('parseScene handles code fences', () => {
  const wrapped = '```json\n{"description":"ok","choices":[],"theme":"FANTASY"}\n```';
  const obj = parseScene(wrapped);
  assert.equal(obj.description, 'ok');
});

test('parseScene throws on invalid JSON', () => {
  assert.throws(() => parseScene('invalid'), SyntaxError);
});

test('parseScene handles surrounding text', () => {
  const text = '<think> {"description":"test","choices":[],"theme":"FANTASY"} <end>';
  const obj = parseScene(text);
  assert.equal(obj.description, 'test');
});
