import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {AsyncLocalStorage} from 'node:async_hooks';
export const context=new AsyncLocalStorage();
const db=new DatabaseSync(':memory:');
for(const name of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())db.exec(fs.readFileSync('drizzle/'+name,'utf8'));
export {db};
const files=new Map();
export const env={BUCKET:{async put(key,bytes){files.set(key,new Uint8Array(bytes))},async get(key){const b=files.get(key);return b?{body:b}:null},async delete(key){files.delete(key)}},DB:{
 prepare(sql){
  function bound(values=[]){return {
   execute(){return {meta:{changes:Number(db.prepare(sql).run(...values).changes)}}},
   async run(){return this.execute()},
   async first(){return db.prepare(sql).get(...values)||null},
   async all(){return {results:db.prepare(sql).all(...values)}},
   bind(...args){return bound(args)}
  }}return bound();
 },
 async batch(commands){db.exec('BEGIN');try{const result=commands.map(c=>c.execute());db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}
}};
export async function getChatGPTUser(){return context.getStore()||null}
