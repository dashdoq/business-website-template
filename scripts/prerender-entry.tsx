import {renderToString} from 'react-dom/server';
import Experience from '../app/experience';
import {PolicyPage} from '../app/policy-page';
import {languageFromPath,pageFromPath} from '../app/seo-data';
export function render(path:string){
 const id=pageFromPath(path),language=languageFromPath(path);
 if(!id)throw new Error('Unknown page');
 if(id==='privacy'||id==='cookies'||id==='accessibility')return renderToString(<PolicyPage kind={id} language={language}/>);
 return renderToString(<Experience initialLanguage={language} initialTool={id==='home'?undefined:id}/>);
}
