import {collection,doc,onSnapshot,runTransaction,serverTimestamp} from 'firebase/firestore';
import {db,library} from './firebase';
const requestRef=uid=>doc(db,'libraries',library,'accessRequests',uid);
export function watchMyRequest(user,cb,error){return onSnapshot(requestRef(user.uid),s=>cb(s.exists()?{...s.data(),id:s.id}:null),error)}
export function watchAccessRequests(cb,error){return onSnapshot(collection(db,'libraries',library,'accessRequests'),s=>cb(s.docs.map(d=>({...d.data(),id:d.id}))),error)}
export function watchMembers(cb,error){return onSnapshot(collection(db,'libraries',library,'members'),s=>cb(s.docs.map(d=>({...d.data(),id:d.id}))),error)}
export async function requestAccess(user){
 if(!navigator.onLine)throw Error('Verbind met internet om toegang aan te vragen.');
 await runTransaction(db,async tx=>{
  const ref=requestRef(user.uid),current=await tx.get(ref);
  if(current.exists()){
   if(current.data().status==='pending')return;
   tx.update(ref,{status:'pending',updatedAt:serverTimestamp()});
  }else tx.set(ref,{uid:user.uid,email:user.email,name:(user.displayName||'').slice(0,200),status:'pending',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
 });
}
export async function reviewAccessRequest(id,approve,user){
 if(!navigator.onLine)throw Error('Verbind met internet om aanvragen te beoordelen.');
 await runTransaction(db,async tx=>{
  const ref=requestRef(id),current=await tx.get(ref);
  if(!current.exists()||current.data().status!=='pending')throw Error('Deze aanvraag is al behandeld.');
  const r=current.data();
  if(approve){
   const member=doc(db,'libraries',library,'members',r.email),existing=await tx.get(member);
   // Preserve existing memberships and administrator roles.
   if(!existing.exists())tx.set(member,{uid:r.uid,email:r.email,name:r.name,role:'editor',joinedAt:serverTimestamp(),approvedBy:user.uid});
  }
  tx.update(ref,{status:approve?'approved':'rejected',updatedAt:serverTimestamp(),reviewedBy:user.uid});
 });
}
