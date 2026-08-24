const fs=require('fs');
let c=fs.readFileSync('src/lib/i18n/dictionaries.ts','utf8');
const orig=c;
// Remove duplicate common.back/next after create.toast.fix for each locale
c=c.replace(/"create\.toast\.fix": "[^"]+",\n    "common\.back": "[^"]+",\n    "common\.next": "[^"]+",\n    "checks\.title"/g, '"create.toast.fix": "PLACEHOLDER",\n    "checks.title"');
// Now replace placeholders with correct per locale
// We need to restore correct values per locale - easier to just remove the duplicates and keep original common at top
// The above already removed the duplicates, but we need to restore the correct create.toast.fix values
// For EN, it should be "Please fix the errors before continuing"
// For FR, "Veuillez corriger les erreurs avant de continuer"
// For AR, "يرجى تصحيح الأخطاء قبل المتابعة"
// Our replace put PLACEHOLDER, need to fix
c=c.replace(/"create\.toast\.fix": "PLACEHOLDER",\n    "checks\.title": "GPSR Checks"/, '"create.toast.fix": "Please fix the errors before continuing",\n    "checks.title": "GPSR Checks"');
c=c.replace(/"create\.toast\.fix": "PLACEHOLDER",\n    "checks\.title": "Vérifications GPSR"/, '"create.toast.fix": "Veuillez corriger les erreurs avant de continuer",\n    "checks.title": "Vérifications GPSR"');
c=c.replace(/"create\.toast\.fix": "PLACEHOLDER",\n    "checks\.title": "فحوصات GPSR"/, '"create.toast.fix": "يرجى تصحيح الأخطاء قبل المتابعة",\n    "checks.title": "فحوصات GPSR"');

if(c!==orig){
  fs.writeFileSync('src/lib/i18n/dictionaries.ts',c);
  console.log('fixed');
} else console.log('no change');
console.log(c.includes('"common.back": "Back",') ? 'still has' : 'removed');
