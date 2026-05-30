function t(t,e,i,s){var r,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,i,n):r(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,f=globalThis,m=f.trustedTypes,g=m?m.emptyScript:"",_=f.reactiveElementPolyfillSupport,$=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:y};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty($("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty($("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??y)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[$("elementProperties")]=new Map,x[$("finalized")]=new Map,_?.({ReactiveElement:x}),(f.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A=globalThis,w=t=>t,E=A.trustedTypes,S=E?E.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+M,H=`<${L}>`,P=document,k=()=>P.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,z="[ \t\n\f\r]",T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,N=/>/g,V=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,j=/"/g,F=/^(?:script|style|textarea|title)$/i,B=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),I=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),q=new WeakMap,W=P.createTreeWalker(P,129);function K(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",n=T;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(n.lastIndex=h,l=n.exec(i),null!==l);)h=n.lastIndex,n===T?"!--"===l[1]?n=R:void 0!==l[1]?n=N:void 0!==l[2]?(F.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=V):void 0!==l[3]&&(n=V):n===V?">"===l[0]?(n=r??T,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?V:'"'===l[3]?j:D):n===j||n===D?n=V:n===R||n===N?n=T:(n=V,r=void 0);const d=n===V&&t[e+1].startsWith("/>")?" ":"";o+=n===T?i+H:c>=0?(s.push(a),i.slice(0,c)+C+i.slice(c)+M+d):i+M+(-2===c?e:d)}return[K(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Y{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const n=t.length-1,a=this.parts,[l,c]=J(t,e);if(this.el=Y.createElement(l,i),W.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=W.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=c[o++],i=s.getAttribute(t).split(M),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(M)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(F.test(s.tagName)){const t=s.textContent.split(M),e=t.length-1;if(e>0){s.textContent=E?E.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],k()),W.nextNode(),a.push({type:2,index:++r});s.append(t[e],k())}}}else if(8===s.nodeType)if(s.data===L)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(M,t+1));)a.push({type:7,index:r}),t+=M.length-1}r++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,s){if(e===I)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=U(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=G(t,r._$AS(t,e.values),r,s)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??P).importNode(e,!0);W.currentNode=s;let r=W.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new X(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new rt(r,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(r=W.nextNode(),o++)}return W.currentNode=P,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),U(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==I&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Q(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new Y(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new X(this.O(k()),this.O(k()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=w(t).nextSibling;w(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=G(this,t,e,0),o=!U(t)||t!==this._$AH&&t!==I,o&&(this._$AH=t);else{const s=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=G(this,s[i+n],e,n),a===I&&(a=this._$AH[n]),o||=!U(a)||a!==this._$AH[n],a===Z?t=Z:t!==Z&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class st extends tt{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??Z)===I)return;const i=this._$AH,s=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==Z&&(i===Z||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const ot=A.litHtmlPolyfillSupport;ot?.(Y,X),(A.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class at extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new X(e.insertBefore(k(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return I}}at._$litElement$=!0,at.finalized=!0,nt.litElementHydrateSupport?.({LitElement:at});const lt=nt.litElementPolyfillSupport;lt?.({LitElement:at}),(nt.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:y},ht=(t=ct,e,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function dt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pt(t){return dt({...t,state:!0,attribute:!1})}const ut=n`
  :host {
    --alarm-critical: #f44336;
    --alarm-high: #ff5722;
    --alarm-warning: #ff9800;
    --alarm-info: #2196f3;
    --alarm-normal: #4caf50;
    --alarm-disabled: #9e9e9e;
    --alarm-shelved: #9c27b0;

    font-family: var(--paper-font-body1_-_font-family, "Roboto", sans-serif);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    font-size: 1.2em;
    font-weight: 500;
  }

  .card-content {
    padding: 0 16px 16px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
  }

  th {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 2px solid var(--divider-color, #e0e0e0);
    color: var(--secondary-text-color, #727272);
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    vertical-align: middle;
  }

  tr:hover {
    background-color: var(--table-row-background-color, rgba(0, 0, 0, 0.04));
  }

  .btn {
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .btn:hover {
    opacity: 0.85;
  }

  .btn-primary {
    background: var(--primary-color, #03a9f4);
    color: white;
  }

  .btn-danger {
    background: var(--alarm-critical);
    color: white;
  }

  .btn-small {
    padding: 4px 8px;
    font-size: 0.8em;
  }

  .empty-state {
    text-align: center;
    padding: 48px 16px;
    color: var(--secondary-text-color, #727272);
  }

  .empty-state .icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: var(--alarm-normal);
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
  }

  .tabs {
    display: flex;
    border-bottom: 2px solid var(--divider-color, #e0e0e0);
    overflow-x: auto;
  }

  .tab {
    padding: 12px 20px;
    cursor: pointer;
    border: none;
    background: none;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--secondary-text-color, #727272);
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    white-space: nowrap;
    transition: color 0.2s, border-color 0.2s;
  }

  .tab:hover {
    color: var(--primary-text-color, #212121);
  }

  .tab.active {
    color: var(--primary-color, #03a9f4);
    border-bottom-color: var(--primary-color, #03a9f4);
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 0.85em;
    font-weight: 500;
    color: var(--secondary-text-color, #727272);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px;
    font-size: 0.9em;
    box-sizing: border-box;
    background: var(--card-background-color, white);
    color: var(--primary-text-color, #212121);
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`,ft=t=>({0:"#2196F3",1:"#FF9800",2:"#FF5722",3:"#F44336"}[t]??"#9E9E9E"),mt=["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"],gt=["active_unacknowledged","returned_to_normal_unacknowledged"],_t=[3,2,1,0];let $t=class extends at{constructor(){super(...arguments),this._alarms=[],this._areaFilter=""}static{this.styles=[ut,n`
      ha-card {
        overflow: hidden;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px 12px;
      }
      .head .ic {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 20px;
      }
      .head .t {
        flex: 1;
        min-width: 0;
      }
      .head .name {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color, #212121);
      }
      .head .sub {
        font-size: 12.5px;
        color: var(--secondary-text-color, #727272);
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 700;
        --mdc-icon-size: 14px;
      }
      .bar {
        display: flex;
        height: 6px;
        margin: 0 16px 12px;
        border-radius: 9999px;
        overflow: hidden;
        background: var(--secondary-background-color, #f0f0f0);
      }
      .filter {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px 12px;
        --mdc-icon-size: 16px;
        color: var(--secondary-text-color, #727272);
      }
      .filter .wrap {
        position: relative;
        flex: 1;
      }
      .filter select {
        width: 100%;
        height: 32px;
        padding: 0 28px 0 10px;
        border-radius: 9999px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        appearance: none;
      }
      .filter .chev {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        --mdc-icon-size: 18px;
      }
      .clear {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 32px;
        padding: 0 10px;
        border: none;
        border-radius: 9999px;
        background: var(--secondary-background-color, #f0f0f0);
        color: var(--secondary-text-color, #727272);
        font: inherit;
        font-size: 12.5px;
        cursor: pointer;
        --mdc-icon-size: 14px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
      .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        flex: none;
      }
      .row .info {
        flex: 1;
        min-width: 0;
      }
      .row .nm {
        font-size: 13.5px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row .meta {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
      }
      .row .val {
        font-size: 13.5px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .btn {
        height: 30px;
        --mdc-icon-size: 16px;
      }
      .btn-shelve {
        background: color-mix(in srgb, #9c27b0 14%, transparent);
        color: #9c27b0;
      }
      .empty {
        text-align: center;
        padding: 20px 16px 28px;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 40px;
      }
      .empty .lbl {
        font-size: 14px;
        font-weight: 500;
        margin-top: 8px;
        color: var(--primary-text-color, #212121);
      }
      .more {
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        text-align: center;
        font-size: 13px;
        color: var(--secondary-text-color, #727272);
      }
    `]}setConfig(t){this._config={title:"Alarm Center",max_items:5,show_ack_button:!0,show_shelve_button:!0,default_shelve_minutes:15,...t},this._areaFilter=t.filter_area??""}getCardSize(){return 3}static getStubConfig(){return{type:"custom:scada-alarm-card",title:"Alarm Center",max_items:6}}firstUpdated(){this._load(),this._subscribe()}disconnectedCallback(){super.disconnectedCallback(),this._unsub?.()}updated(t){t.has("hass")&&!t.get("hass")&&this._load()}async _load(){this.hass&&(this._alarms=await(async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/list"})).alarms)(this.hass))}async _subscribe(){this.hass&&(this._unsub=await(async(t,e)=>t.connection.subscribeMessage(e,{type:"scada_alarm_manager/subscribe"}))(this.hass,()=>this._load()))}async _ack(t){this.hass&&await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/acknowledge",alarm_id:e})})(this.hass,t),this._load()}async _shelve(t){this.hass&&await(async(t,e,i)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/shelve",alarm_id:e,duration:i})})(this.hass,t,this._config.default_shelve_minutes??15),this._load()}get _active(){const t=this._config;return this._alarms.filter(t=>mt.includes(t.runtime.state)).filter(t=>!this._areaFilter||t.area===this._areaFilter).filter(e=>null==t.filter_priority||String(e.priority)===String(t.filter_priority)).filter(e=>!t.filter_channel||e.channel_id===t.filter_channel).sort((t,e)=>e.priority-t.priority||new Date(e.runtime.triggered_at??0).getTime()-new Date(t.runtime.triggered_at??0).getTime())}render(){if(!this._config)return B``;const t=this._config,e=this._active,i=e.length,s=e.filter(t=>3===t.priority).length,r=e.filter(t=>gt.includes(t.runtime.state)).length,o=s>0?"#f44336":i?"#ff9800":"#4caf50",n=_t.map(t=>({p:t,n:e.filter(e=>e.priority===t).length})).filter(t=>t.n>0),a=[...new Set(this._alarms.filter(t=>mt.includes(t.runtime.state)).map(t=>t.area))].filter(Boolean).sort(),l=e.slice(0,t.max_items);return B`
      <ha-card>
        <div class="head">
          <div class="ic" style=${`background:color-mix(in srgb, ${o} 16%, transparent); color:${o}`}>
            <ha-svg-icon .path=${"M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z"}></ha-svg-icon>
          </div>
          <div class="t">
            <div class="name">${t.title}</div>
            <div class="sub">
              ${this._areaFilter?`${this._areaFilter} · `:""}
              ${0===i?"All systems normal":`${i} active · ${r} unacknowledged`}
            </div>
          </div>
          ${i>0?B`<span
                class="pill"
                style=${`background:color-mix(in srgb, ${o} 15%, transparent); color:${o}`}
              >
                <ha-svg-icon .path=${s>0?"M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M13,17H11V15H13V17M13,13H11V7H13V13Z":"M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z"}></ha-svg-icon>${i}
              </span>`:Z}
        </div>

        ${i>0?B`<div class="bar">
              ${n.map(t=>B`<span style=${`flex:${t.n}; background:${ft(t.p)}`}></span>`)}
            </div>`:Z}

        ${t.selectable_area&&a.length>0?B`<div class="filter">
              <ha-svg-icon .path=${"M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z"}></ha-svg-icon>
              <div class="wrap">
                <select
                  .value=${this._areaFilter}
                  @change=${t=>this._areaFilter=t.target.value}
                >
                  <option value="">All areas</option>
                  ${a.map(t=>B`<option value=${t}>${t}</option>`)}
                </select>
                <ha-svg-icon class="chev" .path=${"M7,10L12,15L17,10H7Z"}></ha-svg-icon>
              </div>
              ${this._areaFilter?B`<button class="clear" @click=${()=>this._areaFilter=""}>
                    <ha-svg-icon .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}></ha-svg-icon>Clear
                  </button>`:Z}
            </div>`:Z}

        ${0===i?B`<div class="empty">
              <ha-svg-icon .path=${"M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"} style="color:#4caf50"></ha-svg-icon>
              <div class="lbl">No active alarms</div>
            </div>`:B`
              ${l.map(e=>{const i=gt.includes(e.runtime.state),s=ft(e.priority);return B`
                  <div class="row">
                    <span class="dot" style=${`background:${s}`}></span>
                    <div class="info">
                      <div class="nm">${e.name}</div>
                      <div class="meta">${e.area} · ${function(t){if(!t)return"—";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);if(e<60)return"just now";const i=Math.floor(e/60);if(i<60)return`${i}m ago`;const s=Math.floor(i/60);return s<24?`${s}h ago`:`${Math.floor(s/24)}d ago`}(e.runtime.triggered_at)}</div>
                    </div>
                    <span class="val" style=${`color:${s}`}>${e.runtime.last_value??"—"}</span>
                    ${!1!==t.show_ack_button&&i?B`<button class="btn btn-primary" @click=${()=>this._ack(e.id)}>ACK</button>`:!1!==t.show_shelve_button?B`<button class="btn btn-shelve" @click=${()=>this._shelve(e.id)} title="Shelve">
                          <ha-svg-icon .path=${"M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M15,9H9V11H12.24L9,13.7V16H15V14H11.76L15,11.3V9Z"}></ha-svg-icon>
                        </button>`:Z}
                  </div>
                `})}
              ${i>(t.max_items??5)?B`<div class="more">+ ${i-(t.max_items??5)} more</div>`:Z}
            `}
      </ha-card>
    `}};t([dt({attribute:!1})],$t.prototype,"hass",void 0),t([pt()],$t.prototype,"_config",void 0),t([pt()],$t.prototype,"_alarms",void 0),t([pt()],$t.prototype,"_areaFilter",void 0),$t=t([(t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)})("scada-alarm-card")],$t),window.customCards=window.customCards||[],window.customCards.push({type:"scada-alarm-card",name:"SCADA Alarm Card",description:"Compact monitoring card for the SCADA Alarm Manager."});export{$t as ScadaAlarmCard};
