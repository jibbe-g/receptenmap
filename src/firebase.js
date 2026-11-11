import {initializeApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,browserSessionPersistence,setPersistence} from 'firebase/auth';
import {getFirestore,collection,doc,onSnapshot,runTransaction,serverTimestamp} from 'firebase/firestore';
import {cleanRecipe} from './recipes';
const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID};
export const configured=Object.values(config).every(Boolean);
export const library=import.meta.env.VITE_LIBRARY_ID||'keuken';
let auth,db;
if(configured){const app=initializeApp(config);auth=getAuth(app);db=getFirestore(app)}
export const watchAuth=cb=>onAuthStateChanged(auth,cb);
export async function login(){await setPersistence(auth,browserSessionPersistence);return signInWithPopup(auth,new GoogleAuthProvider())}
export const logout=()=>signOut(auth);
export {db};
export function watchMembership(user,cb,error){return onSnapshot(doc(db,'libraries',library,'members',user.email),s=>cb(s.exists()?s.data():null),error)}
export function watchRecipes(cb,error){return onSnapshot(collection(db,'libraries',library,'recipes'),{includeMetadataChanges:true},s=>cb(s.docs.map(d=>({...d.data(),id:d.id,updated:d.data().updated?.toDate?.().toISOString()||''})),s.metadata.fromCache),error)}
export async function storeRecipe(recipe,user){const fields=cleanRecipe(recipe);const ref=recipe.id?doc(db,'libraries',library,'recipes',recipe.id):doc(collection(db,'libraries',library,'recipes'));await runTransaction(db,async tx=>{const current=await tx.get(ref);if(recipe.id&&(!current.exists()||current.data().revision!==recipe.revision))throw Error('Dit recept is intussen gewijzigd of verwijderd. Je tekst blijft open. Kopieer je wijziging of sla hem op als nieuw recept.');if(!recipe.id&&current.exists())throw Error('Probeer opnieuw.');tx.set(ref,{...fields,revision:(current.data()?.revision||0)+1,updated:serverTimestamp(),updatedBy:user.uid})});return ref.id}
export async function removeRecipe(recipe){const ref=doc(db,'libraries',library,'recipes',recipe.id);await runTransaction(db,async tx=>{const current=await tx.get(ref);if(!current.exists()||current.data().revision!==recipe.revision)throw Error('Het recept is intussen gewijzigd. Open het opnieuw.');tx.delete(ref)})}
