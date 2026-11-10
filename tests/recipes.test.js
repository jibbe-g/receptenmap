import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanRecipe,splitText,scaleIngredients,importRecipes} from '../src/recipes.js';
const recipe={name:'Soep',category:'Voorgerechten',author:'Sam',servings:4,minutes:30,ingredients:'800 | g | tomaten\nnaar smaak | | zout',steps:'Kook.',notes:''};
test('Import accepts original HTML map exports and strips cloud metadata',()=>{const result=importRecipes(JSON.stringify({format:'receptenmap',version:1,recipes:[{...recipe,id:'old',updatedBy:'old'}]}));assert.deepEqual(result,[recipe]);});
test('Import validates every record before writing anything',()=>{assert.throws(()=>importRecipes(JSON.stringify({format:'receptenmap',version:1,recipes:[recipe,{...recipe,servings:0}]})));assert.throws(()=>cleanRecipe({...recipe,minutes:NaN}));assert.throws(()=>cleanRecipe({...recipe,name:' '}));});
test('OCR separates Dutch headings and preserves text without headings',()=>{const r=splitText('Tomatensoep\nIngrediënten:\n2 tomaten\nBereidingswijze:\nSnijd en kook.');assert.equal(r.ingredients,'2 tomaten');assert.equal(r.steps,'Snijd en kook.');assert.equal(splitText('Soep\nKook alles.').steps,'Kook alles.');});
test('Scaling supports decimal commas and preserves quantities written as text',()=>{assert.equal(scaleIngredients('1,5 | kg | bloem',4,8)[0],'3 kg bloem');assert.equal(scaleIngredients(recipe.ingredients,4,8)[0],'1.600 g tomaten');assert.equal(scaleIngredients(recipe.ingredients,4,8)[1],'naar smaak  zout');});
