export async function preparePhoto(file){
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;await image.decode();
  if(!image.naturalWidth||!image.naturalHeight)throw Error('Deze foto kon niet worden geopend. Kies een JPG, PNG of WebP.');
  const ratio=Math.min(1,2200/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.round(image.naturalWidth*ratio);canvas.height=Math.round(image.naturalHeight*ratio);
  const context=canvas.getContext('2d');if(!context)throw Error('Je browser kan deze foto niet verwerken. Probeer een andere browser.');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  const data=canvas.toDataURL('image/jpeg',.88);
  if(data.length>4194400)throw Error('Deze foto is nog te groot. Snijd het recept bij en probeer opnieuw.');
  return data;
 }finally{URL.revokeObjectURL(url)}
}
export async function recognizePhoto(file,user){
 if(!user)throw Error('Log in als lid om AI-fotoherkenning te gebruiken. Tekst plakken kan ook.');
 if(!navigator.onLine)throw Error('Verbind met internet om de foto met AI uit te lezen.');
 const image=await preparePhoto(file),token=await user.getIdToken();
 const response=await fetch('/api/recipe-from-photo',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({image}),signal:AbortSignal.timeout(75000)});
 let data;try{data=await response.json()}catch{throw Error('De AI-serverfunctie is nog niet beschikbaar. De beheerder moet de nieuwste Cloudflare-deployment controleren.')}
 if(!response.ok)throw Error(data.error||'De foto kon niet worden verwerkt.');
 return data.recipe;
}
export function photoDraft(recipe){
 return {name:recipe.name||'',category:recipe.category||'Overig',author:'',servings:recipe.servings??'',minutes:recipe.minutes??'',ingredients:recipe.ingredients.join('\n'),steps:recipe.steps.join('\n\n'),notes:[recipe.notes,...recipe.warnings.map(w=>'Controleer: '+w)].filter(Boolean).join('\n')};
}
