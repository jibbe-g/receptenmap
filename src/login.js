// Share a pending sign-in promise, including calls before React re-renders.
export function oneAtATime(task){
 let pending;
 return function(...args){
  if(pending)return pending;
  pending=Promise.resolve().then(()=>task(...args)).finally(()=>{pending=undefined});
  return pending;
 };
}
export function loginMessage(error){
 switch(error?.code){
  case 'auth/cancelled-popup-request':return 'De inlogpoging is onderbroken door een andere poging. Sluit eventuele Google-inlogvensters en probeer één keer opnieuw.';
  case 'auth/popup-closed-by-user':return 'Het Google-inlogvenster is gesloten. Klik opnieuw op Inloggen met Google om verder te gaan.';
  case 'auth/popup-blocked':return 'Je browser blokkeert het Google-inlogvenster. Sta pop-ups toe voor deze site en probeer opnieuw.';
  case 'auth/unauthorized-domain':return 'Dit websiteadres is nog niet toegestaan voor Google-inloggen. De beheerder moet het toevoegen bij Firebase Authentication → Authorized domains.';
  case 'auth/network-request-failed':return 'Inloggen lukt niet door een verbindingsprobleem. Controleer je internet en probeer opnieuw.';
  case 'auth/operation-not-supported-in-this-environment':return 'Open de site rechtstreeks in Chrome, Safari, Edge of Firefox om met Google in te loggen.';
  default:return 'Inloggen is niet gelukt. Probeer opnieuw.'+(error?.code?' ('+error.code+')':'');
 }
}
