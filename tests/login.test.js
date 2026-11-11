import {test} from 'node:test';
import assert from 'node:assert/strict';
import {oneAtATime,loginMessage} from '../src/login.js';
test('Repeated clicks share one pending authentication operation',async()=>{
 let calls=0,finish;
 const start=oneAtATime(()=>{calls++;return new Promise(resolve=>{finish=resolve})});
 const first=start(),second=start();
 assert.equal(first,second);
 await Promise.resolve();assert.equal(calls,1);
 finish('signed in');assert.equal(await first,'signed in');
 const retry=start();assert.notEqual(retry,first);await Promise.resolve();assert.equal(calls,2);finish('again');await retry;
});
test('A failed or synchronously throwing login can be retried',async()=>{
 let calls=0;const start=oneAtATime(()=>{if(++calls===1)throw Object.assign(Error('blocked'),{code:'auth/popup-blocked'});return 'ok'});
 await assert.rejects(start(),{code:'auth/popup-blocked'});assert.equal(await start(),'ok');assert.equal(calls,2);
});
test('Popup problems explain the recovery without exposing raw Firebase errors',()=>{
 assert.match(loginMessage({code:'auth/popup-blocked'}),/Sta pop-ups toe/);
 assert.match(loginMessage({code:'auth/cancelled-popup-request'}),/één keer opnieuw/);
 assert.match(loginMessage({code:'auth/popup-closed-by-user'}),/Klik opnieuw/);
 assert.match(loginMessage({code:'auth/unauthorized-domain'}),/Authorized domains/);
});
