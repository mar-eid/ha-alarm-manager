function t(t,e,i,a){var s,r=arguments.length,o=r<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(s=t[n])&&(o=(r<3?s(o):r>3?s(e,i,o):s(e,i))||o);return r>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),s=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,a)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new r(i,t,a)},n=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,a))(e)})(t):t,{is:l,defineProperty:h,getOwnPropertyDescriptor:c,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,g=_.trustedTypes,m=g?g.emptyScript:"",v=_.reactiveElementPolyfillSupport,f=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>!l(t,e),$={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:b};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),a=this.getPropertyDescriptor(t,i,e);void 0!==a&&h(this.prototype,t,a)}}static getPropertyDescriptor(t,e,i){const{get:a,set:s}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:a,set(e){const r=a?.call(this);s?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(n(t))}else void 0!==t&&e.push(n(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,a)=>{if(i)t.adoptedStyleSheets=a.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of a){const a=document.createElement("style"),s=e.litNonce;void 0!==s&&a.setAttribute("nonce",s),a.textContent=i.cssText,t.appendChild(a)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),a=this.constructor._$Eu(t,i);if(void 0!==a&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(a):this.setAttribute(a,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,a=i._$Eh.get(t);if(void 0!==a&&this._$Em!==a){const t=i.getPropertyOptions(a),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=a;const r=s.fromAttribute(e,t.type);this[a]=r??this._$Ej?.get(a)??r,this._$Em=null}}requestUpdate(t,e,i,a=!1,s){if(void 0!==t){const r=this.constructor;if(!1===a&&(s=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??b)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:a,wrapped:s},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==s||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===a&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,a=this[e];!0!==t||this._$AL.has(e)||void 0===a||this.C(e,void 0,i,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[f("elementProperties")]=new Map,w[f("finalized")]=new Map,v?.({ReactiveElement:w}),(_.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,A=t=>t,k=x.trustedTypes,C=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+S,T=`<${P}>`,N=document,M=()=>N.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,O=Array.isArray,I="[ \t\n\f\r]",L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,R=/>/g,H=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,q=/"/g,j=/^(?:script|style|textarea|title)$/i,F=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),V=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),W=new WeakMap,Y=N.createTreeWalker(N,129);function K(t,e){if(!O(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(e):e}const G=(t,e)=>{const i=t.length-1,a=[];let s,r=2===e?"<svg>":3===e?"<math>":"",o=L;for(let e=0;e<i;e++){const i=t[e];let n,l,h=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===L?"!--"===l[1]?o=z:void 0!==l[1]?o=R:void 0!==l[2]?(j.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=H):void 0!==l[3]&&(o=H):o===H?">"===l[0]?(o=s??L,h=-1):void 0===l[1]?h=-2:(h=o.lastIndex-l[2].length,n=l[1],o=void 0===l[3]?H:'"'===l[3]?q:D):o===q||o===D?o=H:o===z||o===R?o=L:(o=H,s=void 0);const d=o===H&&t[e+1].startsWith("/>")?" ":"";r+=o===L?i+T:h>=0?(a.push(n),i.slice(0,h)+E+i.slice(h)+S+d):i+S+(-2===h?e:d)}return[K(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),a]};class J{constructor({strings:t,_$litType$:e},i){let a;this.parts=[];let s=0,r=0;const o=t.length-1,n=this.parts,[l,h]=G(t,e);if(this.el=J.createElement(l,i),Y.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(a=Y.nextNode())&&n.length<o;){if(1===a.nodeType){if(a.hasAttributes())for(const t of a.getAttributeNames())if(t.endsWith(E)){const e=h[r++],i=a.getAttribute(t).split(S),o=/([.?@])?(.*)/.exec(e);n.push({type:1,index:s,name:o[2],strings:i,ctor:"."===o[1]?et:"?"===o[1]?it:"@"===o[1]?at:tt}),a.removeAttribute(t)}else t.startsWith(S)&&(n.push({type:6,index:s}),a.removeAttribute(t));if(j.test(a.tagName)){const t=a.textContent.split(S),e=t.length-1;if(e>0){a.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)a.append(t[i],M()),Y.nextNode(),n.push({type:2,index:++s});a.append(t[e],M())}}}else if(8===a.nodeType)if(a.data===P)n.push({type:2,index:s});else{let t=-1;for(;-1!==(t=a.data.indexOf(S,t+1));)n.push({type:7,index:s}),t+=S.length-1}s++}}static createElement(t,e){const i=N.createElement("template");return i.innerHTML=t,i}}function Z(t,e,i=t,a){if(e===V)return e;let s=void 0!==a?i._$Co?.[a]:i._$Cl;const r=U(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(t),s._$AT(t,i,a)),void 0!==a?(i._$Co??=[])[a]=s:i._$Cl=s),void 0!==s&&(e=Z(t,s._$AS(t,e.values),s,a)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,a=(t?.creationScope??N).importNode(e,!0);Y.currentNode=a;let s=Y.nextNode(),r=0,o=0,n=i[0];for(;void 0!==n;){if(r===n.index){let e;2===n.type?e=new X(s,s.nextSibling,this,t):1===n.type?e=new n.ctor(s,n.name,n.strings,this,t):6===n.type&&(e=new st(s,this,t)),this._$AV.push(e),n=i[++o]}r!==n?.index&&(s=Y.nextNode(),r++)}return Y.currentNode=N,a}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,a){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),U(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>O(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==B&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,a="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===a)this._$AH.p(e);else{const t=new Q(a,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new J(t)),e}k(t){O(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,a=0;for(const s of t)a===e.length?e.push(i=new X(this.O(M()),this.O(M()),this,this.options)):i=e[a],i._$AI(s),a++;a<e.length&&(this._$AR(i&&i._$AB.nextSibling,a),e.length=a)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,a,s){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=a,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}_$AI(t,e=this,i,a){const s=this.strings;let r=!1;if(void 0===s)t=Z(this,t,e,0),r=!U(t)||t!==this._$AH&&t!==V,r&&(this._$AH=t);else{const a=t;let o,n;for(t=s[0],o=0;o<s.length-1;o++)n=Z(this,a[i+o],e,o),n===V&&(n=this._$AH[o]),r||=!U(n)||n!==this._$AH[o],n===B?t=B:t!==B&&(t+=(n??"")+s[o+1]),this._$AH[o]=n}r&&!a&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==B)}}class at extends tt{constructor(t,e,i,a,s){super(t,e,i,a,s),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??B)===V)return;const i=this._$AH,a=t===B&&i!==B||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==B&&(i===B||a);a&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const rt=x.litHtmlPolyfillSupport;rt?.(J,X),(x.litHtmlVersions??=[]).push("3.3.3");const ot=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const a=i?.renderBefore??e;let s=a._$litPart$;if(void 0===s){const t=i?.renderBefore??null;a._$litPart$=s=new X(e.insertBefore(M(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}}nt._$litElement$=!0,nt.finalized=!0,ot.litElementHydrateSupport?.({LitElement:nt});const lt=ot.litElementPolyfillSupport;lt?.({LitElement:nt}),(ot.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ct={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:b},dt=(t=ct,e,i)=>{const{kind:a,metadata:s}=i;let r=globalThis.litPropertyMetadata.get(s);if(void 0===r&&globalThis.litPropertyMetadata.set(s,r=new Map),"setter"===a&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===a){const{name:a}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(a,s,t,!0,i)},init(e){return void 0!==e&&this.C(a,void 0,t,e),e}}}if("setter"===a){const{name:a}=i;return function(i){const s=this[a];e.call(this,i),this.requestUpdate(a,s,t,!0,i)}}throw Error("Unsupported decorator location: "+a)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pt(t){return(e,i)=>"object"==typeof i?dt(t,e,i):((t,e,i)=>{const a=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),a?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return pt({...t,state:!0,attribute:!1})}const _t=o`
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
`,gt=t=>({0:"#2196F3",1:"#FF9800",2:"#FF5722",3:"#F44336"}[t]??"#9E9E9E"),mt=t=>({normal:"#4CAF50",active_unacknowledged:"#F44336",active_acknowledged:"#FF9800",returned_to_normal_unacknowledged:"#FF9800",shelved:"#9C27B0",disabled:"#9E9E9E"}[t]??"#9E9E9E"),vt=async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/list"})).alarms,ft=async(t,e,i)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/shelve",alarm_id:e,duration:i})},yt=async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/list"})).channels,bt=async(t,e={})=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/event/list",...e})).events,$t={0:"Info",1:"Warning",2:"High",3:"Critical"},wt={normal:"Normal",active_unacknowledged:"Active (Unacked)",active_acknowledged:"Active (Acked)",returned_to_normal_unacknowledged:"RTN (Unacked)",shelved:"Shelved",disabled:"Disabled"};let xt=class extends nt{constructor(){super(...arguments),this.priority=0}static{this.styles=o`
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75em;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `}render(){const t=gt(this.priority),e=$t[this.priority]??"Unknown";return F`
      <span class="badge" style="background-color: ${t}">${e}</span>
    `}};t([pt({type:Number})],xt.prototype,"priority",void 0),xt=t([ht("severity-badge")],xt);let At=class extends nt{constructor(){super(...arguments),this._alarms=[],this._loading=!0,this._filterPriority="",this._filterName="",this._filterState="",this._filterSource=""}static{this.styles=[_t,o`
      :host { display: block; padding: 16px; }
      .header-actions { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
      .count-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 12px; border-radius: 16px; font-size: 0.85em; font-weight: 600;
      }
      .flashing { animation: flash 1s infinite alternate; }
      @keyframes flash { from { opacity: 1; } to { opacity: 0.5; } }
      .alarm-row-critical { border-left: 3px solid var(--alarm-critical); }
      .alarm-row-high { border-left: 3px solid var(--alarm-high); }
      .time-ago { font-size: 0.8em; color: var(--secondary-text-color); }
      .filter-row input, .filter-row select {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
    `]}connectedCallback(){super.connectedCallback(),this._loadAlarms(),this._subscribe()}disconnectedCallback(){super.disconnectedCallback(),this._unsub?.()}async _loadAlarms(){if(this.hass)try{const t=await vt(this.hass);this._alarms=t.filter(t=>"active_unacknowledged"===t.runtime.state||"active_acknowledged"===t.runtime.state||"returned_to_normal_unacknowledged"===t.runtime.state)}finally{this._loading=!1}}async _subscribe(){this.hass&&(this._unsub=await(async(t,e)=>t.connection.subscribeMessage(e,{type:"scada_alarm_manager/subscribe"}))(this.hass,()=>{this._loadAlarms()}))}get _filtered(){return this._alarms.filter(t=>(!this._filterPriority||String(t.priority)===this._filterPriority)&&(!(this._filterName&&!t.name.toLowerCase().includes(this._filterName.toLowerCase()))&&((!this._filterState||t.runtime.state===this._filterState)&&!(this._filterSource&&!t.source_entity_id.toLowerCase().includes(this._filterSource.toLowerCase()))))).sort((t,e)=>e.priority-t.priority)}async _ack(t){this.hass&&(await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/acknowledge",alarm_id:e})})(this.hass,t),this._loadAlarms())}async _shelve(t){if(!this.hass)return;const e=prompt("Shelve duration in minutes:","15");if(null===e)return;const i=parseInt(e,10);isNaN(i)||i<1||(await ft(this.hass,t,i),this._loadAlarms())}render(){if(this._loading)return F`<div class="empty-state">Loading...</div>`;if(0===this._alarms.length)return F`
        <div class="empty-state">
          <div class="icon">&#x2714;</div>
          <div>No active alarms</div>
        </div>
      `;const t=this._filtered;return F`
      <div class="header-actions">
        <span class="count-badge" style="background: ${gt(3)}22; color: ${gt(3)}">
          ${this._alarms.length} active
        </span>
        ${t.length!==this._alarms.length?F`<span style="font-size: 0.85em; color: var(--secondary-text-color);">(showing ${t.length})</span>`:""}
      </div>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Name</th>
            <th>State</th>
            <th>Source</th>
            <th>Value</th>
            <th>Triggered</th>
            <th>Actions</th>
          </tr>
          <tr class="filter-row">
            <th>
              <select @change=${t=>this._filterPriority=t.target.value}>
                <option value="">All</option>
                ${[0,1,2,3].map(t=>F`<option value=${t}>${$t[t]}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterName} @input=${t=>this._filterName=t.target.value} /></th>
            <th>
              <select @change=${t=>this._filterState=t.target.value}>
                <option value="">All</option>
                ${["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"].map(t=>F`<option value=${t}>${wt[t]}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterSource} @input=${t=>this._filterSource=t.target.value} /></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${t.map(t=>{const e=t.priority>=3?"alarm-row-critical":t.priority>=2?"alarm-row-high":"",i="active_unacknowledged"===t.runtime.state||"returned_to_normal_unacknowledged"===t.runtime.state;return F`
              <tr class="${e} ${t.priority>=3&&i?"flashing":""}">
                <td><severity-badge .priority=${t.priority}></severity-badge></td>
                <td><strong>${t.name}</strong>${t.area?F`<br><span class="time-ago">${t.area}</span>`:""}</td>
                <td><span class="badge" style="background: ${mt(t.runtime.state)}">${wt[t.runtime.state]??t.runtime.state}</span></td>
                <td>${t.source_entity_id}</td>
                <td>${t.runtime.last_value??"-"}</td>
                <td class="time-ago">${t.runtime.triggered_at?new Date(t.runtime.triggered_at).toLocaleString():"-"}</td>
                <td class="actions">
                  ${i?F`<button class="btn btn-primary btn-small" @click=${()=>this._ack(t.id)}>ACK</button>`:""}
                  <button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${()=>this._shelve(t.id)}>Shelve</button>
                </td>
              </tr>
            `})}
        </tbody>
      </table>
    `}};t([pt({attribute:!1})],At.prototype,"hass",void 0),t([ut()],At.prototype,"_alarms",void 0),t([ut()],At.prototype,"_loading",void 0),t([ut()],At.prototype,"_filterPriority",void 0),t([ut()],At.prototype,"_filterName",void 0),t([ut()],At.prototype,"_filterState",void 0),t([ut()],At.prototype,"_filterSource",void 0),At=t([ht("active-alarms-view")],At);let kt=class extends nt{constructor(){super(...arguments),this._alarms=[],this._channels=[],this._loading=!0,this._filterPriority="",this._filterName="",this._filterState="",this._filterEntity="",this._filterTrigger="",this._filterChannel="",this._filterEnabled=""}static{this.styles=[_t,o`
      :host { display: block; padding: 16px; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .filter-row input, .filter-row select {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
      .test-ok { color: var(--alarm-normal, #4CAF50); font-size: 0.8em; }
    `]}connectedCallback(){super.connectedCallback(),this._load()}async _load(){if(this.hass)try{const[t,e]=await Promise.all([vt(this.hass),yt(this.hass)]);this._alarms=t,this._channels=e}finally{this._loading=!1}}_getChannelName(t){if(!t)return"-";const e=this._channels.find(e=>e.id===t);return e?e.name:t}get _filtered(){return this._alarms.filter(t=>{if(this._filterPriority&&String(t.priority)!==this._filterPriority)return!1;if(this._filterName&&!t.name.toLowerCase().includes(this._filterName.toLowerCase()))return!1;if(this._filterState&&t.runtime.state!==this._filterState)return!1;if(this._filterEntity&&!t.source_entity_id.toLowerCase().includes(this._filterEntity.toLowerCase()))return!1;if(this._filterTrigger&&t.trigger_type!==this._filterTrigger)return!1;if(this._filterChannel){if(!this._getChannelName(t.channel_id).toLowerCase().includes(this._filterChannel.toLowerCase()))return!1}return!("yes"===this._filterEnabled&&!t.enabled)&&("no"!==this._filterEnabled||!t.enabled)})}async _delete(t){this.hass&&confirm("Delete this alarm?")&&(await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/delete",alarm_id:e})})(this.hass,t),this._load())}_edit(t){this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"create-edit",alarmId:t},bubbles:!0,composed:!0}))}async _testNotification(t){this.hass&&t.channel_id&&await this.hass.callService("scada_alarm_manager","test_notification",{channel_id:t.channel_id})}async _shelve(t){if(!this.hass)return;const e=prompt("Shelve duration in minutes:","15");if(null===e)return;const i=parseInt(e,10);isNaN(i)||i<1||(await ft(this.hass,t,i),this._load())}async _unshelve(t){this.hass&&(await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/unshelve",alarm_id:e})})(this.hass,t),this._load())}render(){if(this._loading)return F`<div class="empty-state">Loading...</div>`;const t=this._filtered;return F`
      <div class="toolbar">
        <span>${t.length} of ${this._alarms.length} alarm${1!==this._alarms.length?"s":""}</span>
        <button class="btn btn-primary" @click=${()=>this._edit("")}>+ New Alarm</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Name</th>
            <th>State</th>
            <th>Source Entity</th>
            <th>Trigger</th>
            <th>Channel</th>
            <th>Enabled</th>
            <th>Actions</th>
          </tr>
          <tr class="filter-row">
            <th>
              <select @change=${t=>this._filterPriority=t.target.value}>
                <option value="">All</option>
                ${[0,1,2,3].map(t=>F`<option value=${t}>${$t[t]}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterName} @input=${t=>this._filterName=t.target.value} /></th>
            <th>
              <select @change=${t=>this._filterState=t.target.value}>
                <option value="">All</option>
                ${Object.entries(wt).map(([t,e])=>F`<option value=${t}>${e}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterEntity} @input=${t=>this._filterEntity=t.target.value} /></th>
            <th>
              <select @change=${t=>this._filterTrigger=t.target.value}>
                <option value="">All</option>
                <option value="analog">Analog</option>
                <option value="digital">Digital</option>
                <option value="custom_state">Custom</option>
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterChannel} @input=${t=>this._filterChannel=t.target.value} /></th>
            <th>
              <select @change=${t=>this._filterEnabled=t.target.value}>
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${t.map(t=>F`
              <tr>
                <td><severity-badge .priority=${t.priority}></severity-badge></td>
                <td>
                  <strong>${t.name}</strong>
                  ${"shelved"===t.runtime.state&&t.runtime.shelved_until?F`<br><span style="font-size: 0.75em; color: var(--secondary-text-color);">Until ${new Date(t.runtime.shelved_until).toLocaleString()}</span>`:""}
                </td>
                <td><span class="badge" style="background: ${mt(t.runtime.state)}">${wt[t.runtime.state]??t.runtime.state}</span></td>
                <td>${t.source_entity_id}</td>
                <td>${t.trigger_type}</td>
                <td>${this._getChannelName(t.channel_id)}</td>
                <td>${t.enabled?"Yes":"No"}</td>
                <td class="actions">
                  ${"shelved"===t.runtime.state?F`<button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${()=>this._unshelve(t.id)}>Unshelve</button>`:"disabled"!==t.runtime.state&&"normal"!==t.runtime.state?F`<button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${()=>this._shelve(t.id)}>Shelve</button>`:""}
                  ${t.channel_id?F`<button class="btn btn-small" style="background: #607D8B; color: white;" @click=${()=>this._testNotification(t)} title="Test notification">Test</button>`:""}
                  <button class="btn btn-small btn-primary" @click=${()=>this._edit(t.id)}>Edit</button>
                  <button class="btn btn-small btn-danger" @click=${()=>this._delete(t.id)}>Delete</button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
    `}};t([pt({attribute:!1})],kt.prototype,"hass",void 0),t([ut()],kt.prototype,"_alarms",void 0),t([ut()],kt.prototype,"_channels",void 0),t([ut()],kt.prototype,"_loading",void 0),t([ut()],kt.prototype,"_filterPriority",void 0),t([ut()],kt.prototype,"_filterName",void 0),t([ut()],kt.prototype,"_filterState",void 0),t([ut()],kt.prototype,"_filterEntity",void 0),t([ut()],kt.prototype,"_filterTrigger",void 0),t([ut()],kt.prototype,"_filterChannel",void 0),t([ut()],kt.prototype,"_filterEnabled",void 0),kt=t([ht("all-alarms-view")],kt);let Ct=class extends nt{constructor(){super(...arguments),this._events=[],this._loading=!0,this._offset=0,this._limit=50,this._filterAlarm="",this._filterEvent="",this._filterUser=""}static{this.styles=[_t,o`
      :host { display: block; padding: 16px; }
      .pagination { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
      .event-type {
        display: inline-block; padding: 2px 6px; border-radius: 4px;
        font-size: 0.8em; font-weight: 500; text-transform: capitalize;
        background: var(--secondary-background-color, #f5f5f5);
      }
      .filter-row input, .filter-row select {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
    `]}connectedCallback(){super.connectedCallback(),this._loadEvents()}async _loadEvents(){if(this.hass)try{this._events=await bt(this.hass,{limit:this._limit,offset:this._offset})}finally{this._loading=!1}}get _filtered(){return this._events.filter(t=>!(this._filterAlarm&&!t.alarm_name.toLowerCase().includes(this._filterAlarm.toLowerCase()))&&((!this._filterEvent||t.event_type===this._filterEvent)&&!(this._filterUser&&!(t.user??"").toLowerCase().includes(this._filterUser.toLowerCase()))))}_nextPage(){this._offset+=this._limit,this._loading=!0,this._loadEvents()}_prevPage(){this._offset=Math.max(0,this._offset-this._limit),this._loading=!0,this._loadEvents()}render(){if(this._loading)return F`<div class="empty-state">Loading...</div>`;if(0===this._events.length&&0===this._offset)return F`<div class="empty-state">No alarm events recorded yet.</div>`;const t=[...new Set(this._events.map(t=>t.event_type))].sort(),e=this._filtered;return F`
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Alarm</th>
            <th>Event</th>
            <th>Old State</th>
            <th>New State</th>
            <th>User</th>
          </tr>
          <tr class="filter-row">
            <th></th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterAlarm} @input=${t=>this._filterAlarm=t.target.value} /></th>
            <th>
              <select @change=${t=>this._filterEvent=t.target.value}>
                <option value="">All</option>
                ${t.map(t=>F`<option value=${t}>${t}</option>`)}
              </select>
            </th>
            <th></th>
            <th></th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterUser} @input=${t=>this._filterUser=t.target.value} /></th>
          </tr>
        </thead>
        <tbody>
          ${e.map(t=>F`
              <tr>
                <td>${new Date(t.timestamp).toLocaleString()}</td>
                <td><strong>${t.alarm_name}</strong></td>
                <td><span class="event-type">${t.event_type}</span></td>
                <td>${t.old_state?F`<span class="badge" style="background: ${mt(t.old_state)}">${wt[t.old_state]??t.old_state}</span>`:"-"}</td>
                <td>${t.new_state?F`<span class="badge" style="background: ${mt(t.new_state)}">${wt[t.new_state]??t.new_state}</span>`:"-"}</td>
                <td>${t.user??"-"}</td>
              </tr>
            `)}
        </tbody>
      </table>
      <div class="pagination">
        <button class="btn btn-small" ?disabled=${0===this._offset} @click=${this._prevPage}>Previous</button>
        <span>Page ${Math.floor(this._offset/this._limit)+1}</span>
        <button class="btn btn-small" ?disabled=${this._events.length<this._limit} @click=${this._nextPage}>Next</button>
      </div>
    `}};t([pt({attribute:!1})],Ct.prototype,"hass",void 0),t([ut()],Ct.prototype,"_events",void 0),t([ut()],Ct.prototype,"_loading",void 0),t([ut()],Ct.prototype,"_offset",void 0),t([ut()],Ct.prototype,"_filterAlarm",void 0),t([ut()],Ct.prototype,"_filterEvent",void 0),t([ut()],Ct.prototype,"_filterUser",void 0),Ct=t([ht("history-view")],Ct);let Et=class extends nt{constructor(){super(...arguments),this._channels=[],this._loading=!0,this._editing=null,this._formName="",this._formTargets="",this._formMinPriority=0,this._formPersistent=!0,this._formMobile=!0,this._formCritical=!1,this._filterName=""}static{this.styles=[_t,o`
      :host { display: block; padding: 16px; }
      .form-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px; margin-bottom: 16px;
      }
      .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
      .form-row > * { flex: 1; min-width: 200px; }
      .checkbox-group { display: flex; gap: 16px; align-items: center; margin: 8px 0; }
      .checkbox-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.9em; }
      .filter-row input {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
    `]}connectedCallback(){super.connectedCallback(),this._loadChannels()}async _loadChannels(){if(this.hass)try{this._channels=await yt(this.hass)}finally{this._loading=!1}}_startCreate(){this._editing={},this._formName="",this._formTargets="",this._formMinPriority=0,this._formPersistent=!0,this._formMobile=!0,this._formCritical=!1}_startEdit(t){this._editing=t,this._formName=t.name,this._formTargets=t.notification_targets.join(", "),this._formMinPriority=t.min_priority,this._formPersistent=t.persistent_notification,this._formMobile=t.mobile_push,this._formCritical=t.critical_notification}async _save(){if(!this.hass||!this._formName.trim())return;const t=this._formTargets.split(",").map(t=>t.trim()).filter(Boolean),e={name:this._formName.trim(),notification_targets:t,min_priority:this._formMinPriority,persistent_notification:this._formPersistent,mobile_push:this._formMobile,critical_notification:this._formCritical};this._editing?.id?await(async(t,e,i)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/update",channel_id:e,...i}))(this.hass,this._editing.id,e):await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/create",...e}))(this.hass,e),this._editing=null,this._loadChannels()}async _delete(t){this.hass&&confirm("Delete this channel?")&&(await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/delete",channel_id:e})})(this.hass,t),this._loadChannels())}render(){return this._loading?F`<div class="empty-state">Loading...</div>`:F`
      ${null!==this._editing?this._renderForm():""}
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span>${this._channels.length} channel${1!==this._channels.length?"s":""}</span>
        <button class="btn btn-primary" @click=${this._startCreate}>+ New Channel</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Targets</th>
            <th>Min Priority</th>
            <th>Persistent</th>
            <th>Mobile</th>
            <th>Critical</th>
            <th>Actions</th>
          </tr>
          <tr class="filter-row">
            <th><input type="text" placeholder="Filter..." .value=${this._filterName} @input=${t=>this._filterName=t.target.value} /></th>
            <th></th><th></th><th></th><th></th><th></th><th></th>
          </tr>
        </thead>
        <tbody>
          ${this._channels.filter(t=>!this._filterName||t.name.toLowerCase().includes(this._filterName.toLowerCase())).map(t=>F`
              <tr>
                <td><strong>${t.name}</strong></td>
                <td>${t.notification_targets.join(", ")||"-"}</td>
                <td>${$t[t.min_priority]??"Info"}</td>
                <td>${t.persistent_notification?"Yes":"No"}</td>
                <td>${t.mobile_push?"Yes":"No"}</td>
                <td>${t.critical_notification?"Yes":"No"}</td>
                <td class="actions">
                  <button class="btn btn-small btn-primary" @click=${()=>this._startEdit(t)}>Edit</button>
                  <button class="btn btn-small btn-danger" @click=${()=>this._delete(t.id)}>Delete</button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
    `}_renderForm(){return F`
      <div class="form-card">
        <h3>${this._editing?.id?"Edit Channel":"New Channel"}</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Name</label>
            <input type="text" .value=${this._formName} @input=${t=>this._formName=t.target.value} />
          </div>
          <div class="form-group">
            <label>Notification Targets (comma-separated)</label>
            <input type="text" .value=${this._formTargets} @input=${t=>this._formTargets=t.target.value} placeholder="notify.mobile_app_phone1, notify.mobile_app_phone2" />
          </div>
        </div>
        <div class="form-group">
          <label>Minimum Priority</label>
          <select .value=${String(this._formMinPriority)} @change=${t=>this._formMinPriority=Number(t.target.value)}>
            <option value="0">Info</option>
            <option value="1">Warning</option>
            <option value="2">High</option>
            <option value="3">Critical</option>
          </select>
        </div>
        <div class="checkbox-group">
          <label><input type="checkbox" .checked=${this._formPersistent} @change=${t=>this._formPersistent=t.target.checked} /> Persistent Notifications</label>
          <label><input type="checkbox" .checked=${this._formMobile} @change=${t=>this._formMobile=t.target.checked} /> Mobile Push</label>
          <label><input type="checkbox" .checked=${this._formCritical} @change=${t=>this._formCritical=t.target.checked} /> Critical Alerts</label>
        </div>
        <div class="actions">
          <button class="btn btn-primary" @click=${this._save}>Save</button>
          <button class="btn" style="background: var(--secondary-background-color)" @click=${()=>this._editing=null}>Cancel</button>
        </div>
      </div>
    `}};t([pt({attribute:!1})],Et.prototype,"hass",void 0),t([ut()],Et.prototype,"_channels",void 0),t([ut()],Et.prototype,"_loading",void 0),t([ut()],Et.prototype,"_editing",void 0),t([ut()],Et.prototype,"_formName",void 0),t([ut()],Et.prototype,"_formTargets",void 0),t([ut()],Et.prototype,"_formMinPriority",void 0),t([ut()],Et.prototype,"_formPersistent",void 0),t([ut()],Et.prototype,"_formMobile",void 0),t([ut()],Et.prototype,"_formCritical",void 0),t([ut()],Et.prototype,"_filterName",void 0),Et=t([ht("channels-view")],Et);let St=class extends nt{constructor(){super(...arguments),this._channels=[],this._loading=!0,this._saving=!1,this._name="",this._description="",this._sourceEntityId="",this._triggerType="digital",this._priority=1,this._area="",this._equipment="",this._tag="",this._channelId=null,this._enabled=!0,this._latching=!1,this._ackRequired=!0,this._autoClear=!0,this._analogOperator=">",this._analogThreshold="0",this._digitalTargetState="on",this._customMatchValues=""}static{this.styles=[_t,o`
      :host { display: block; padding: 16px; max-width: 800px; }
      .form-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 24px;
      }
      h2 { margin-top: 0; }
      .section { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--divider-color); }
      .section h3 { margin-top: 0; font-size: 1em; color: var(--secondary-text-color); }
      .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
      .form-row > * { flex: 1; min-width: 200px; }
      .checkbox-group { display: flex; gap: 16px; align-items: center; margin: 12px 0; flex-wrap: wrap; }
      .checkbox-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.9em; }
      .success { color: var(--alarm-normal); margin-top: 8px; }
    `]}connectedCallback(){super.connectedCallback(),this._load()}updated(t){t.has("alarmId")&&this._load()}async _load(){if(this.hass){this._loading=!0;try{if(this._channels=await yt(this.hass),this.alarmId){const t=await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/get",alarm_id:e}))(this.hass,this.alarmId);this._name=t.name,this._description=t.description,this._sourceEntityId=t.source_entity_id,this._triggerType=t.trigger_type,this._priority=t.priority,this._area=t.area,this._equipment=t.equipment,this._tag=t.tag,this._channelId=t.channel_id,this._enabled=t.enabled,this._latching=t.latching,this._ackRequired=t.ack_required,this._autoClear=t.auto_clear,"analog"===t.trigger_type?(this._analogOperator=t.trigger_config.operator??">",this._analogThreshold=String(t.trigger_config.threshold??0)):"digital"===t.trigger_type?this._digitalTargetState=t.trigger_config.target_state??"on":"custom_state"===t.trigger_type&&(this._customMatchValues=(t.trigger_config.match_values??[]).join(", "))}else this._resetForm()}finally{this._loading=!1}}}_resetForm(){this._name="",this._description="",this._sourceEntityId="",this._triggerType="digital",this._priority=1,this._area="",this._equipment="",this._tag="",this._channelId=null,this._enabled=!0,this._latching=!1,this._ackRequired=!0,this._autoClear=!0,this._analogOperator=">",this._analogThreshold="0",this._digitalTargetState="on",this._customMatchValues=""}_buildTriggerConfig(){switch(this._triggerType){case"analog":return{operator:this._analogOperator,threshold:parseFloat(this._analogThreshold)};case"digital":return{target_state:this._digitalTargetState};case"custom_state":return{match_values:this._customMatchValues.split(",").map(t=>t.trim()).filter(Boolean)}}}async _save(){if(this.hass&&this._name.trim()&&this._sourceEntityId.trim()){this._saving=!0;try{const t={name:this._name.trim(),description:this._description,source_entity_id:this._sourceEntityId.trim(),trigger_type:this._triggerType,trigger_config:this._buildTriggerConfig(),priority:this._priority,area:this._area,equipment:this._equipment,tag:this._tag,channel_id:this._channelId,enabled:this._enabled,latching:this._latching,ack_required:this._ackRequired,auto_clear:this._autoClear};this.alarmId?await(async(t,e,i)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/update",alarm_id:e,...i}))(this.hass,this.alarmId,t):(await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/create",...e}))(this.hass,t),this._resetForm()),this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"all"},bubbles:!0,composed:!0}))}finally{this._saving=!1}}}render(){return this._loading?F`<div class="empty-state">Loading...</div>`:F`
      <div class="form-card">
        <h2>${this.alarmId?"Edit Alarm":"Create New Alarm"}</h2>

        <div class="form-row">
          <div class="form-group">
            <label>Alarm Name *</label>
            <input type="text" .value=${this._name} @input=${t=>this._name=t.target.value} placeholder="e.g. Kitchen Temperature High" />
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select .value=${String(this._priority)} @change=${t=>this._priority=Number(t.target.value)}>
              <option value="0">Info</option>
              <option value="1">Warning</option>
              <option value="2">High</option>
              <option value="3">Critical</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea rows="2" .value=${this._description} @input=${t=>this._description=t.target.value}></textarea>
        </div>

        <div class="form-row">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._sourceEntityId}
            @value-changed=${t=>this._sourceEntityId=t.detail.value}
            allow-custom-entity
            .label=${"Source Entity *"}
          ></ha-entity-picker>
          <div class="form-group">
            <label>Channel</label>
            <select .value=${this._channelId??""} @change=${t=>{const e=t.target.value;this._channelId=e||null}}>
              <option value="">No channel</option>
              ${this._channels.map(t=>F`<option value=${t.id}>${t.name}</option>`)}
            </select>
          </div>
        </div>

        <div class="section">
          <h3>Location / Equipment</h3>
          <div class="form-row">
            <ha-area-picker
              .hass=${this.hass}
              .value=${this._area}
              @value-changed=${t=>this._area=t.detail.value||""}
              .label=${"Area"}
            ></ha-area-picker>
            <div class="form-group">
              <label>Equipment</label>
              <input type="text" .value=${this._equipment} @input=${t=>this._equipment=t.target.value} placeholder="Oven" />
            </div>
            <div class="form-group">
              <label>Tag</label>
              <input type="text" .value=${this._tag} @input=${t=>this._tag=t.target.value} placeholder="TT-101" />
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Trigger Configuration</h3>
          <div class="form-group">
            <label>Trigger Type</label>
            <select .value=${this._triggerType} @change=${t=>this._triggerType=t.target.value}>
              <option value="analog">Analog (threshold)</option>
              <option value="digital">Digital (state match)</option>
              <option value="custom_state">Custom State (value list)</option>
            </select>
          </div>

          ${"analog"===this._triggerType?F`
            <div class="form-row">
              <div class="form-group">
                <label>Operator</label>
                <select .value=${this._analogOperator} @change=${t=>this._analogOperator=t.target.value}>
                  <option value=">">Greater than (&gt;)</option>
                  <option value=">=">Greater or equal (&gt;=)</option>
                  <option value="<">Less than (&lt;)</option>
                  <option value="<=">Less or equal (&lt;=)</option>
                  <option value="==">Equal (==)</option>
                  <option value="!=">Not equal (!=)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Threshold</label>
                <input type="number" step="any" .value=${this._analogThreshold} @input=${t=>this._analogThreshold=t.target.value} />
              </div>
            </div>
          `:""}

          ${"digital"===this._triggerType?F`
            <div class="form-group">
              <label>Target State</label>
              <input type="text" .value=${this._digitalTargetState} @input=${t=>this._digitalTargetState=t.target.value} placeholder="on" />
            </div>
          `:""}

          ${"custom_state"===this._triggerType?F`
            <div class="form-group">
              <label>Match Values (comma-separated)</label>
              <input type="text" .value=${this._customMatchValues} @input=${t=>this._customMatchValues=t.target.value} placeholder="error, fault, offline" />
            </div>
          `:""}
        </div>

        <div class="section">
          <h3>Behavior</h3>
          <div class="checkbox-group">
            <label><input type="checkbox" .checked=${this._enabled} @change=${t=>this._enabled=t.target.checked} /> Enabled</label>
            <label><input type="checkbox" .checked=${this._latching} @change=${t=>this._latching=t.target.checked} /> Latching</label>
            <label><input type="checkbox" .checked=${this._ackRequired} @change=${t=>this._ackRequired=t.target.checked} /> Acknowledge Required</label>
            <label><input type="checkbox" .checked=${this._autoClear} @change=${t=>this._autoClear=t.target.checked} /> Auto Clear</label>
          </div>
        </div>

        <div class="actions" style="margin-top: 24px;">
          <button class="btn btn-primary" ?disabled=${this._saving} @click=${this._save}>
            ${this._saving?"Saving...":this.alarmId?"Update Alarm":"Create Alarm"}
          </button>
          <button class="btn" style="background: var(--secondary-background-color)" @click=${()=>this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"all"},bubbles:!0,composed:!0}))}>
            Cancel
          </button>
        </div>
      </div>
    `}};t([pt({attribute:!1})],St.prototype,"hass",void 0),t([pt()],St.prototype,"alarmId",void 0),t([ut()],St.prototype,"_channels",void 0),t([ut()],St.prototype,"_loading",void 0),t([ut()],St.prototype,"_saving",void 0),t([ut()],St.prototype,"_name",void 0),t([ut()],St.prototype,"_description",void 0),t([ut()],St.prototype,"_sourceEntityId",void 0),t([ut()],St.prototype,"_triggerType",void 0),t([ut()],St.prototype,"_priority",void 0),t([ut()],St.prototype,"_area",void 0),t([ut()],St.prototype,"_equipment",void 0),t([ut()],St.prototype,"_tag",void 0),t([ut()],St.prototype,"_channelId",void 0),t([ut()],St.prototype,"_enabled",void 0),t([ut()],St.prototype,"_latching",void 0),t([ut()],St.prototype,"_ackRequired",void 0),t([ut()],St.prototype,"_autoClear",void 0),t([ut()],St.prototype,"_analogOperator",void 0),t([ut()],St.prototype,"_analogThreshold",void 0),t([ut()],St.prototype,"_digitalTargetState",void 0),t([ut()],St.prototype,"_customMatchValues",void 0),St=t([ht("create-edit-view")],St);let Pt=class extends nt{constructor(){super(...arguments),this._alarmCount=0,this._channelCount=0,this._eventCount=0,this._loading=!0}static{this.styles=[_t,o`
      :host { display: block; padding: 16px; max-width: 600px; }
      .stats-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px; margin-bottom: 24px;
      }
      .stat-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px; text-align: center;
      }
      .stat-value { font-size: 2em; font-weight: 600; color: var(--primary-color); }
      .stat-label { font-size: 0.85em; color: var(--secondary-text-color); margin-top: 4px; }
      .info-section {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px;
      }
      .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
      .info-row:last-child { border-bottom: none; }
    `]}connectedCallback(){super.connectedCallback(),this._loadStats()}async _loadStats(){if(this.hass)try{const[t,e,i]=await Promise.all([vt(this.hass),yt(this.hass),bt(this.hass,{limit:1})]);this._alarmCount=t.length,this._channelCount=e.length,this._eventCount=i.length>0?-1:0}finally{this._loading=!1}}render(){return this._loading?F`<div class="empty-state">Loading...</div>`:F`
      <h2>System Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${this._alarmCount}</div>
          <div class="stat-label">Alarms Configured</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._channelCount}</div>
          <div class="stat-label">Channels</div>
        </div>
      </div>

      <div class="info-section">
        <h3>About</h3>
        <div class="info-row">
          <span>Integration</span>
          <span>SCADA Alarm Manager</span>
        </div>
        <div class="info-row">
          <span>Version</span>
          <span>0.1.0</span>
        </div>
        <div class="info-row">
          <span>Domain</span>
          <span>scada_alarm_manager</span>
        </div>
      </div>

      <p style="margin-top: 24px; font-size: 0.85em; color: var(--secondary-text-color);">
        To change global settings (notification repeat interval, escalation delay, history retention),
        go to Settings &rarr; Integrations &rarr; SCADA Alarm Manager &rarr; Options.
      </p>
    `}};t([pt({attribute:!1})],Pt.prototype,"hass",void 0),t([ut()],Pt.prototype,"_alarmCount",void 0),t([ut()],Pt.prototype,"_channelCount",void 0),t([ut()],Pt.prototype,"_eventCount",void 0),t([ut()],Pt.prototype,"_loading",void 0),Pt=t([ht("settings-view")],Pt);const Tt=[{id:"active",label:"Active Alarms",icon:"🔴"},{id:"all",label:"All Alarms",icon:"📋"},{id:"history",label:"History",icon:"📜"},{id:"channels",label:"Channels",icon:"📡"},{id:"create-edit",label:"Create / Edit",icon:"✏️"},{id:"settings",label:"Settings",icon:"⚙️"}];let Nt=class extends nt{constructor(){super(...arguments),this._activeTab="active",this._handleNavigate=t=>{const{view:e,alarmId:i}=t.detail;this._activeTab=e,this._editAlarmId=i}}static{this.styles=[_t,o`
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--primary-background-color, #fafafa);
      }

      .header {
        background: var(--app-header-background-color, var(--primary-color));
        color: var(--app-header-text-color, white);
        padding: 16px 24px;
        font-size: 1.4em;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-icon {
        font-size: 1.2em;
      }

      .content {
        flex: 1;
        overflow-y: auto;
      }
    `]}connectedCallback(){super.connectedCallback(),this.addEventListener("navigate",this._handleNavigate)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("navigate",this._handleNavigate)}_setTab(t){this._activeTab=t,"create-edit"!==t&&(this._editAlarmId=void 0)}render(){return F`
      <div class="header">
        <span class="header-icon">&#x1F6A8;</span>
        <span>SCADA Alarm Center</span>
      </div>

      <div class="tabs">
        ${Tt.map(t=>F`
            <button
              class="tab ${this._activeTab===t.id?"active":""}"
              @click=${()=>this._setTab(t.id)}
            >
              ${t.label}
            </button>
          `)}
      </div>

      <div class="content">
        ${this._renderView()}
      </div>
    `}_renderView(){switch(this._activeTab){case"active":default:return F`<active-alarms-view .hass=${this.hass}></active-alarms-view>`;case"all":return F`<all-alarms-view .hass=${this.hass}></all-alarms-view>`;case"history":return F`<history-view .hass=${this.hass}></history-view>`;case"channels":return F`<channels-view .hass=${this.hass}></channels-view>`;case"create-edit":return F`<create-edit-view .hass=${this.hass} .alarmId=${this._editAlarmId??""}></create-edit-view>`;case"settings":return F`<settings-view .hass=${this.hass}></settings-view>`}}};t([pt({attribute:!1})],Nt.prototype,"hass",void 0),t([pt({attribute:!1})],Nt.prototype,"panel",void 0),t([ut()],Nt.prototype,"_activeTab",void 0),t([ut()],Nt.prototype,"_editAlarmId",void 0),Nt=t([ht("scada-alarm-center-panel")],Nt);export{Nt as ScadaAlarmCenterPanel};
