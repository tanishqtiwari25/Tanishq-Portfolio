import test from 'node:test';import assert from 'node:assert/strict';
import {sanitizeEvent,cleanPageUrl,validMeasurementId,trackEvent} from '../lib/analytics.mjs';
test('analytics strips personal fields and only accepts recognized project IDs',()=>{assert.deepEqual(sanitizeEvent('project_open',{project_id:'orbit-crm',email:'private@example.com',message:'private'}),{name:'project_open',params:{project_id:'orbit-crm'}});assert.equal(sanitizeEvent('project_open',{project_id:'private@example.com'}),null);assert.equal(sanitizeEvent('unknown',{email:'private'}),null)});
test('lead events never contain contact form values',()=>assert.deepEqual(sanitizeEvent('generate_lead',{name:'Private',email:'private@example.com',message:'Private'}),{name:'generate_lead',params:{method:'contact_form'}}));
test('page URLs exclude queries, hashes and non-HTTP schemes',()=>{assert.equal(cleanPageUrl('https://example.com/work/sole-track?email=private#secret'),'https://example.com/work/sole-track');assert.equal(cleanPageUrl('mailto:private@example.com'),'');assert.equal(cleanPageUrl('invalid'),'')});
test('only a GA4 measurement ID is accepted; events are safe without a tag',()=>{assert.equal(validMeasurementId('G-ABC1234567'),true);assert.equal(validMeasurementId('G-ABC\";alert(1)'),false);assert.equal(validMeasurementId(undefined),false);assert.doesNotThrow(()=>trackEvent('generate_lead'))});

test('GTM routes redacted events once without also calling gtag',()=>{
 const events=[];let calls=0;globalThis.window={__portfolioGtm:true,dataLayer:events,gtag:()=>calls++};
 try{trackEvent('project_open',{project_id:'orbit-crm',email:'private@example.com'});assert.deepEqual(events,[{event:'project_open',project_id:'orbit-crm'}]);assert.equal(calls,0);}finally{delete globalThis.window;}
});
