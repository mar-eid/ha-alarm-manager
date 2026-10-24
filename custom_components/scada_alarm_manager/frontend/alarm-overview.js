function t(t,e,i,a){var r,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(r=t[n])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),r=new WeakMap;let s=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const o=t=>new s("string"==typeof t?t:t+"",void 0,a),n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,a)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new s(i,t,a)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return o(e)})(t):t,{is:d,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:p,getOwnPropertySymbols:m,getPrototypeOf:u}=Object,g=globalThis,_=g.trustedTypes,v=_?_.emptyScript:"",f=g.reactiveElementPolyfillSupport,b=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?v:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},$=(t,e)=>!d(t,e),x={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:$};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=x){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),a=this.getPropertyDescriptor(t,i,e);void 0!==a&&c(this.prototype,t,a)}}static getPropertyDescriptor(t,e,i){const{get:a,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:a,set(e){const s=a?.call(this);r?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??x}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...p(t),...m(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,a)=>{if(i)t.adoptedStyleSheets=a.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of a){const a=document.createElement("style"),r=e.litNonce;void 0!==r&&a.setAttribute("nonce",r),a.textContent=i.cssText,t.appendChild(a)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),a=this.constructor._$Eu(t,i);if(void 0!==a&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(a):this.setAttribute(a,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,a=i._$Eh.get(t);if(void 0!==a&&this._$Em!==a){const t=i.getPropertyOptions(a),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=a;const s=r.fromAttribute(e,t.type);this[a]=s??this._$Ej?.get(a)??s,this._$Em=null}}requestUpdate(t,e,i,a=!1,r){if(void 0!==t){const s=this.constructor;if(!1===a&&(r=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??$)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:a,wrapped:r},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==r||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===a&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,a=this[e];!0!==t||this._$AL.has(e)||void 0===a||this.C(e,void 0,i,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[b("elementProperties")]=new Map,w[b("finalized")]=new Map,f?.({ReactiveElement:w}),(g.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const k=globalThis,A=t=>t,C=k.trustedTypes,S=C?C.createPolicy("lit-html",{createHTML:t=>t}):void 0,H="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+E,M=`<${L}>`,V=document,T=()=>V.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,N="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,F=/-->/g,q=/>/g,O=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),U=/'/g,I=/"/g,R=/^(?:script|style|textarea|title)$/i,j=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),B=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),K=new WeakMap,W=V.createTreeWalker(V,129);function G(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const Y=(t,e)=>{const i=t.length-1,a=[];let r,s=2===e?"<svg>":3===e?"<math>":"",o=D;for(let e=0;e<i;e++){const i=t[e];let n,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===D?"!--"===l[1]?o=F:void 0!==l[1]?o=q:void 0!==l[2]?(R.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=O):void 0!==l[3]&&(o=O):o===O?">"===l[0]?(o=r??D,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,n=l[1],o=void 0===l[3]?O:'"'===l[3]?I:U):o===I||o===U?o=O:o===F||o===q?o=D:(o=O,r=void 0);const h=o===O&&t[e+1].startsWith("/>")?" ":"";s+=o===D?i+M:d>=0?(a.push(n),i.slice(0,d)+H+i.slice(d)+E+h):i+E+(-2===d?e:h)}return[G(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),a]};class J{constructor({strings:t,_$litType$:e},i){let a;this.parts=[];let r=0,s=0;const o=t.length-1,n=this.parts,[l,d]=Y(t,e);if(this.el=J.createElement(l,i),W.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(a=W.nextNode())&&n.length<o;){if(1===a.nodeType){if(a.hasAttributes())for(const t of a.getAttributeNames())if(t.endsWith(H)){const e=d[s++],i=a.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);n.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?it:"?"===o[1]?at:"@"===o[1]?rt:et}),a.removeAttribute(t)}else t.startsWith(E)&&(n.push({type:6,index:r}),a.removeAttribute(t));if(R.test(a.tagName)){const t=a.textContent.split(E),e=t.length-1;if(e>0){a.textContent=C?C.emptyScript:"";for(let i=0;i<e;i++)a.append(t[i],T()),W.nextNode(),n.push({type:2,index:++r});a.append(t[e],T())}}}else if(8===a.nodeType)if(a.data===L)n.push({type:2,index:r});else{let t=-1;for(;-1!==(t=a.data.indexOf(E,t+1));)n.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const i=V.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,a){if(e===B)return e;let r=void 0!==a?i._$Co?.[a]:i._$Cl;const s=P(e)?void 0:e._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),void 0===s?r=void 0:(r=new s(t),r._$AT(t,i,a)),void 0!==a?(i._$Co??=[])[a]=r:i._$Cl=r),void 0!==r&&(e=Q(t,r._$AS(t,e.values),r,a)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,a=(t?.creationScope??V).importNode(e,!0);W.currentNode=a;let r=W.nextNode(),s=0,o=0,n=i[0];for(;void 0!==n;){if(s===n.index){let e;2===n.type?e=new tt(r,r.nextSibling,this,t):1===n.type?e=new n.ctor(r,n.name,n.strings,this,t):6===n.type&&(e=new st(r,this,t)),this._$AV.push(e),n=i[++o]}s!==n?.index&&(r=W.nextNode(),s++)}return W.currentNode=V,a}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,a){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),P(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==B&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(V.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,a="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===a)this._$AH.p(e);else{const t=new X(a,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=K.get(t.strings);return void 0===e&&K.set(t.strings,e=new J(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,a=0;for(const r of t)a===e.length?e.push(i=new tt(this.O(T()),this.O(T()),this,this.options)):i=e[a],i._$AI(r),a++;a<e.length&&(this._$AR(i&&i._$AB.nextSibling,a),e.length=a)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,a,r){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=a,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,a){const r=this.strings;let s=!1;if(void 0===r)t=Q(this,t,e,0),s=!P(t)||t!==this._$AH&&t!==B,s&&(this._$AH=t);else{const a=t;let o,n;for(t=r[0],o=0;o<r.length-1;o++)n=Q(this,a[i+o],e,o),n===B&&(n=this._$AH[o]),s||=!P(n)||n!==this._$AH[o],n===Z?t=Z:t!==Z&&(t+=(n??"")+r[o+1]),this._$AH[o]=n}s&&!a&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class at extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class rt extends et{constructor(t,e,i,a,r){super(t,e,i,a,r),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??Z)===B)return;const i=this._$AH,a=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==Z&&(i===Z||a);a&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const ot=k.litHtmlPolyfillSupport;ot?.(J,tt),(k.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class lt extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const a=i?.renderBefore??e;let r=a._$litPart$;if(void 0===r){const t=i?.renderBefore??null;a._$litPart$=r=new tt(e.insertBefore(T(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return B}}lt._$litElement$=!0,lt.finalized=!0,nt.litElementHydrateSupport?.({LitElement:lt});const dt=nt.litElementPolyfillSupport;dt?.({LitElement:lt}),(nt.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:$},pt=(t=ht,e,i)=>{const{kind:a,metadata:r}=i;let s=globalThis.litPropertyMetadata.get(r);if(void 0===s&&globalThis.litPropertyMetadata.set(r,s=new Map),"setter"===a&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===a){const{name:a}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(a,r,t,!0,i)},init(e){return void 0!==e&&this.C(a,void 0,t,e),e}}}if("setter"===a){const{name:a}=i;return function(i){const r=this[a];e.call(this,i),this.requestUpdate(a,r,t,!0,i)}}throw Error("Unsupported decorator location: "+a)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function mt(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const a=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),a?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return mt({...t,state:!0,attribute:!1})}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function gt(t,e){return(e,i,a)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}const _t=n`
  :host {
    --scada-shelved-color: var(--purple-color, #926bc7);
    --scada-hover-color: color-mix(in srgb, var(--primary-text-color, #212121) 5%, transparent);
    --scada-tonal-color: color-mix(in srgb, var(--primary-text-color, #212121) 8%, transparent);

    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, "Roboto", sans-serif));
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

  /* --- Tables --- */

  .table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
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

  tbody tr:hover {
    background-color: var(--scada-hover-color);
  }

  tbody tr.clickable {
    cursor: pointer;
  }

  tbody tr.clickable:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: -2px;
  }

  .filter-row th {
    padding-top: 4px;
    padding-bottom: 6px;
    border-bottom-width: 1px;
  }

  .filter-row input,
  .filter-row select {
    width: 100%;
    min-width: 70px;
    box-sizing: border-box;
    padding: 4px 6px;
    font: inherit;
    font-size: 0.85em;
    font-weight: 400;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 4px;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }

  .sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
    --mdc-icon-size: 16px;
  }

  .sort-btn:hover,
  .sort-btn.sorted {
    color: var(--primary-text-color, #212121);
  }

  .sort-btn:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    border-radius: 2px;
  }

  td.name-cell {
    min-width: 180px;
  }

  .muted {
    font-size: 0.8em;
    color: var(--secondary-text-color, #727272);
  }

  .mono {
    font-family: var(--ha-font-family-code, monospace);
    font-size: 0.85em;
  }

  /* --- Values --- */

  .value {
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .value-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    max-width: 320px;
    font-size: 0.9em;
    font-weight: 400;
    line-height: 1.35;
    color: var(--secondary-text-color, #727272);
  }

  /* --- Buttons (styled after ha-button) --- */

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 16px;
    border: none;
    border-radius: 18px;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    background: var(--scada-tonal-color);
    color: var(--primary-text-color, #212121);
    transition: filter 0.15s, opacity 0.15s;
    --mdc-icon-size: 18px;
  }

  .btn:hover {
    filter: brightness(0.95);
  }

  .btn:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: default;
    filter: none;
  }

  .btn-primary {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }

  .btn-danger {
    background: var(--error-color, #db4437);
    color: var(--text-primary-color, #fff);
  }

  .btn-plain {
    background: transparent;
    color: var(--primary-color, #03a9f4);
  }

  .btn-plain:hover {
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 10%, transparent);
    filter: none;
  }

  .btn-plain.danger {
    color: var(--error-color, #db4437);
  }

  .btn-plain.danger:hover {
    background: color-mix(in srgb, var(--error-color, #db4437) 10%, transparent);
  }

  .btn-shelve {
    background: color-mix(in srgb, var(--scada-shelved-color) 16%, transparent);
    color: color-mix(in srgb, var(--scada-shelved-color) 75%, var(--primary-text-color, #212121));
  }

  .btn-small {
    min-height: 30px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: 15px;
  }

  .icon-btn {
    width: 40px;
    height: 40px;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    cursor: pointer;
    color: var(--secondary-text-color, #727272);
    --mdc-icon-size: 22px;
  }

  .icon-btn:hover {
    background: var(--scada-hover-color);
    color: var(--primary-text-color, #212121);
  }

  .icon-btn:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* --- Chips / badges --- */

  /* Tonal status chip: set --c to a theme color. Text is the color mixed toward the
     primary text color so it keeps contrast in both light and dark themes. */
  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
    background: color-mix(in srgb, var(--c) 16%, transparent);
    color: color-mix(in srgb, var(--c) 70%, var(--primary-text-color, #212121));
  }

  .status-chip .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: none;
    background: var(--c);
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 6px 0 12px;
    border: 1px solid var(--primary-color, #03a9f4);
    border-radius: 8px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 12%, transparent);
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    --mdc-icon-size: 16px;
  }

  .filter-chip:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  /* --- Tabs --- */

  .tabs {
    display: flex;
    align-items: center;
    background: var(--card-background-color, #fff);
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    padding: 0 8px;
    overflow-x: auto;
    flex: none;
  }

  .tab {
    position: relative;
    height: 48px;
    padding: 0 18px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    color: var(--secondary-text-color, #727272);
    white-space: nowrap;
    --mdc-icon-size: 19px;
  }

  .tab:hover {
    color: var(--primary-text-color, #212121);
  }

  .tab:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: -2px;
  }

  .tab.active {
    color: var(--primary-color, #03a9f4);
  }

  .tab.active::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 0;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: var(--primary-color, #03a9f4);
  }

  /* --- Loading / empty --- */

  .loading {
    display: flex;
    justify-content: center;
    padding: 48px 16px;
  }

  .css-spinner {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 4px solid color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
    border-top-color: var(--primary-color, #03a9f4);
    animation: scada-spin 0.9s linear infinite;
  }

  @keyframes scada-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .empty-state {
    text-align: center;
    padding: 48px 16px;
    color: var(--secondary-text-color, #727272);
  }

  .empty-state ha-svg-icon {
    --mdc-icon-size: 48px;
    display: block;
    margin: 0 auto 12px;
    color: var(--success-color, #43a047);
  }

  /* --- Form sections (ha-form editors: alarm editor, channels form) --- */

  .form-section {
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: var(--ha-card-border-radius, 12px);
    margin-bottom: 16px;
  }

  .form-section-header {
    padding: 16px 16px 0;
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .form-section-header .sub {
    display: block;
    margin-top: 2px;
    font-size: 0.8em;
    font-weight: 400;
    color: var(--secondary-text-color);
  }

  .form-section-body {
    padding: 16px;
  }

  /* --- Forms (legacy native inputs: card editors) --- */

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
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
  }

  .hint {
    font-size: 0.8em;
    color: var(--secondary-text-color, #727272);
    margin-top: 4px;
    line-height: 1.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .css-spinner {
      animation-duration: 2s;
    }
  }
`,vt={0:"var(--info-color, #039be5)",1:"var(--warning-color, #ffa600)",2:"var(--deep-orange-color, #ff6f22)",3:"var(--error-color, #db4437)"},ft={normal:"var(--success-color, #43a047)",active_unacknowledged:"var(--error-color, #db4437)",active_acknowledged:"var(--warning-color, #ffa600)",returned_to_normal_unacknowledged:"var(--info-color, #039be5)",shelved:"var(--purple-color, #926bc7)",disabled:"var(--disabled-text-color, #9e9e9e)"},bt="var(--disabled-text-color, #9e9e9e)",yt=t=>vt[t]??bt;let $t=class extends lt{static{this.styles=[_t,n`
      :host { display: block; }
      .form-group { margin-bottom: 12px; }
      .form-group label {
        display: block; margin-bottom: 4px; font-size: 0.85em;
        font-weight: 500; color: var(--secondary-text-color);
      }
      .form-group input, .form-group select {
        width: 100%; padding: 8px; border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px; font: inherit; font-size: 0.9em;
        background: var(--card-background-color, white);
        color: var(--primary-text-color); box-sizing: border-box;
      }
      .row { display: flex; gap: 12px; margin-bottom: 12px; }
      .row > * { flex: 1; }
      .checkbox-row {
        display: flex; gap: 16px; margin-bottom: 12px;
      }
      .checkbox-row label {
        display: flex; align-items: center; gap: 4px; font-size: 0.9em; cursor: pointer;
      }
    `]}setConfig(t){this._config=t}_update(t,e){const i={...this._config,[t]:e};""!==e&&void 0!==e||delete i[t],this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))}render(){return this._config?j`
      <div class="form-group">
        <label>Title</label>
        <input type="text"
          .value=${this._config.title??"Alarm Center"}
          @input=${t=>this._update("title",t.target.value)} />
      </div>

      <div class="row">
        <div class="form-group">
          <label>Default tab</label>
          <select .value=${("settings"===this._config.default_tab?"statistics":this._config.default_tab)??"active"}
            @change=${t=>this._update("default_tab",t.target.value)}>
            <option value="active">Active</option>
            <option value="all">All Alarms</option>
            <option value="history">History</option>
            <option value="noise">Noise</option>
            <option value="channels">Channels</option>
            <option value="create-edit">Create / Edit</option>
            <option value="statistics">Statistics</option>
          </select>
        </div>
        <div class="form-group">
          <label>Max width</label>
          <input type="text"
            .value=${this._config.max_width??""}
            @input=${t=>this._update("max_width",t.target.value)}
            placeholder="e.g. 1200px (empty = full)" />
        </div>
      </div>

      <div class="checkbox-row">
        <label>
          <input type="checkbox"
            .checked=${this._config.show_header??!1}
            @change=${t=>this._update("show_header",t.target.checked)} />
          Show header
        </label>
      </div>
    `:j``}};t([mt({attribute:!1})],$t.prototype,"hass",void 0),t([ut()],$t.prototype,"_config",void 0),$t=t([ct("scada-alarm-overview-editor")],$t);var xt="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",wt="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M13,17H11V15H13V17M13,13H11V7H13V13Z",kt="M13 13H11V7H13M11 15H13V17H11M15.73 3H8.27L3 8.27V15.73L8.27 21H15.73L21 15.73V8.27L15.73 3Z",At="M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z",Ct="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z",St="M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M15,9H9V11H12.24L9,13.7V16H15V14H11.76L15,11.3V9Z",Ht="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z",Et="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",Lt="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3",Mt="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Vt="M2,21L23,12L2,3V10L17,12L2,14V21Z";const Tt=async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/trigger_action",alarm_id:e})},Pt=async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/list"})).alarms,zt=async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/acknowledge",alarm_id:e})},Nt=async(t,e,i)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/shelve",alarm_id:e,duration:i})},Dt=async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/unshelve",alarm_id:e})},Ft=async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/list"})).channels,qt=async(t,e={})=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/event/list",...e})).events,Ot=async(t,e)=>t.connection.subscribeMessage(e,{type:"scada_alarm_manager/subscribe"}),Ut={0:"Info",1:"Warning",2:"High",3:"Critical"},It={normal:"Normal",active_unacknowledged:"Active (Unacked)",active_acknowledged:"Active (Acked)",returned_to_normal_unacknowledged:"RTN (Unacked)",shelved:"Shelved",disabled:"Disabled"},Rt=["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"],jt=["active_unacknowledged","returned_to_normal_unacknowledged"],Bt=[3,2,1,0],Zt={0:Mt,1:xt,2:kt,3:wt};let Kt,Wt=class extends lt{constructor(){super(...arguments),this.alarms=[],this.filterPriority=""}static{this.styles=[_t,n`
      :host {
        display: block;
        padding: 16px 24px 8px;
      }
      .kpis {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .tile {
        flex: 1;
        color: inherit;
        min-width: 120px;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 16px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        background: var(--card-background-color, #fff);
        cursor: default;
        font: inherit;
        text-align: left;
        transition: box-shadow 0.15s, border-color 0.15s, background 0.15s;
      }
      .tile[data-clickable] {
        cursor: pointer;
      }
      .tile[data-clickable]:hover {
        box-shadow: 0 0 0 1px var(--c);
      }
      .tile:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }
      .tile.sel {
        border-color: var(--c);
        background: color-mix(in srgb, var(--c) 12%, var(--card-background-color, #fff));
      }
      .tile .ic {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        flex: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--c) 16%, transparent);
        --mdc-icon-size: 22px;
        color: var(--c);
      }
      .num {
        font-size: 26px;
        font-weight: 500;
        line-height: 1.05;
        font-variant-numeric: tabular-nums;
        color: var(--primary-text-color, #212121);
      }
      .num.zero {
        color: var(--secondary-text-color, #727272);
      }
      .lbl {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
      }
      .bar-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 12px;
      }
      .bar {
        flex: 1;
        height: 8px;
        border-radius: 9999px;
        overflow: hidden;
        display: flex;
        background: var(--secondary-background-color, #f0f0f0);
      }
      .hint {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
      }
    `]}_emit(t){this.dispatchEvent(new CustomEvent("priority-filter",{detail:{priority:t},bubbles:!0,composed:!0}))}_tile(t,e,i,a,r){const s=j`
      <div class="ic"><ha-svg-icon .path=${a}></ha-svg-icon></div>
      <div>
        <div class="num ${0===e?"zero":""}">${e}</div>
        <div class="lbl">${i}</div>
      </div>
    `;if(null===r)return j`<div class="tile" style=${`--c:${t}`}>${s}</div>`;const o=this.filterPriority===r;return j`
      <button
        class="tile ${o?"sel":""}"
        style=${`--c:${t}`}
        data-clickable
        aria-pressed=${o?"true":"false"}
        title=${o?`Clear the ${i} filter`:`Show only ${i} alarms`}
        @click=${()=>this._emit(o?"":r)}
      >
        ${s}
      </button>
    `}render(){const t=this.alarms.filter(t=>Rt.includes(t.runtime.state)),e=e=>t.filter(t=>t.priority===e).length,i=t.filter(t=>jt.includes(t.runtime.state)).length,a=this.alarms.filter(t=>"shelved"===t.runtime.state).length,r=t.length,s=Bt.map(t=>({p:t,n:e(t)})).filter(t=>t.n>0);return j`
      <div class="kpis">
        ${this._tile("var(--state-icon-color, #44739e)",r,"Active alarms",Ct,null)}
        ${Bt.map(t=>this._tile(yt(t),e(t),Ut[t],Zt[t],String(t)))}
        ${this._tile("var(--warning-color, #ffa600)",i,"Unacknowledged","M23 7V13H21V7M21 15H23V17H21M12 2A2 2 0 0 0 10 4A2 2 0 0 0 10 4.29C7.12 5.14 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.14 14 4.29A2 2 0 0 0 14 4A2 2 0 0 0 12 2M10 21A2 2 0 0 0 12 23A2 2 0 0 0 14 21Z",null)}
        ${this._tile("var(--purple-color, #926bc7)",a,"Shelved",St,null)}
      </div>
      ${r>0?j`
            <div class="bar-row">
              <div class="bar">
                ${s.map(t=>j`<span
                      style=${`flex:${t.n};background:${yt(t.p)}`}
                      title=${`${t.n} ${Ut[t.p]}`}
                    ></span>`)}
              </div>
              <span class="hint">${i} of ${r} need attention</span>
            </div>
          `:Z}
    `}};t([mt({attribute:!1})],Wt.prototype,"alarms",void 0),t([mt()],Wt.prototype,"filterPriority",void 0),Wt=t([ct("alarm-kpi-strip")],Wt);const Gt=t=>new Promise(e=>setTimeout(e,t)),Yt=()=>(Kt||(Kt=(async()=>{if(!customElements.get("ha-form")||!customElements.get("ha-entity-picker"))try{const t=await(window.loadCardHelpers?.());if(!t)return;const e=await t.createCardElement({type:"entities",entities:[]});await(e?.constructor?.getConfigElement?.())}catch(t){}})()),Kt),Jt=async(t,e=3e3)=>!!customElements.get(t)||(await Promise.race([customElements.whenDefined(t),Gt(e)]),!!customElements.get(t)),Qt=()=>{const t=customElements.get("ha-dialog");return!!t&&"headerTitle"in t.prototype};let Xt=class extends lt{constructor(){super(...arguments),this.open=!1,this.heading="",this.width="medium",this._useHa=Qt()}static{this.styles=[_t,n`
      :host {
        display: contents;
      }
      ha-dialog {
        --dialog-content-padding: 0 24px 16px;
      }
      .footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 8px;
        width: 100%;
        box-sizing: border-box;
      }
      dialog {
        width: min(var(--scada-dialog-width, 560px), calc(100vw - 32px));
        max-height: calc(100vh - 32px);
        padding: 0;
        border: none;
        border-radius: var(--ha-dialog-border-radius, 24px);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.45);
      }
      dialog.small {
        --scada-dialog-width: 400px;
      }
      dialog.large {
        --scada-dialog-width: 720px;
      }
      .native-head {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 12px 8px 24px;
      }
      .native-head h2 {
        flex: 1;
        margin: 0;
        font-size: 1.25em;
        font-weight: 400;
        line-height: 1.4;
      }
      .native-body {
        flex: 1;
        overflow-y: auto;
        padding: 0 24px 16px;
      }
      .native-foot {
        padding: 12px 24px 20px;
      }
      @media (max-width: 600px) {
        dialog {
          width: 100vw;
          max-width: 100vw;
          max-height: 100vh;
          height: 100%;
          border-radius: 0;
        }
      }
    `]}willUpdate(t){t.has("open")&&this.open&&(this._useHa=Qt(),this._useHa||Yt().then(()=>{this.open||(this._useHa=Qt())}))}updated(){const t=this._native;t&&(this.open&&!t.open?t.showModal():!this.open&&t.open&&t.close())}_fireClosed(){this.dispatchEvent(new CustomEvent("dialog-closed"))}_onHaClosed(t){t.target===t.currentTarget&&(t.stopPropagation(),this._fireClosed())}_onNativeClose(t){t.stopPropagation(),this._fireClosed()}_onNativeClick(t){if(t.target===this._native){const e=this._native.getBoundingClientRect();t.clientX>=e.left&&t.clientX<=e.right&&t.clientY>=e.top&&t.clientY<=e.bottom||this._native.close()}}render(){return this._useHa?j`
        <ha-dialog
          .open=${this.open}
          header-title=${this.heading}
          width=${this.width}
          @closed=${this._onHaClosed}
        >
          <slot></slot>
          <div slot="footer" class="footer"><slot name="footer"></slot></div>
        </ha-dialog>
      `:j`
      <dialog
        class=${this.width}
        aria-labelledby="title"
        @close=${this._onNativeClose}
        @click=${this._onNativeClick}
      >
        <div class="native-head">
          <h2 id="title">${this.heading}</h2>
          <button class="icon-btn" aria-label="Close" @click=${()=>this._native?.close()}>
            <ha-svg-icon .path=${Et}></ha-svg-icon>
          </button>
        </div>
        <div class="native-body"><slot></slot></div>
        <div class="native-foot footer"><slot name="footer"></slot></div>
      </dialog>
    `}};t([mt({type:Boolean})],Xt.prototype,"open",void 0),t([mt()],Xt.prototype,"heading",void 0),t([mt()],Xt.prototype,"width",void 0),t([ut()],Xt.prototype,"_useHa",void 0),t([gt("dialog")],Xt.prototype,"_native",void 0),Xt=t([ct("scada-dialog")],Xt);let te=class extends lt{constructor(){super(...arguments),this.open=!1,this.version=""}static{this.styles=[_t,n`
      h3 {
        margin: 20px 0 8px 0;
        font-size: 0.95em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      h3:first-child {
        margin-top: 0;
      }
      p {
        margin: 0 0 8px 0;
        font-size: 0.9em;
        line-height: 1.5;
      }
      ol,
      ul {
        margin: 0 0 8px 0;
        padding-left: 20px;
        font-size: 0.9em;
        line-height: 1.6;
      }
      .key {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      code {
        font-family: var(--ha-font-family-code, monospace);
        font-size: 0.9em;
      }
      .version-line {
        margin-top: 20px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }
    `]}_close(){this.open=!1,this.dispatchEvent(new CustomEvent("close"))}render(){return j`
      <scada-dialog .open=${this.open} heading="Quick start guide" width="large" @dialog-closed=${this._close}>
        <h3>Getting started</h3>
        <ol>
          <li><span class="key">Create a channel</span> in the Channels tab to define where notifications go (mobile push, persistent panel, etc.).</li>
          <li><span class="key">Create an alarm</span> in the Create / Edit tab. Pick a source entity, set a trigger condition, and assign a channel.</li>
          <li><span class="key">Monitor alarms</span> in the Active tab. Acknowledge or shelve alarms from there.</li>
        </ol>

        <h3>Key concepts</h3>
        <ul>
          <li><span class="key">Priority</span> controls notification behavior: Info (panel only), Warning (persistent), High (+ mobile push), Critical (bypasses DND).</li>
          <li><span class="key">Channels</span> route notifications to specific targets (e.g. your phone). Each channel can filter by priority and set per-target thresholds.</li>
          <li><span class="key">Trigger types:</span> Analog compares a numeric value against a threshold. Digital matches a specific state (on/off). Custom State matches against a list of values.</li>
          <li><span class="key">Latching</span> alarms stay active until manually reset, even after the condition clears.</li>
          <li><span class="key">Acknowledge required</span> means the alarm won't return to normal until a user acknowledges it.</li>
          <li><span class="key">Hysteresis (deadband)</span> prevents rapid on/off cycling. The alarm triggers at the threshold but won't clear until the value moves past threshold +/- the deadband value.</li>
          <li><span class="key">Conditions</span> add a secondary gate: the alarm only fires when both the trigger and the condition are true.</li>
          <li><span class="key">Shelving</span> temporarily suppresses an alarm for a set duration.</li>
        </ul>

        <h3>Notification templates</h3>
        <p>Override default notification text with Jinja2 templates. Available variables:</p>
        <p>
          ${["name","value","unit","area","equipment","friendly_name","threshold","operator","priority"].map((t,e)=>j`${e?", ":""}<code>{{ ${t} }}</code>`)}
        </p>

        ${this.version?j`<div class="version-line">SCADA Alarm Manager v${this.version}</div>`:""}
        <button slot="footer" class="btn btn-plain" @click=${this._close}>Close</button>
      </scada-dialog>
    `}};t([mt({type:Boolean})],te.prototype,"open",void 0),t([mt({type:String})],te.prototype,"version",void 0),te=t([ct("help-dialog")],te);const ee=t=>t?.locale?.language||t?.language||void 0,ie=t=>{const e=t?.locale?.time_format;return"12"===e||"24"!==e&&void 0},ae=t=>"server"===t?.locale?.time_zone?t?.config?.time_zone:void 0,re=t=>{if(!t)return null;const e=new Date(t);return isNaN(e.getTime())?null:e},se=(t,e)=>{const i=re(e);if(!i)return"—";try{return new Intl.DateTimeFormat(ee(t),{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",hour12:ie(t),timeZone:ae(t)}).format(i)}catch(t){return i.toLocaleString()}},oe=[["second",60],["minute",60],["hour",24],["day",7],["week",4.35],["month",12],["year",1/0]],ne=t=>{if(!t||t<=0)return"—";let e=Math.round(t);const i=Math.floor(e/86400);e-=86400*i;const a=Math.floor(e/3600);e-=3600*a;const r=Math.floor(e/60);e-=60*r;const s=[];return i&&s.push(`${i} d`),a&&s.push(`${a} h`),r&&s.push(`${r} min`),e&&s.push(`${e} s`),s.join(" ")},le=t=>{if(null==t||""===t)return null;let e;return e="number"==typeof t?t:"string"==typeof t?Number(t):86400*(t.days??0)+3600*(t.hours??0)+60*(t.minutes??0)+(t.seconds??0)+(t.milliseconds??0)/1e3,!isFinite(e)||e<=0?null:Math.round(e)},de=t=>{if(!t||t<=0)return;return{hours:Math.floor(t/3600),minutes:Math.floor(t%3600/60),seconds:Math.round(t%60)}},ce=(t,e)=>e?t?.areas?.[e]?.name??e:"",he=(t,e)=>e?t.find(t=>t.id===e)?.name??e:"",pe=(t,e)=>null==t||""===t?"—":e?"%"===e?`${t}%`:`${t} ${e}`:String(t),me=(t,e)=>{if("external"!==e.trigger_type){const i=t?.states?.[e.source_entity_id];if(i){if("function"==typeof t?.formatEntityState)try{const e=t.formatEntityState(i);return{text:e,long:e.length>32}}catch(t){}return{text:pe(i.state,i.attributes?.unit_of_measurement??""),long:!1}}}const i=e.runtime.last_value;return null==i||""===i?{text:"—",long:!1}:{text:String(i),long:"external"===e.trigger_type||String(i).length>32}},ue={">":"Above",">=":"At or above","<":"Below","<=":"At or below","==":"Equal to","!=":"Not equal to"},ge=(t,e)=>{t.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:e},bubbles:!0,composed:!0}))},_e=t=>String(t&&"object"==typeof t&&"message"in t?t.message:t),ve=()=>customElements.get("ha-spinner")?j`<div class="loading"><ha-spinner size="medium" aria-label="Loading"></ha-spinner></div>`:customElements.get("ha-circular-progress")?j`<div class="loading">
      <ha-circular-progress indeterminate aria-label="Loading"></ha-circular-progress>
    </div>`:j`<div class="loading"><span class="css-spinner" role="progressbar" aria-label="Loading"></span></div>`,fe=(t,e="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z")=>j`<div class="empty-state"><ha-svg-icon .path=${e}></ha-svg-icon><div>${t}</div></div>`,be=t=>j`<span class="status-chip" style=${`--c:${(t=>ft[t]??bt)(t)}`}>
    <span class="dot"></span>${It[t]??t}
  </span>`,ye=(t,e)=>{const i=me(t,e);return i.long?j`<span class="value-text" title=${i.text}>${i.text}</span>`:j`<span class="value">${i.text}</span>`},$e=t=>e=>{e.target===e.currentTarget&&("Enter"!==e.key&&" "!==e.key||(e.preventDefault(),t()))};class xe extends lt{constructor(){super(...arguments),this.datetime=null}static{this.styles=n`
    :host {
      white-space: nowrap;
    }
  `}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>this.requestUpdate(),3e4)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer)}render(){return this.datetime?j`<time datetime=${this.datetime} title=${se(this.hass,this.datetime)}
      >${((t,e)=>{const i=re(e);if(!i)return"—";let a=(i.getTime()-Date.now())/1e3,r="second";for(const[t,e]of oe){if(r=t,Math.abs(a)<e)break;a/=e}const s="second"===r&&Math.abs(a)<45?0:Math.round(a);try{return new Intl.RelativeTimeFormat(ee(t),{numeric:"auto"}).format(s,r)}catch(i){return se(t,e)}})(this.hass,this.datetime)}</time
    >`:j`—`}}t([mt({attribute:!1})],xe.prototype,"hass",void 0),t([mt()],xe.prototype,"datetime",void 0),customElements.get("rel-time")||customElements.define("rel-time",xe);const we={0:Mt,1:xt,2:kt,3:wt};let ke=class extends lt{constructor(){super(...arguments),this.priority=0}static{this.styles=n`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      --mdc-icon-size: 18px;
    }
  `}render(){const t=yt(this.priority),e=Ut[this.priority]??"Unknown",i=this.priority>=3?`background: ${t}; color: var(--text-primary-color, #fff)`:`background: color-mix(in srgb, ${t} 18%, transparent); color: ${t}`;return j`
      <span class="badge" style=${i} title=${e} role="img" aria-label=${e}>
        <ha-svg-icon .path=${we[this.priority]}></ha-svg-icon>
      </span>
    `}};t([mt({type:Number})],ke.prototype,"priority",void 0),ke=t([ct("severity-badge")],ke);const Ae={analog:"Analog threshold",digital:"Digital (state match)",custom_state:"Custom state (value list)",external:"External"};let Ce=class extends lt{constructor(){super(...arguments),this.channels=[],this.open=!1}static{this.styles=[_t,n`
      .title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .title-row .meta {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      .section {
        margin-bottom: 20px;
      }
      .section-title {
        font-size: 0.8em;
        font-weight: 500;
        text-transform: uppercase;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
        letter-spacing: 0.5px;
      }
      .field {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 16px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .field:last-child {
        border-bottom: none;
      }
      .field-label {
        flex: none;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .field-value {
        font-size: 0.9em;
        text-align: right;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .field-value .value-text {
        max-width: none;
        -webkit-line-clamp: 6;
      }
      .entity-link {
        padding: 0;
        border: none;
        background: none;
        font: inherit;
        font-size: 0.9em;
        color: var(--primary-color);
        cursor: pointer;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .entity-link:hover {
        text-decoration: underline;
      }
      .description {
        font-size: 0.9em;
        color: var(--primary-text-color);
        margin: 0 0 16px;
      }
      .flags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 6px 0;
      }
      .flag {
        padding: 2px 10px;
        border-radius: 8px;
        font-size: 0.8em;
        border: 1px solid var(--divider-color, #e0e0e0);
        color: var(--secondary-text-color);
      }
      .flag.on {
        border-color: transparent;
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
        color: var(--primary-text-color);
      }
    `]}willUpdate(t){t.has("alarm")&&this.alarm&&(this._shown=this.alarm)}_close(){this.open=!1,this.dispatchEvent(new CustomEvent("close"))}_emit(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}_act(t,e){this._emit(t,e),this._close()}_openEntityInfo(){this._emit("hass-more-info",{entityId:this._shown?.source_entity_id})}_field(t,e){return j`<div class="field"><span class="field-label">${t}</span><span class="field-value">${e}</span></div>`}_time(t){return t?j`<rel-time .hass=${this.hass} .datetime=${t}></rel-time>`:"—"}_renderBody(t){const e=t.runtime,i=this.hass;return j`
      <div class="title-row">
        <severity-badge .priority=${t.priority}></severity-badge>
        ${be(e.state)}
        <span class="meta">${Ut[t.priority]}</span>
      </div>
      ${t.description?j`<p class="description">${t.description}</p>`:Z}

      <div class="section">
        <div class="section-title">Status</div>
        ${this._field("Value",ye(i,t))}
        ${this._field("Triggered",this._time(e.triggered_at))}
        ${e.returned_at?this._field("Returned to normal",this._time(e.returned_at)):Z}
        ${e.acked_at?this._field("Acknowledged",j`${this._time(e.acked_at)}${e.acked_by?` by ${e.acked_by}`:""}`):Z}
        ${e.shelved_until?this._field("Shelved until",se(i,e.shelved_until)):Z}
        ${t.suppressed_by?this._field("Suppressed by",t.suppressed_by.name):Z}
      </div>

      <div class="section">
        <div class="section-title">Definition</div>
        <div class="field">
          <span class="field-label">Source entity</span>
          <button class="entity-link" @click=${this._openEntityInfo}>${t.source_entity_id}</button>
        </div>
        ${this._field("Trigger",j`${((t,e)=>{const i=e.trigger_config??{},a=t?.states?.[e.source_entity_id],r=e=>{if(a&&"function"==typeof t?.formatEntityState)try{return t.formatEntityState(a,e)}catch(t){}return e};switch(e.trigger_type){case"analog":{const a=((t,e)=>t?.states?.[e]?.attributes?.unit_of_measurement??"")(t,e.source_entity_id);let r=`${ue[i.operator]??i.operator??""} ${pe(i.threshold,a)}`;return null!=e.hysteresis&&(r+=`, hysteresis ${pe(e.hysteresis,a)}`),r}case"digital":return`State is "${r(String(i.target_state??"on"))}"`;case"custom_state":{const t=i.match_values??[];return t.length?`State is one of: ${t.map(r).join(", ")}`:"No match values"}case"external":return"Raised and cleared by an automation or blueprint";default:return e.trigger_type}})(i,t)}<br /><span class="muted">${Ae[t.trigger_type]??t.trigger_type}</span>`)}
        ${t.trigger_delay?this._field("On-delay",ne(t.trigger_delay)):Z}
        ${t.clear_delay?this._field("Clear delay",ne(t.clear_delay)):Z}
        ${this._field("Channel",t.channel_id?he(this.channels,t.channel_id):"No channel")}
        ${t.area?this._field("Area",ce(i,t.area)):Z}
        ${t.equipment?this._field("Equipment",t.equipment):Z}
        ${t.tag?this._field("Tag",t.tag):Z}
      </div>

      <div class="section">
        <div class="section-title">Behavior</div>
        <div class="flags">
          <span class="flag ${t.enabled?"on":""}">Enabled</span>
          <span class="flag ${t.latching?"on":""}">Latching</span>
          <span class="flag ${t.ack_required?"on":""}">Acknowledge required</span>
          <span class="flag ${t.auto_clear?"on":""}">Auto clear</span>
          ${"analog"===t.trigger_type?j`<span class="flag ${t.suppress_milder?"on":""}">Suppress milder</span>`:Z}
        </div>
        ${t.repeat_interval?this._field("Reminder",`Every ${ne(t.repeat_interval)}`):Z}
        ${t.auto_ack_delay?this._field("Auto-acknowledge",`${ne(t.auto_ack_delay)} after return to normal`):Z}
      </div>

      <div class="section">
        <div class="section-title">Metadata</div>
        ${this._field("Alarm ID",j`<span class="mono">${t.id}</span>`)}
        ${this._field("Created",se(i,t.created_at))}
        ${this._field("Updated",se(i,t.updated_at))}
      </div>
    `}_renderFooter(t){const e=t.runtime.state,i="active_unacknowledged"===e||"returned_to_normal_unacknowledged"===e,a="external"===t.trigger_type;return j`
      ${a?j`<button slot="footer" class="btn btn-plain" disabled title="External alarms are managed by automations/blueprints and can't be edited here">Edit</button>`:j`<button slot="footer" class="btn btn-plain" @click=${()=>this._act("edit-alarm",{id:t.id})}>Edit</button>`}
      ${t.channel_id?j`<button slot="footer" class="btn btn-plain" title="Send this alarm's real notification as a test" @click=${()=>this._act("test-alarm",{id:t.id})}>Test notification</button>`:Z}
      ${t.action_service?j`<button slot="footer" class="btn" title="Run this alarm's configured action" @click=${()=>this._act("trigger-action",{id:t.id})}>${t.action_label||"Action"}</button>`:Z}
      ${"shelved"===e?j`<button slot="footer" class="btn btn-shelve" @click=${()=>this._act("unshelve-alarm",{id:t.id})}>Unshelve</button>`:"disabled"!==e?j`<button slot="footer" class="btn btn-shelve" @click=${()=>this._act("shelve-alarm",{alarm:t})}>Shelve</button>`:Z}
      ${i?j`<button slot="footer" class="btn btn-primary" @click=${()=>this._act("ack-alarm",{id:t.id})}>Acknowledge</button>`:Z}
    `}render(){const t=this.alarm??this._shown;return j`
      <scada-dialog .open=${this.open&&!!this.alarm} heading=${t?.name??""} @dialog-closed=${this._close}>
        ${t?this._renderBody(t):Z} ${t?this._renderFooter(t):Z}
      </scada-dialog>
    `}};t([mt({attribute:!1})],Ce.prototype,"hass",void 0),t([mt({attribute:!1})],Ce.prototype,"alarm",void 0),t([mt({attribute:!1})],Ce.prototype,"channels",void 0),t([mt({type:Boolean})],Ce.prototype,"open",void 0),Ce=t([ct("alarm-detail-dialog")],Ce);const Se=[15,30,60,240,480,1440,2880,7200,20160,43200],He=[5,10,15,20,30,45,60,90,120,180,240,360,480,720,1440,2160,2880,4320,7200,10080,14400,20160,30240,43200];let Ee=class extends lt{constructor(){super(...arguments),this.open=!1,this.alarmId="",this.alarmName="",this._minutes=15}static{this.styles=[_t,n`
      p {
        margin: 0 0 16px;
        font-size: 14px;
        line-height: 1.55;
      }
      .presets {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }
      .chip {
        height: 32px;
        padding: 0 14px;
        border-radius: 8px;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: transparent;
        color: var(--primary-text-color, #212121);
      }
      .chip[aria-pressed="true"] {
        border-color: var(--scada-shelved-color);
        background: color-mix(in srgb, var(--scada-shelved-color) 16%, transparent);
        color: color-mix(in srgb, var(--scada-shelved-color) 75%, var(--primary-text-color, #212121));
      }
      .chip:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }
      .slider {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .slider input {
        flex: 1;
        accent-color: var(--scada-shelved-color);
      }
      .slider output {
        font-size: 14px;
        font-weight: 500;
        min-width: 80px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .btn-confirm {
        background: var(--scada-shelved-color);
        color: var(--text-primary-color, #fff);
      }
    `]}willUpdate(t){t.has("open")&&this.open&&(this._minutes=15)}_fmt(t){return ne(60*t)}get _stepIndex(){const t=He.indexOf(this._minutes);return t>=0?t:He.reduce((t,e,i)=>Math.abs(e-this._minutes)<Math.abs(He[t]-this._minutes)?i:t,0)}_close(){this.dispatchEvent(new CustomEvent("dialog-closed"))}_confirm(){this.dispatchEvent(new CustomEvent("shelve-confirm",{detail:{alarmId:this.alarmId,minutes:this._minutes}}))}render(){return j`
      <scada-dialog .open=${this.open} heading="Shelve alarm" width="small" @dialog-closed=${this._close}>
        <p>
          Temporarily suppress <strong>${this.alarmName}</strong>. It won't notify or appear as active until the timer
          expires, then it returns to normal evaluation.
        </p>
        <div class="presets" role="group" aria-label="Duration presets">
          ${Se.map(t=>j`
              <button class="chip" aria-pressed=${this._minutes===t?"true":"false"} @click=${()=>this._minutes=t}>
                ${this._fmt(t)}
              </button>
            `)}
        </div>
        <div class="slider">
          <input
            type="range"
            min="0"
            max=${He.length-1}
            step="1"
            aria-label="Shelve duration"
            aria-valuetext=${this._fmt(this._minutes)}
            .value=${String(this._stepIndex)}
            @input=${t=>this._minutes=He[Number(t.target.value)]}
          />
          <output>${this._fmt(this._minutes)}</output>
        </div>
        <button slot="footer" class="btn btn-plain" @click=${this._close}>Cancel</button>
        <button slot="footer" class="btn btn-confirm" @click=${this._confirm}>Shelve for ${this._fmt(this._minutes)}</button>
      </scada-dialog>
    `}};t([mt({type:Boolean})],Ee.prototype,"open",void 0),t([mt()],Ee.prototype,"alarmId",void 0),t([mt()],Ee.prototype,"alarmName",void 0),t([ut()],Ee.prototype,"_minutes",void 0),Ee=t([ct("shelve-dialog")],Ee);const Le=["active_unacknowledged","returned_to_normal_unacknowledged"];let Me=class extends lt{static{this.styles=[_t,n`
      :host {
        display: block;
      }
      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 16px 14px 18px;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 12px;
        cursor: pointer;
        overflow: hidden;
        transition: box-shadow 0.15s;
      }
      .card:hover {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
      }
      .card:focus-visible {
        outline: 2px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }
      .accent {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }
      .top {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .top .ago {
        margin-left: auto;
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
        white-space: nowrap;
      }
      .name {
        font-size: 15.5px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--primary-text-color, #212121);
      }
      .sub {
        font-size: 12.5px;
        color: var(--secondary-text-color, #727272);
        margin-top: 2px;
      }
      .mid {
        display: flex;
        align-items: flex-end;
        gap: 10px;
      }
      .big-value {
        font-size: 22px;
        font-weight: 500;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        color: var(--primary-text-color, #212121);
        overflow-wrap: anywhere;
      }
      .mid .value-text {
        max-width: none;
      }
      .entity {
        font-size: 11px;
        font-family: var(--ha-font-family-code, monospace);
        color: var(--secondary-text-color, #727272);
        margin-top: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .foot {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 10px;
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
      /* critical + unacked draws attention */
      :host([flashing]) .card {
        animation: flash 1.1s infinite alternate;
      }
      @keyframes flash {
        from {
          box-shadow: 0 0 0 2px var(--error-color, #db4437);
        }
        to {
          box-shadow: 0 0 0 1px transparent;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        :host([flashing]) .card {
          animation: none;
        }
      }
    `]}_emit(t,e){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}willUpdate(){const t=this.alarm,e=t&&t.priority>=3&&Le.includes(t.runtime.state);this.toggleAttribute("flashing",!!e)}render(){const t=this.alarm;if(!t)return j``;const e=yt(t.priority),i=Le.includes(t.runtime.state),a=me(this.hass,t),r=()=>this._emit("open-alarm",{alarm:t});return j`
      <div
        class="card"
        tabindex="0"
        aria-label=${`${t.name}, open details`}
        @click=${r}
        @keydown=${$e(r)}
      >
        <span class="accent" style=${`background:${e}`}></span>

        <div class="top">
          <severity-badge .priority=${t.priority}></severity-badge>
          <span class="ago"><rel-time .hass=${this.hass} .datetime=${t.runtime.triggered_at}></rel-time></span>
        </div>

        <div>
          <div class="name">${t.name}</div>
          <div class="sub">${[ce(this.hass,t.area),t.equipment].filter(Boolean).join(" · ")}</div>
        </div>

        <div class="mid">
          <div style="flex:1; min-width:0;">
            ${a.long?j`<div class="value-text" title=${a.text}>${a.text}</div>`:j`<div class="big-value">${a.text}</div>`}
            <div class="entity">${t.source_entity_id}</div>
          </div>
          ${be(t.runtime.state)}
        </div>

        <div class="foot">
          ${i?j`<button
                class="btn btn-primary"
                @click=${e=>{e.stopPropagation(),this._emit("ack-alarm",{id:t.id})}}
              >
                ACK
              </button>`:""}
          <button
            class="btn btn-shelve"
            @click=${e=>{e.stopPropagation(),this._emit("shelve-alarm",{alarm:t})}}
          >
            Shelve
          </button>
        </div>
      </div>
    `}};t([mt({attribute:!1})],Me.prototype,"hass",void 0),t([mt({attribute:!1})],Me.prototype,"alarm",void 0),Me=t([ct("alarm-tile-card")],Me);const Ve=["active_unacknowledged","returned_to_normal_unacknowledged"];let Te=class extends lt{constructor(){super(...arguments),this.priorityFilter="",this._alarms=[],this._loading=!0,this._layout="table",this._search="",this._filterState="",this._filterTag="",this._filterChannel="",this._channels=[]}static{this.styles=[_t,n`
      :host { display: block; padding: 16px; }
      .toolbar {
        display: flex; gap: 8px; margin-bottom: 14px; align-items: center; flex-wrap: wrap;
      }
      .search-box {
        display: flex; align-items: center; gap: 6px; flex: 1; min-width: 180px; max-width: 320px;
        height: 34px; padding: 0 10px; border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 9999px; background: var(--card-background-color, #fff);
        --mdc-icon-size: 18px; color: var(--secondary-text-color);
      }
      .search-box input {
        border: none; background: transparent; outline: none; font: inherit; font-size: 13px;
        color: var(--primary-text-color); flex: 1; min-width: 0;
      }
      .toolbar-filter {
        height: 34px; padding: 0 8px; border-radius: 8px; font: inherit; font-size: 13px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: var(--card-background-color, #fff); color: var(--primary-text-color);
      }
      .search-box .clear {
        display: flex; align-items: center; justify-content: center;
        width: 24px; height: 24px; padding: 0; border: none; border-radius: 50%;
        background: none; cursor: pointer; color: inherit; --mdc-icon-size: 16px;
      }
      .search-box .clear:hover { background: var(--scada-hover-color); }
      .search-box:focus-within { border-color: var(--primary-color, #03a9f4); }
      .layout-toggle {
        display: flex; gap: 2px; margin-left: auto; --mdc-icon-size: 18px;
      }
      .layout-toggle button {
        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--divider-color, #e0e0e0); background: transparent; cursor: pointer;
        color: var(--secondary-text-color); border-radius: 6px;
      }
      .layout-toggle button[aria-pressed="true"] {
        background: var(--primary-color); color: var(--text-primary-color, #fff); border-color: var(--primary-color);
      }
      .flashing { animation: flash 1s infinite alternate; }
      @keyframes flash { from { opacity: 1; } to { opacity: 0.5; } }
      @media (prefers-reduced-motion: reduce) { .flashing { animation: none; } }
      .alarm-row-critical td:first-child { box-shadow: inset 3px 0 0 ${o(yt(3))}; }
      .alarm-row-high td:first-child { box-shadow: inset 3px 0 0 ${o(yt(2))}; }
      .row-actions { white-space: nowrap; }
      .cards-grid {
        display: grid; gap: 14px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    `]}connectedCallback(){super.connectedCallback(),this._loadAlarms(),this._loadChannels(),this._subscribe()}async _loadChannels(){this.hass&&(this._channels=await Ft(this.hass))}get _tags(){return[...new Set(this._alarms.map(t=>t.tag).filter(Boolean))].sort()}disconnectedCallback(){super.disconnectedCallback(),this._unsub?.()}async _loadAlarms(){if(this.hass)try{const t=await Pt(this.hass);this._alarms=t.filter(t=>"active_unacknowledged"===t.runtime.state||"active_acknowledged"===t.runtime.state||"returned_to_normal_unacknowledged"===t.runtime.state)}finally{this._loading=!1}}async _subscribe(){this.hass&&(this._unsub=await Ot(this.hass,()=>this._loadAlarms()))}get _filtered(){return this._alarms.filter(t=>{if(this.priorityFilter&&String(t.priority)!==this.priorityFilter)return!1;if(this._filterState&&t.runtime.state!==this._filterState)return!1;if(this._filterTag&&t.tag!==this._filterTag)return!1;if(this._filterChannel&&t.channel_id!==this._filterChannel)return!1;if(this._search){const e=this._search.toLowerCase();if(!t.name.toLowerCase().includes(e)&&!ce(this.hass,t.area).toLowerCase().includes(e)&&!t.source_entity_id.toLowerCase().includes(e))return!1}return!0}).sort((t,e)=>e.priority-t.priority)}_showToast(t){ge(this,t)}async _run(t,e){try{await t(),e&&this._showToast(e)}catch(t){this._showToast(`Failed: ${_e(t)}`)}}_setPriorityFilter(t){this.dispatchEvent(new CustomEvent("priority-filter",{detail:{priority:t},bubbles:!0,composed:!0}))}async _ack(t){this.hass&&(await this._run(()=>zt(this.hass,t),"Alarm acknowledged"),this._loadAlarms())}async _ackAll(){this.hass&&(await this._run(async()=>{const t=await(async t=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/acknowledge_all"}))(this.hass);this._showToast(`Acknowledged ${t.acknowledged} alarms`)}),this._loadAlarms())}_shelve(t){this._shelveTarget=t}async _unshelve(t){this.hass&&(await this._run(()=>Dt(this.hass,t),"Alarm unshelved"),this._loadAlarms())}async _triggerAction(t){this.hass&&await this._run(()=>Tt(this.hass,t),"Action triggered")}async _testAlarm(t){this.hass&&await this._run(()=>this.hass.callService("scada_alarm_manager","test_alarm_notification",{alarm_id:t}),"Test notification sent")}_edit(t){this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"create-edit",alarmId:t},bubbles:!0,composed:!0}))}render(){if(this._loading)return ve();if(0===this._alarms.length)return fe("No active alarms");const t=this._filtered,e=this._alarms.filter(t=>Ve.includes(t.runtime.state)).length;return j`
      <div class="toolbar">
        <span class="status-chip" style=${`--c:${yt(3)}`}>${this._alarms.length} active</span>
        ${t.length!==this._alarms.length?j`<span style="font-size: 0.85em; color: var(--secondary-text-color);">(${t.length} shown)</span>`:""}

        <div class="search-box">
          <ha-svg-icon .path=${"M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"}></ha-svg-icon>
          <input type="text" placeholder="Search alarms..." aria-label="Search alarms"
            .value=${this._search}
            @input=${t=>this._search=t.target.value} />
          ${this._search?j`<button class="clear" aria-label="Clear search" title="Clear search" @click=${()=>this._search=""}>
                <ha-svg-icon .path=${Et}></ha-svg-icon>
              </button>`:Z}
        </div>

        ${this.priorityFilter?j`<button class="filter-chip" title="Clear priority filter" @click=${()=>this._setPriorityFilter("")}>
              Priority: ${Ut[Number(this.priorityFilter)]}
              <ha-svg-icon .path=${Et}></ha-svg-icon>
            </button>`:Z}

        <select class="toolbar-filter" title="Filter by tag"
          .value=${this._filterTag}
          @change=${t=>this._filterTag=t.target.value}>
          <option value="">All tags</option>
          ${this._tags.map(t=>j`<option value=${t}>${t}</option>`)}
        </select>

        <select class="toolbar-filter" title="Filter by channel"
          .value=${this._filterChannel}
          @change=${t=>this._filterChannel=t.target.value}>
          <option value="">All channels</option>
          ${this._channels.map(t=>j`<option value=${t.id}>${t.name}</option>`)}
        </select>

        <button class="btn btn-primary" ?disabled=${0===e} @click=${this._ackAll} title="Acknowledge all unacknowledged alarms">
          <ha-svg-icon .path=${"M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z"}></ha-svg-icon>
          ACK All${e>0?` (${e})`:""}
        </button>

        <div class="layout-toggle">
          <button aria-pressed=${"table"===this._layout?"true":"false"} @click=${()=>this._layout="table"} title="Table view" aria-label="Table view">
            <ha-svg-icon .path=${"M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"}></ha-svg-icon>
          </button>
          <button aria-pressed=${"cards"===this._layout?"true":"false"} @click=${()=>this._layout="cards"} title="Cards view" aria-label="Cards view">
            <ha-svg-icon .path=${"M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"}></ha-svg-icon>
          </button>
        </div>
      </div>

      ${"cards"===this._layout?j`
        <div class="cards-grid">
          ${t.map(t=>j`
            <alarm-tile-card
              .hass=${this.hass}
              .alarm=${t}
              @ack-alarm=${t=>this._ack(t.detail.id)}
              @shelve-alarm=${t=>this._shelve(t.detail.alarm)}
              @open-alarm=${t=>this._detailAlarm=t.detail.alarm}>
            </alarm-tile-card>`)}
        </div>
      `:j`
        <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>State</th>
              <th>Source</th>
              <th>Value</th>
              <th>Triggered</th>
              <th>Actions</th>
            </tr>
            <tr class="filter-row">
              <th>
                <select aria-label="Filter by priority" @change=${t=>this._setPriorityFilter(t.target.value)}>
                  <option value="" ?selected=${!this.priorityFilter}>All</option>
                  ${[3,2,1,0].map(t=>j`<option value=${t} ?selected=${this.priorityFilter===String(t)}>${Ut[t]}</option>`)}
                </select>
              </th>
              <th></th>
              <th>
                <select aria-label="Filter by state" @change=${t=>this._filterState=t.target.value}>
                  <option value="">All</option>
                  ${["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"].map(t=>j`<option value=${t}>${It[t]}</option>`)}
                </select>
              </th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(t=>{const e=t.priority>=3?"alarm-row-critical":t.priority>=2?"alarm-row-high":"",i=Ve.includes(t.runtime.state),a=()=>this._detailAlarm=t,r=t=>t.stopPropagation();return j`
                <tr class="clickable ${e} ${t.priority>=3&&i?"flashing":""}" tabindex="0"
                  aria-label=${`${t.name}, ${It[t.runtime.state]??t.runtime.state}`}
                  @click=${a} @keydown=${$e(a)}>
                  <td><severity-badge .priority=${t.priority}></severity-badge></td>
                  <td class="name-cell"><strong>${t.name}</strong>${t.area?j`<br><span class="muted">${ce(this.hass,t.area)}</span>`:""}</td>
                  <td>${be(t.runtime.state)}</td>
                  <td class="mono">${t.source_entity_id}</td>
                  <td>${ye(this.hass,t)}</td>
                  <td class="muted"><rel-time .hass=${this.hass} .datetime=${t.runtime.triggered_at}></rel-time></td>
                  <td class="row-actions" @keydown=${r}>
                    ${i?j`<button class="btn btn-primary btn-small" title="Acknowledge this alarm" @click=${e=>{r(e),this._ack(t.id)}}>ACK</button>`:""}
                    <button class="btn btn-shelve btn-small" title="Temporarily suppress this alarm" @click=${e=>{r(e),this._shelve(t)}}>Shelve</button>
                  </td>
                </tr>
              `})}
          </tbody>
        </table>
        </div>
      `}

      <alarm-detail-dialog
        .hass=${this.hass}
        .channels=${this._channels}
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${()=>this._detailAlarm=void 0}
        @edit-alarm=${t=>this._edit(t.detail.id)}
        @ack-alarm=${t=>this._ack(t.detail.id)}
        @shelve-alarm=${t=>this._shelve(t.detail.alarm)}
        @unshelve-alarm=${t=>this._unshelve(t.detail.id)}
        @trigger-action=${t=>this._triggerAction(t.detail.id)}
        @test-alarm=${t=>this._testAlarm(t.detail.id)}
      ></alarm-detail-dialog>

      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id??""}
        .alarmName=${this._shelveTarget?.name??""}
        @dialog-closed=${()=>this._shelveTarget=void 0}
        @shelve-confirm=${async t=>{this._shelveTarget=void 0,await this._run(()=>Nt(this.hass,t.detail.alarmId,t.detail.minutes),"Alarm shelved"),this._loadAlarms()}}
      ></shelve-dialog>

    `}};t([mt({attribute:!1})],Te.prototype,"hass",void 0),t([mt()],Te.prototype,"priorityFilter",void 0),t([ut()],Te.prototype,"_alarms",void 0),t([ut()],Te.prototype,"_loading",void 0),t([ut()],Te.prototype,"_detailAlarm",void 0),t([ut()],Te.prototype,"_shelveTarget",void 0),t([ut()],Te.prototype,"_layout",void 0),t([ut()],Te.prototype,"_search",void 0),t([ut()],Te.prototype,"_filterState",void 0),t([ut()],Te.prototype,"_filterTag",void 0),t([ut()],Te.prototype,"_filterChannel",void 0),t([ut()],Te.prototype,"_channels",void 0),Te=t([ct("active-alarms-view")],Te);let Pe=class extends lt{constructor(){super(...arguments),this.items=[],this.label="More actions",this._open=!1}static{this.styles=[_t,n`
      :host {
        display: inline-block;
      }
      .menu {
        position: fixed;
        inset: unset;
        margin: 0;
        min-width: 200px;
        padding: 8px 0;
        border: none;
        border-radius: var(--ha-border-radius-lg, 12px);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24);
      }
      .item {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
        min-height: 48px;
        padding: 0 16px;
        border: none;
        background: none;
        font: inherit;
        font-size: 14px;
        text-align: left;
        color: inherit;
        cursor: pointer;
        --mdc-icon-size: 22px;
      }
      .item ha-svg-icon {
        color: var(--secondary-text-color, #727272);
      }
      .item:hover,
      .item:focus-visible {
        background: var(--scada-hover-color);
        outline: none;
      }
      .item:disabled {
        opacity: 0.45;
        cursor: default;
        background: none;
      }
      .item.danger,
      .item.danger ha-svg-icon {
        color: var(--error-color, #db4437);
      }
    `]}_toggle(t){t.stopPropagation(),this._open?this._menu.hidePopover():this._show()}_show(){const t=this._menu;t.showPopover();const e=this._trigger.getBoundingClientRect(),i=t.offsetWidth,a=t.offsetHeight;let r=e.right-i,s=e.bottom+4;r<8&&(r=8),s+a>window.innerHeight-8&&(s=Math.max(8,e.top-a-4)),t.style.left=`${r}px`,t.style.top=`${s}px`,this._items()[0]?.focus()}_items(){return[...this.renderRoot.querySelectorAll(".item:not(:disabled)")]}_onToggle(t){this._open="open"===t.newState,!this._open&&this.shadowRoot?.activeElement?.classList.contains("item")&&this._trigger.focus()}_onKey(t){t.stopPropagation();const e=this._items(),i=e.indexOf(this.shadowRoot?.activeElement);"ArrowDown"===t.key?(t.preventDefault(),e[(i+1)%e.length]?.focus()):"ArrowUp"===t.key?(t.preventDefault(),e[(i-1+e.length)%e.length]?.focus()):"Home"===t.key?(t.preventDefault(),e[0]?.focus()):"End"===t.key?(t.preventDefault(),e[e.length-1]?.focus()):"Tab"===t.key&&this._menu.hidePopover()}_select(t){this._menu.hidePopover(),this.dispatchEvent(new CustomEvent("menu-select",{detail:{action:t.action}}))}render(){return j`
      <button
        class="icon-btn trigger"
        aria-label=${this.label}
        title=${this.label}
        aria-haspopup="menu"
        aria-expanded=${this._open?"true":"false"}
        @click=${this._toggle}
        @keydown=${t=>t.stopPropagation()}
      >
        <ha-svg-icon .path=${"M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"}></ha-svg-icon>
      </button>
      <div
        class="menu"
        role="menu"
        popover="auto"
        @toggle=${this._onToggle}
        @keydown=${this._onKey}
        @click=${t=>t.stopPropagation()}
      >
        ${this.items.map(t=>j`
            <button
              class="item ${t.danger?"danger":""}"
              role="menuitem"
              ?disabled=${t.disabled}
              title=${t.title??Z}
              @click=${()=>this._select(t)}
            >
              <ha-svg-icon .path=${t.icon}></ha-svg-icon>
              <span>${t.label}</span>
            </button>
          `)}
      </div>
    `}};t([mt({attribute:!1})],Pe.prototype,"items",void 0),t([mt()],Pe.prototype,"label",void 0),t([ut()],Pe.prototype,"_open",void 0),t([gt(".trigger")],Pe.prototype,"_trigger",void 0),t([gt(".menu")],Pe.prototype,"_menu",void 0),Pe=t([ct("row-menu")],Pe);const ze=["active_unacknowledged","returned_to_normal_unacknowledged"],Ne={active_unacknowledged:5,returned_to_normal_unacknowledged:4,active_acknowledged:3,shelved:2,normal:1,disabled:0},De="No area";let Fe=class extends lt{constructor(){super(...arguments),this.priorityFilter="",this._alarms=[],this._channels=[],this._loading=!0,this._filterName="",this._filterState="",this._filterEntity="",this._filterTrigger="",this._filterChannel="",this._filterTag="",this._filterEnabled="",this._sortKey="priority",this._sortDesc=!0,this._groupByArea=!1,this._collapsed=new Set}static{this.styles=[_t,n`
      :host { display: block; padding: 16px; }
      .toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px; }
      .toolbar .count { margin-right: auto; }
      .toggle[aria-pressed="true"] {
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 14%, transparent);
        color: var(--primary-color, #03a9f4);
      }
      .name-sub { font-size: 0.75em; color: var(--secondary-text-color); }
      td.menu-cell { width: 40px; padding: 0 4px; text-align: right; }
      .group-row td {
        padding: 0;
        background: var(--secondary-background-color, #f5f5f5);
      }
      .group-row:hover { background: none; }
      .group-btn {
        display: flex; align-items: center; gap: 8px; width: 100%;
        padding: 8px 12px; border: none; background: none; cursor: pointer;
        font: inherit; font-weight: 500; text-align: left; color: var(--primary-text-color);
        --mdc-icon-size: 20px;
      }
      .group-btn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: -2px; }
      .group-btn .n { font-weight: 400; color: var(--secondary-text-color); }
      .confirm-text { margin: 0; line-height: 1.5; }
    `]}connectedCallback(){super.connectedCallback(),this._load()}async _load(){if(this.hass)try{const[t,e]=await Promise.all([Pt(this.hass),Ft(this.hass)]);this._alarms=t,this._channels=e}finally{this._loading=!1}}get _filtered(){return this._alarms.filter(t=>(!this.priorityFilter||String(t.priority)===this.priorityFilter)&&(!(this._filterName&&!t.name.toLowerCase().includes(this._filterName.toLowerCase()))&&((!this._filterState||t.runtime.state===this._filterState)&&(!(this._filterEntity&&!t.source_entity_id.toLowerCase().includes(this._filterEntity.toLowerCase()))&&((!this._filterTrigger||t.trigger_type===this._filterTrigger)&&((!this._filterChannel||t.channel_id===this._filterChannel)&&(!(this._filterTag&&!(t.tag??"").toLowerCase().includes(this._filterTag.toLowerCase()))&&(!("yes"===this._filterEnabled&&!t.enabled)&&("no"!==this._filterEnabled||!t.enabled)))))))))}_sortValue(t){switch(this._sortKey){case"priority":return t.priority;case"name":return t.name.toLowerCase();case"state":return Ne[t.runtime.state]??-1;case"entity":return t.source_entity_id;case"trigger":return t.trigger_type;case"channel":return he(this._channels,t.channel_id).toLowerCase();case"tag":return(t.tag??"").toLowerCase();case"enabled":return t.enabled?1:0}}_sorted(t){const e=this._sortDesc?-1:1;return[...t].sort((t,i)=>{const a=this._sortValue(t),r=this._sortValue(i);return("number"==typeof a&&"number"==typeof r?a-r:String(a).localeCompare(String(r)))*e||t.name.localeCompare(i.name)})}_setSort(t){this._sortKey===t?this._sortDesc=!this._sortDesc:(this._sortKey=t,this._sortDesc="priority"===t||"state"===t||"enabled"===t)}_setPriorityFilter(t){this.dispatchEvent(new CustomEvent("priority-filter",{detail:{priority:t},bubbles:!0,composed:!0}))}_toggleGroup(t){const e=new Set(this._collapsed);e.has(t)?e.delete(t):e.add(t),this._collapsed=e}async _run(t,e){try{await t(),e&&ge(this,e)}catch(t){ge(this,`Failed: ${_e(t)}`)}}async _doDelete(){if(!this.hass||!this._deleteTarget)return;const{id:t,name:e}=this._deleteTarget;this._deleteTarget=void 0,await this._run(()=>(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/delete",alarm_id:e})})(this.hass,t),`Deleted: ${e}`),this._load()}_edit(t){this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"create-edit",alarmId:t},bubbles:!0,composed:!0}))}async _testNotification(t){this.hass&&await this._run(()=>this.hass.callService("scada_alarm_manager","test_alarm_notification",{alarm_id:t.id}),`Test notification sent: ${t.name}`)}async _triggerAction(t){this.hass&&await this._run(()=>Tt(this.hass,t),"Action triggered")}async _ack(t){this.hass&&(await this._run(()=>zt(this.hass,t),"Alarm acknowledged"),this._load())}async _unshelve(t){this.hass&&(await this._run(()=>Dt(this.hass,t),"Alarm unshelved"),this._load())}_menuItems(t){const e=t.runtime.state,i=[];ze.includes(e)&&i.push({action:"ack",label:"Acknowledge",icon:"M17.75 21.16L15 18.16L16.16 17L17.75 18.59L21.34 15L22.5 16.41L17.75 21.16M3 20V19L5 17V11C5 7.9 7.03 5.18 10 4.29V4C10 2.9 10.9 2 12 2C13.11 2 14 2.9 14 4V4.29C16.97 5.18 19 7.9 19 11V12.08L18 12C14.69 12 12 14.69 12 18C12 18.7 12.12 19.37 12.34 20H3M12 23C10.9 23 10 22.11 10 21H12.8C13.04 21.41 13.33 21.79 13.65 22.13C13.29 22.66 12.69 23 12 23Z"}),"shelved"===e?i.push({action:"unshelve",label:"Unshelve",icon:Ct}):"disabled"!==e&&i.push({action:"shelve",label:"Shelve",icon:St}),t.action_service&&i.push({action:"action",label:t.action_label||"Run action",icon:"M10,9A1,1 0 0,1 11,8A1,1 0 0,1 12,9V13.47L13.21,13.6L18.15,15.79C18.68,16.03 19,16.56 19,17.14V21.5C18.97,22.32 18.32,22.97 17.5,23H11C10.62,23 10.26,22.85 10,22.57L5.1,18.37L5.84,17.6C6.03,17.39 6.3,17.28 6.58,17.28H6.8L10,19V9M11,5A4,4 0 0,1 15,9C15,10.5 14.2,11.77 13,12.46V11.24C13.61,10.69 14,9.89 14,9A3,3 0 0,0 11,6A3,3 0 0,0 8,9C8,9.89 8.39,10.69 9,11.24V12.46C7.8,11.77 7,10.5 7,9A4,4 0 0,1 11,5Z"}),t.channel_id&&i.push({action:"test",label:"Send test notification",icon:Vt});const a="external"===t.trigger_type;return i.push({action:"edit",label:"Edit",icon:"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",disabled:a,title:a?"External alarms are managed by automations/blueprints and can't be edited here":void 0}),i.push({action:"delete",label:"Delete",icon:"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",danger:!0}),i}_onMenu(t,e){switch(e){case"ack":this._ack(t.id);break;case"shelve":this._shelveTarget=t;break;case"unshelve":this._unshelve(t.id);break;case"action":this._triggerAction(t.id);break;case"test":this._testNotification(t);break;case"edit":this._edit(t.id);break;case"delete":this._deleteTarget=t}}_th(t,e){const i=this._sortKey===t;return j`
      <th aria-sort=${i?this._sortDesc?"descending":"ascending":"none"}>
        <button class="sort-btn ${i?"sorted":""}" @click=${()=>this._setSort(t)}>
          ${e}
          ${i?j`<ha-svg-icon .path=${this._sortDesc?"M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z":"M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"}></ha-svg-icon>`:Z}
        </button>
      </th>
    `}_renderRow(t){const e=()=>this._detailAlarm=t;return j`
      <tr class="clickable" tabindex="0" aria-label=${`${t.name}, open details`} @click=${e} @keydown=${$e(e)}>
        <td><severity-badge .priority=${t.priority}></severity-badge></td>
        <td class="name-cell">
          <strong>${t.name}</strong>
          ${"shelved"===t.runtime.state&&t.runtime.shelved_until?j`<br /><span class="name-sub">Until ${se(this.hass,t.runtime.shelved_until)}</span>`:Z}
          ${t.suppressed_by?j`<br /><span class="name-sub" title="Escalated: a more severe alarm on the same sensor is active">↳ Suppressed by ${t.suppressed_by.name}</span>`:Z}
        </td>
        <td>${be(t.runtime.state)}</td>
        <td class="mono">${t.source_entity_id}</td>
        <td>${t.trigger_type}</td>
        <td>${he(this._channels,t.channel_id)||"—"}</td>
        <td>${t.tag||"—"}</td>
        <td>${t.enabled?"Yes":"No"}</td>
        <td class="menu-cell">
          <row-menu
            .items=${this._menuItems(t)}
            .label=${`Actions for ${t.name}`}
            @menu-select=${e=>this._onMenu(t,e.detail.action)}
          ></row-menu>
        </td>
      </tr>
    `}_renderBody(t){if(!this._groupByArea)return this._sorted(t).map(t=>this._renderRow(t));const e=new Map;for(const i of t){const t=ce(this.hass,i.area)||De;e.has(t)||e.set(t,[]),e.get(t).push(i)}const i=[...e.keys()].sort((t,e)=>t===De?1:e===De?-1:t.localeCompare(e));return i.map(t=>{const i=e.get(t),a=this._collapsed.has(t);return j`
        <tr class="group-row">
          <td colspan=${9}>
            <button class="group-btn" aria-expanded=${a?"false":"true"} @click=${()=>this._toggleGroup(t)}>
              <ha-svg-icon .path=${a?"M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z":"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"}></ha-svg-icon>
              ${t} <span class="n">(${i.length})</span>
            </button>
          </td>
        </tr>
        ${a?Z:this._sorted(i).map(t=>this._renderRow(t))}
      `})}render(){if(this._loading)return ve();const t=this._filtered;return j`
      <div class="toolbar">
        <span class="count">${t.length} of ${this._alarms.length} alarm${1!==this._alarms.length?"s":""}</span>
        ${this.priorityFilter?j`<button class="filter-chip" title="Clear priority filter" @click=${()=>this._setPriorityFilter("")}>
              Priority: ${Ut[Number(this.priorityFilter)]}
              <ha-svg-icon .path=${Et}></ha-svg-icon>
            </button>`:Z}
        <button
          class="btn toggle"
          aria-pressed=${this._groupByArea?"true":"false"}
          @click=${()=>this._groupByArea=!this._groupByArea}
        >
          <ha-svg-icon .path=${"M1,1V5H2V19H1V23H5V22H19V23H23V19H22V5H23V1H19V2H5V1M5,4H19V5H20V19H19V20H5V19H4V5H5M6,6V14H9V18H18V9H14V6M8,8H12V12H8M14,11H16V16H11V14H14"}></ha-svg-icon>Group by area
        </button>
        <button class="btn btn-primary" @click=${()=>this._edit("")}>+ New alarm</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              ${this._th("priority","Priority")}
              ${this._th("name","Name")}
              ${this._th("state","State")}
              ${this._th("entity","Source entity")}
              ${this._th("trigger","Trigger")}
              ${this._th("channel","Channel")}
              ${this._th("tag","Tag")}
              ${this._th("enabled","Enabled")}
              <th aria-label="Actions"></th>
            </tr>
            <tr class="filter-row">
              <th>
                <select aria-label="Filter by priority" @change=${t=>this._setPriorityFilter(t.target.value)}>
                  <option value="" ?selected=${!this.priorityFilter}>All</option>
                  ${[3,2,1,0].map(t=>j`<option value=${t} ?selected=${this.priorityFilter===String(t)}>${Ut[t]}</option>`)}
                </select>
              </th>
              <th><input type="text" placeholder="Filter..." aria-label="Filter by name" .value=${this._filterName} @input=${t=>this._filterName=t.target.value} /></th>
              <th>
                <select aria-label="Filter by state" @change=${t=>this._filterState=t.target.value}>
                  <option value="">All</option>
                  ${Object.entries(It).map(([t,e])=>j`<option value=${t}>${e}</option>`)}
                </select>
              </th>
              <th><input type="text" placeholder="Filter..." aria-label="Filter by source entity" .value=${this._filterEntity} @input=${t=>this._filterEntity=t.target.value} /></th>
              <th>
                <select aria-label="Filter by trigger type" @change=${t=>this._filterTrigger=t.target.value}>
                  <option value="">All</option>
                  <option value="analog">Analog</option>
                  <option value="digital">Digital</option>
                  <option value="custom_state">Custom</option>
                  <option value="external">External</option>
                </select>
              </th>
              <th>
                <select aria-label="Filter by channel" @change=${t=>this._filterChannel=t.target.value}>
                  <option value="">All</option>
                  ${this._channels.map(t=>j`<option value=${t.id}>${t.name}</option>`)}
                </select>
              </th>
              <th><input type="text" placeholder="Filter..." aria-label="Filter by tag" .value=${this._filterTag} @input=${t=>this._filterTag=t.target.value} /></th>
              <th>
                <select aria-label="Filter by enabled" @change=${t=>this._filterEnabled=t.target.value}>
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${this._renderBody(t)}
          </tbody>
        </table>
      </div>

      <alarm-detail-dialog
        .hass=${this.hass}
        .channels=${this._channels}
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${()=>this._detailAlarm=void 0}
        @edit-alarm=${t=>this._edit(t.detail.id)}
        @ack-alarm=${t=>this._ack(t.detail.id)}
        @shelve-alarm=${t=>this._shelveTarget=t.detail.alarm}
        @unshelve-alarm=${t=>this._unshelve(t.detail.id)}
        @trigger-action=${t=>this._triggerAction(t.detail.id)}
        @test-alarm=${t=>{const e=this._alarms.find(e=>e.id===t.detail.id);e&&this._testNotification(e)}}
      ></alarm-detail-dialog>

      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id??""}
        .alarmName=${this._shelveTarget?.name??""}
        @dialog-closed=${()=>this._shelveTarget=void 0}
        @shelve-confirm=${async t=>{this._shelveTarget=void 0,await this._run(()=>Nt(this.hass,t.detail.alarmId,t.detail.minutes),"Alarm shelved"),this._load()}}
      ></shelve-dialog>

      <scada-dialog
        .open=${!!this._deleteTarget}
        heading="Delete alarm?"
        width="small"
        @dialog-closed=${()=>this._deleteTarget=void 0}
      >
        <p class="confirm-text">Permanently delete <strong>${this._deleteTarget?.name??""}</strong>? This can't be undone.</p>
        <button slot="footer" class="btn btn-plain" @click=${()=>this._deleteTarget=void 0}>Cancel</button>
        <button slot="footer" class="btn btn-danger" @click=${this._doDelete}>Delete</button>
      </scada-dialog>
    `}};t([mt({attribute:!1})],Fe.prototype,"hass",void 0),t([mt()],Fe.prototype,"priorityFilter",void 0),t([ut()],Fe.prototype,"_alarms",void 0),t([ut()],Fe.prototype,"_channels",void 0),t([ut()],Fe.prototype,"_loading",void 0),t([ut()],Fe.prototype,"_detailAlarm",void 0),t([ut()],Fe.prototype,"_shelveTarget",void 0),t([ut()],Fe.prototype,"_deleteTarget",void 0),t([ut()],Fe.prototype,"_filterName",void 0),t([ut()],Fe.prototype,"_filterState",void 0),t([ut()],Fe.prototype,"_filterEntity",void 0),t([ut()],Fe.prototype,"_filterTrigger",void 0),t([ut()],Fe.prototype,"_filterChannel",void 0),t([ut()],Fe.prototype,"_filterTag",void 0),t([ut()],Fe.prototype,"_filterEnabled",void 0),t([ut()],Fe.prototype,"_sortKey",void 0),t([ut()],Fe.prototype,"_sortDesc",void 0),t([ut()],Fe.prototype,"_groupByArea",void 0),t([ut()],Fe.prototype,"_collapsed",void 0),Fe=t([ct("all-alarms-view")],Fe);let qe=class extends lt{constructor(){super(...arguments),this._events=[],this._loading=!0,this._offset=0,this._limit=50,this._filterAlarm="",this._filterEvent="",this._filterUser=""}static{this.styles=[_t,n`
      :host { display: block; padding: 16px; }
      .pagination { display: flex; gap: 8px; justify-content: center; margin-top: 16px; }
      .event-type {
        display: inline-block; padding: 2px 6px; border-radius: 4px;
        font-size: 0.8em; font-weight: 500; text-transform: capitalize;
        background: var(--scada-tonal-color);
      }
      .pagination span { align-self: center; font-size: 0.9em; }
    `]}connectedCallback(){super.connectedCallback(),this._loadEvents()}async _loadEvents(){if(this.hass)try{this._events=await qt(this.hass,{limit:this._limit,offset:this._offset})}finally{this._loading=!1}}get _filtered(){return this._events.filter(t=>!(this._filterAlarm&&!t.alarm_name.toLowerCase().includes(this._filterAlarm.toLowerCase()))&&((!this._filterEvent||t.event_type===this._filterEvent)&&!(this._filterUser&&!(t.user??"").toLowerCase().includes(this._filterUser.toLowerCase()))))}_nextPage(){this._offset+=this._limit,this._loading=!0,this._loadEvents()}_prevPage(){this._offset=Math.max(0,this._offset-this._limit),this._loading=!0,this._loadEvents()}render(){if(this._loading)return ve();if(0===this._events.length&&0===this._offset)return fe("No alarm events recorded yet.",Lt);const t=[...new Set(this._events.map(t=>t.event_type))].sort(),e=this._filtered;return j`
      <div class="table-wrap">
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
            <th><input type="text" placeholder="Filter..." aria-label="Filter by alarm" .value=${this._filterAlarm} @input=${t=>this._filterAlarm=t.target.value} /></th>
            <th>
              <select aria-label="Filter by event type" @change=${t=>this._filterEvent=t.target.value}>
                <option value="">All</option>
                ${t.map(t=>j`<option value=${t}>${t}</option>`)}
              </select>
            </th>
            <th></th>
            <th></th>
            <th><input type="text" placeholder="Filter..." aria-label="Filter by user" .value=${this._filterUser} @input=${t=>this._filterUser=t.target.value} /></th>
          </tr>
        </thead>
        <tbody>
          ${e.map(t=>j`
              <tr>
                <td class="muted"><rel-time .hass=${this.hass} .datetime=${t.timestamp}></rel-time></td>
                <td><strong>${t.alarm_name}</strong></td>
                <td><span class="event-type">${t.event_type}</span>${"suppressed"===t.event_type&&t.details?.suppressed_by_name?j`<br><span class="muted">by ${t.details.suppressed_by_name}</span>`:""}</td>
                <td>${t.old_state?be(t.old_state):"—"}</td>
                <td>${t.new_state?be(t.new_state):"—"}</td>
                <td>${t.user??"—"}</td>
              </tr>
            `)}
        </tbody>
      </table>
      </div>
      <div class="pagination">
        <button class="btn btn-small" ?disabled=${0===this._offset} @click=${this._prevPage}>Previous</button>
        <span>Page ${Math.floor(this._offset/this._limit)+1}</span>
        <button class="btn btn-small" ?disabled=${this._events.length<this._limit} @click=${this._nextPage}>Next</button>
      </div>
    `}};t([mt({attribute:!1})],qe.prototype,"hass",void 0),t([ut()],qe.prototype,"_events",void 0),t([ut()],qe.prototype,"_loading",void 0),t([ut()],qe.prototype,"_offset",void 0),t([ut()],qe.prototype,"_filterAlarm",void 0),t([ut()],qe.prototype,"_filterEvent",void 0),t([ut()],qe.prototype,"_filterUser",void 0),qe=t([ct("history-view")],qe);const Oe=[{id:"low",label:"Low",priorities:`${Ut[0]} + ${Ut[1]}`},{id:"medium",label:"Medium",priorities:Ut[2]},{id:"high",label:"High",priorities:Ut[3]}],Ue=[{hours:24,label:"24 h"},{hours:168,label:"7 days"},{hours:720,label:"30 days"}],Ie=t=>{if(t<60)return`${Math.round(t)} s`;const e=Math.floor(t/60);if(e<60)return`${e} min`;const i=Math.floor(e/60);return i<48?`${i} h ${e%60} min`:`${Math.floor(i/24)} d ${i%24} h`},Re=t=>"analog"===t.trigger_type;let je=class extends lt{constructor(){super(...arguments),this._hours=168,this._loading=!0,this._error=""}static{this.styles=[_t,n`
      :host { display: block; padding: 16px; }
      .toolbar {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;
      }
      .toolbar .label { color: var(--secondary-text-color, #727272); font-size: 0.9em; margin-right: 4px; }
      .chip {
        border: 1px solid var(--divider-color, #e0e0e0);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #212121);
        border-radius: 9999px; padding: 4px 14px; cursor: pointer; font: inherit; font-size: 0.85em;
      }
      .chip.active {
        background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }
      .kpis {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px; margin-bottom: 24px;
      }
      .kpi {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 12px 14px;
      }
      .kpi .value { font-size: 1.6em; font-weight: 500; color: var(--primary-text-color, #212121); }
      .kpi .name { font-size: 0.8em; color: var(--secondary-text-color, #727272); margin-top: 2px; }
      .kpi.warn .value { color: color-mix(in srgb, var(--warning-color, #ffa600) 75%, var(--primary-text-color, #212121)); }
      section {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: var(--ha-card-border-radius, 12px);
        margin-bottom: 20px;
        overflow: hidden;
      }
      section h3 { margin: 0; padding: 14px 16px 2px; font-size: 1.05em; font-weight: 500; }
      section .desc { padding: 0 16px 10px; font-size: 0.85em; color: var(--secondary-text-color, #727272); }
      .scroll { overflow-x: auto; }
      .none { padding: 12px 16px 16px; color: var(--secondary-text-color, #727272); font-size: 0.9em; }
      .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .sub { font-size: 0.8em; color: var(--secondary-text-color, #727272); }
      .advice { font-size: 0.85em; color: var(--secondary-text-color, #727272); min-width: 180px; }
      .stale { color: var(--error-color, #db4437); font-weight: 600; }
      .bar {
        height: 6px; border-radius: 3px; background: var(--primary-color, #03a9f4); margin-top: 4px; opacity: 0.6;
      }
      .deleted { font-style: italic; color: var(--secondary-text-color, #727272); }
      .footnote { font-size: 0.8em; color: var(--secondary-text-color, #727272); margin-top: 8px; }
      .off-target {
        color: color-mix(in srgb, var(--warning-color, #ffa600) 75%, var(--primary-text-color, #212121));
        font-weight: 600;
      }
      .share-bar {
        position: relative; height: 8px; border-radius: 4px; margin-top: 4px; min-width: 80px;
        background: var(--secondary-background-color, #f0f0f0);
      }
      .share-bar .fill {
        position: absolute; top: 0; bottom: 0; left: 0; border-radius: 4px;
        background: var(--primary-color, #03a9f4); opacity: 0.6;
      }
      .share-bar .target {
        position: absolute; top: -3px; bottom: -3px; width: 2px;
        background: var(--primary-text-color, #212121);
      }
      .chips-inline { display: flex; flex-wrap: wrap; gap: 4px; }
      .mini {
        font-size: 0.8em; padding: 1px 8px; border-radius: 9999px; white-space: nowrap;
        background: var(--secondary-background-color, #f0f0f0);
      }
      a.alarm-link { color: var(--primary-color, #03a9f4); text-decoration: none; }
    `]}connectedCallback(){super.connectedCallback(),this._load()}async _load(){if(this.hass){this._loading=!0,this._error="";try{this._report=await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/noise_report",hours:e}))(this.hass,this._hours)}catch(t){this._error=t?.message??String(t)}finally{this._loading=!1}}}_setPeriod(t){t!==this._hours&&(this._hours=t,this._load())}_edit(t){this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"create-edit",alarmId:t},bubbles:!0,composed:!0}))}_nameCell(t){return t.deleted?j`<td class="deleted">${t.name}</td>`:j`<td>
      <strong>${t.name}</strong>
      ${t.area||t.source_entity_id?j`<div class="sub">${[t.area,t.source_entity_id].filter(Boolean).join(" · ")}</div>`:Z}
    </td>`}_priorityCell(t){return j`<td>
      ${void 0!==t.priority?j`<severity-badge .priority=${t.priority}></severity-badge>`:Z}
    </td>`}_editCell(t){return j`<td>
      ${t.deleted?Z:j`<button class="btn btn-small btn-primary" @click=${()=>this._edit(t.alarm_id)}>
            Edit
          </button>`}
    </td>`}_adviceFrequent(t){return t.deleted?"":Re(t)&&!t.hysteresis?"Add hysteresis, or move the threshold away from normal operation.":t.trigger_delay?"Check the threshold, and whether someone actually needs to act on this alarm.":"Add a trigger delay so short spikes do not alarm."}_adviceChatter(t){return t.deleted?"":Re(t)&&!t.hysteresis?"Add hysteresis (deadband).":t.clear_delay?"Increase the hysteresis or the clear delay.":"Add a clear delay so it does not re-trigger right after clearing."}_adviceFleeting(t,e){return t.deleted?"":t.trigger_delay?"Increase the trigger delay.":`Add a trigger delay of at least ${e} s.`}_adviceNever(t){return t.deleted?"":t.source_entity_id&&this.hass&&!this.hass.states[t.source_entity_id]?"The source entity does not exist. Point the alarm at the right entity, or delete it.":"external"===t.trigger_type?"Triggered by an automation. Check that the automation still calls the trigger service.":"Check that the limit can actually be reached. Delete the alarm if it is not needed."}_offTarget(t,e,i){return"low"===t?e<i-10:e>i+10}_bandCell(t,e){if(0===e.total)return j`<td class="num">–</td>`;const i=e.bands[t];return j`<td class="num">
      <span class=${this._offTarget(t,i.share,i.target)?"off-target":""}>${i.share} %</span>
      <span class="sub">(${i.count})</span>
      <div class="share-bar">
        <div class="fill" style=${`width:${i.share}%`}></div>
        <div class="target" style=${`left:${i.target}%`}></div>
      </div>
    </td>`}_renderPriority(t){const e=t.priority,i=[0,1,2,3].map(t=>`${Ut[t]} ${e.by_priority[t]??0}`).join(" · ");return j`
      <section>
        <h3>Priority distribution</h3>
        <div class="desc">
          Share of alarms per priority band compared with the recommended 80 / 15 / 5 % (the dark mark).
          If too many alarms are high priority, nothing stands out when it really matters.
        </div>
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th>Band</th>
                <th>Priorities</th>
                <th class="num">Configured alarms</th>
                <th class="num">Activations in period</th>
                <th class="num">Recommended</th>
              </tr>
            </thead>
            <tbody>
              ${Oe.map(t=>j`<tr>
                  <td><strong>${t.label}</strong></td>
                  <td>${t.priorities}</td>
                  ${this._bandCell(t.id,e.configured)}
                  ${this._bandCell(t.id,e.activations)}
                  <td class="num">${e.configured.bands[t.id].target} %</td>
                </tr>`)}
            </tbody>
          </table>
        </div>
        <div class="desc" style="padding-top: 10px">
          Enabled alarms: ${e.configured.total} (${i}).
        </div>
      </section>
    `}_section(t,e,i,a,r,s){return j`
      <section>
        <h3>${t}</h3>
        <div class="desc">${e}</div>
        ${0===a.length?j`<div class="none">${s}</div>`:j`<div class="scroll">
              <table>
                <thead>
                  <tr>${i.map(t=>j`<th class=${t.startsWith("#")?"num":""}>${t.replace(/^#/,"")}</th>`)}</tr>
                </thead>
                <tbody>${a.map(r)}</tbody>
              </table>
            </div>`}
      </section>
    `}_renderKpis(t){const e=t.kpis,i=[{value:String(e.activations),name:"Activations in period"},{value:String(e.per_day),name:"Average per day"},{value:`${e.top_share} %`,name:`Share from top ${t.thresholds.top_count}`,warn:e.top_share>=50&&e.activations>0},{value:String(e.standing),name:`Standing (${e.stale} stale)`,warn:e.stale>0},{value:String(e.chattering),name:"Chattering alarms",warn:e.chattering>0},{value:String(e.fleeting),name:"Fleeting alarms",warn:e.fleeting>0},{value:String(e.floods),name:`Alarm floods (${e.flood_share} % of time)`,warn:e.floods>0},{value:String(e.never),name:`Not triggered in ${t.thresholds.never_days} d`},{value:String(e.hidden),name:"Shelved / disabled"}];return j`<div class="kpis">
      ${i.map(t=>j`<div class="kpi ${t.warn?"warn":""}">
          <div class="value">${t.value}</div>
          <div class="name">${t.name}</div>
        </div>`)}
    </div>`}render(){const t=j`<div class="toolbar">
      <span class="label">Period:</span>
      ${Ue.map(t=>j`<button class="chip ${t.hours===this._hours?"active":""}" aria-pressed=${t.hours===this._hours?"true":"false"} @click=${()=>this._setPeriod(t.hours)}>
          ${t.label}
        </button>`)}
    </div>`;if(this._loading&&!this._report)return j`${t}${ve()}`;if(this._error)return j`${t}<div class="empty-state">Could not load the noise report: ${this._error}</div>`;const e=this._report;if(!e)return t;const i=e.thresholds,a=e.top[0]?.count??1;return j`
      ${t}
      ${this._renderKpis(e)}

      ${this._section(`Top ${i.top_count} most frequent`,"Alarms that activated most often in the period. Usually a handful of alarms cause most of the noise, so start here.",["Alarm","Priority","#Activations","#Share","#Suppressed","Suggested action",""],e.top,t=>j`<tr>
          ${this._nameCell(t)}
          ${this._priorityCell(t)}
          <td class="num">${t.count}<div class="bar" style=${`width:${Math.max(4,t.count/a*100)}%`}></div></td>
          <td class="num">${t.share} %</td>
          <td class="num">${t.suppressed||"–"}</td>
          <td class="advice">${this._adviceFrequent(t)}</td>
          ${this._editCell(t)}
        </tr>`,"No alarm activations in this period.")}

      ${this._section("Most time in alarm","Total time each alarm was active in the period. An alarm that is active much of the time tells nobody anything new.",["Alarm","Priority","#Time in alarm","#Share of period","#Periods","Suggested action",""],e.time_in_alarm,t=>j`<tr>
          ${this._nameCell(t)}
          ${this._priorityCell(t)}
          <td class="num">
            ${Ie(t.seconds)}
            ${t.ongoing?j`<div class="sub">still active</div>`:Z}
          </td>
          <td class="num">${t.share} %<div class="bar" style=${`width:${Math.max(4,t.share)}%`}></div></td>
          <td class="num">${t.periods}</td>
          <td class="advice">
            ${t.share>=50?"Active most of the time: fix the cause, change the limit, or make it a status instead of an alarm.":""}
          </td>
          ${this._editCell(t)}
        </tr>`,"No alarm was active in this period.")}

      ${this._section("Standing alarms",`Alarms that are active right now, longest first. Active for more than ${i.stale_hours} h counts as stale: nobody is acting on it.`,["Alarm","Priority","State","#Active for","Suggested action",""],e.standing,t=>j`<tr>
          ${this._nameCell(t)}
          ${this._priorityCell(t)}
          <td>${It[t.state]??t.state}</td>
          <td class="num ${t.stale?"stale":""}">${Ie(t.duration)}</td>
          <td class="advice">${t.stale?"Fix the cause, change the limit, or make it a status instead of an alarm.":""}</td>
          ${this._editCell(t)}
        </tr>`,"No active alarms right now.")}

      ${this._section("Chattering alarms",`${i.chatter_count} or more activations within ${i.chatter_window} s. The value is probably hovering around the threshold.`,["Alarm","Priority","#Bursts","#Largest burst","#Activations","Suggested action",""],e.chattering,t=>j`<tr>
          ${this._nameCell(t)}
          ${this._priorityCell(t)}
          <td class="num">${t.bursts}</td>
          <td class="num">${t.max_burst}</td>
          <td class="num">${t.count}</td>
          <td class="advice">${this._adviceChatter(t)}</td>
          ${this._editCell(t)}
        </tr>`,"No chattering alarms in this period.")}

      ${this._section("Fleeting alarms",`Activations that ended within ${i.fleeting_seconds} s, before anyone could react.`,["Alarm","Priority","#Fleeting","#Of activations","#Shortest","Suggested action",""],e.fleeting,t=>j`<tr>
          ${this._nameCell(t)}
          ${this._priorityCell(t)}
          <td class="num">${t.fleeting}</td>
          <td class="num">${t.activations}</td>
          <td class="num">${t.shortest} s</td>
          <td class="advice">${this._adviceFleeting(t,i.fleeting_seconds)}</td>
          ${this._editCell(t)}
        </tr>`,"No fleeting alarms in this period.")}

      ${this._section("Alarm floods",`Periods with more than ${i.flood_count} activations within ${i.flood_window/60} min, newest first. The alarm that started a flood is often the root cause, and the rest are consequences.`,["Started","#Duration","#Activations","#Alarms","Started by","Most activations"],e.floods,t=>j`<tr>
          <td><rel-time .hass=${this.hass} .datetime=${t.start}></rel-time></td>
          <td class="num">${Ie(t.duration)}</td>
          <td class="num">${t.count}</td>
          <td class="num">${t.alarms}</td>
          <td class=${t.initiator.deleted?"deleted":""}>
            ${t.initiator.deleted?t.initiator.name:j`<a
                  class="alarm-link"
                  href="#"
                  @click=${e=>{e.preventDefault(),this._edit(t.initiator.alarm_id)}}
                  >${t.initiator.name}</a
                >`}
          </td>
          <td>
            <div class="chips-inline">
              ${t.top.map(t=>j`<span class="mini">${t.name} × ${t.count}</span>`)}
            </div>
          </td>
        </tr>`,"No alarm floods in this period.")}

      ${this._renderPriority(e)}

      ${this._section(`Not triggered in ${i.never_days} days`,`Enabled alarms older than ${i.never_days} days that have not activated in that time. They may be dead, or point at the wrong entity.`,["Alarm","Priority","Last activation","Suggested action",""],e.never,t=>j`<tr>
          ${this._nameCell(t)}
          ${this._priorityCell(t)}
          <td>
            ${t.last_triggered?j`<rel-time .hass=${this.hass} .datetime=${t.last_triggered}></rel-time>`:"Never"}
          </td>
          <td class="advice">${this._adviceNever(t)}</td>
          ${this._editCell(t)}
        </tr>`,`Every enabled alarm has activated in the last ${i.never_days} days.`)}

      ${this._section("Shelved and disabled","Alarms that are hidden right now. A hidden alarm can hide a real problem, so check these regularly.",["Alarm","Priority","Status","#Hidden for","Suggested action",""],e.hidden,t=>{return j`<tr>
          ${this._nameCell(t)}
          ${this._priorityCell(t)}
          <td>
            ${"shelved"===t.kind?"Shelved":"Disabled"}
            ${t.until?j`<div class="sub">until ${se(this.hass,t.until)}</div>`:Z}
          </td>
          <td class="num">${e=t.since,e?Ie((Date.now()-new Date(e).getTime())/1e3):"unknown"}</td>
          <td class="advice">
            ${"shelved"===t.kind?"Check that the reason for shelving still applies.":"Delete it if it is no longer needed, or fix it and turn it back on."}
          </td>
          ${this._editCell(t)}
        </tr>`;var e},"No shelved or disabled alarms.")}

      <div class="footnote">
        Period: ${se(this.hass,e.start)} – ${se(this.hass,e.end)}.
        Suppressed activations (a stricter alarm on the same sensor was active) are not counted as noise.
        Thresholds follow ISA-18.2 / EEMUA 191 defaults.
      </div>
    `}};t([mt({attribute:!1})],je.prototype,"hass",void 0),t([ut()],je.prototype,"_hours",void 0),t([ut()],je.prototype,"_report",void 0),t([ut()],je.prototype,"_loading",void 0),t([ut()],je.prototype,"_error",void 0),je=t([ct("noise-view")],je);const Be=t=>(t??[]).map(t=>"string"==typeof t?{target:t,min_priority:0}:{target:t.target,min_priority:t.min_priority??0}),Ze=[{id:"notify.mobile_app_marius",label:"Marius — phone",path:Ht},{id:"notify.mobile_app_anna",label:"Anna — phone",path:Ht},{id:"notify.mobile_app_security",label:"Security — phone",path:"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z"},{id:"notify.facilities_team",label:"Facilities team",path:"M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"},{id:"notify.it_oncall",label:"IT on-call",path:"M12,15C7.58,15 4,16.79 4,19V21H20V19C20,16.79 16.42,15 12,15M8,9A4,4 0 0,0 12,13A4,4 0 0,0 16,9M11.5,2C11.2,2 11,2.21 11,2.5V5.5H10V3C10,3 7.75,3.86 7.75,6.75C7.75,6.75 7,6.89 7,8H17C16.95,6.89 16.25,6.75 16.25,6.75C16.25,3.86 14,3 14,3V5.5H13V2.5C13,2.21 12.81,2 12.5,2H11.5Z"},{id:"notify.persistent",label:"Persistent notification",path:"M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"},{id:"notify.telegram_ops",label:"Telegram — Ops",path:Vt},{id:"notify.email_admin",label:"Email — admin",path:"M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"},{id:"notify.alexa_everywhere",label:"Alexa — announce",path:"M12,8H4A2,2 0 0,0 2,10V14A2,2 0 0,0 4,16H5V20A1,1 0 0,0 6,21H8A1,1 0 0,0 9,20V16H12L17,20V4L12,8M21.5,12C21.5,13.71 20.54,15.26 19,16V8C20.53,8.75 21.5,10.3 21.5,12Z"}];let Ke=class extends lt{constructor(){super(...arguments),this.value=[],this.targets=Ze,this._open=!1}static{this.styles=[_t,n`
      :host {
        display: block;
        position: relative;
      }
      .box {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        min-height: 40px;
        padding: 6px 8px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px;
        background: var(--card-background-color, #fff);
      }
      .empty {
        font-size: 13.5px;
        color: var(--secondary-text-color, #727272);
        padding: 0 4px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 6px 5px 10px;
        border-radius: 9999px;
        font-size: 12.5px;
        font-weight: 500;
        background: color-mix(in srgb, var(--primary-color, #009ac7) 12%, transparent);
        color: var(--primary-color, #009ac7);
        --mdc-icon-size: 14px;
      }
      .chip .x {
        display: inline-flex;
        cursor: pointer;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 13px;
      }
      .chip .x:hover {
        background: color-mix(in srgb, var(--primary-color, #009ac7) 22%, transparent);
      }
      .add {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        border-radius: 9999px;
        border: 1px dashed var(--divider-color, #e0e0e0);
        background: transparent;
        cursor: pointer;
        font: inherit;
        font-size: 12.5px;
        font-weight: 500;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 14px;
      }
      .add:disabled {
        cursor: not-allowed;
        color: var(--disabled-text-color, #bdbdbd);
      }
      .menu {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        z-index: 50;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        overflow: hidden auto;
        max-height: 260px;
      }
      .opt {
        padding: 9px 12px;
        cursor: pointer;
        font-size: 13.5px;
        display: flex;
        align-items: center;
        gap: 10px;
        --mdc-icon-size: 17px;
        color: var(--secondary-text-color, #727272);
      }
      .opt:hover {
        background: color-mix(in srgb, var(--primary-text-color, #212121) 6%, transparent);
      }
      .opt .lbl {
        flex: 1;
        color: var(--primary-text-color, #212121);
      }
      .opt .id {
        font-size: 11.5px;
        font-family: var(--ha-font-family-code, monospace);
        color: var(--secondary-text-color, #727272);
      }
    `]}connectedCallback(){super.connectedCallback(),this._onDoc=this._onDoc.bind(this),document.addEventListener("mousedown",this._onDoc)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mousedown",this._onDoc)}_onDoc(t){t.composedPath().includes(this)||(this._open=!1)}_meta(t){return this.targets.find(e=>e.id===t)??{id:t,label:t,path:At}}_emit(t){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t}}))}_add(t){this._emit([...this.value,{target:t,min_priority:0}])}_remove(t){this._emit(this.value.filter(e=>e.target!==t))}_setPriority(t,e){this._emit(this.value.map(i=>i.target===t?{...i,min_priority:e}:i))}render(){const t=this.value.map(t=>t.target),e=this.targets.filter(e=>!t.includes(e.id)),i={0:"All",1:"Warn+",2:"High+",3:"Crit"};return j`
      <div class="box">
        ${0===this.value.length?j`<span class="empty">No targets — alarms log to history only</span>`:Z}
        ${this.value.map(t=>{const e=this._meta(t.target);return j`
            <span class="chip">
              <ha-svg-icon .path=${e.path}></ha-svg-icon>
              ${e.label}
              <select style="border:none;background:transparent;font:inherit;font-size:11px;color:inherit;padding:0 2px;cursor:pointer"
                title="Minimum priority to notify this target"
                .value=${String(t.min_priority)}
                @change=${e=>{e.stopPropagation(),this._setPriority(t.target,parseInt(e.target.value))}}
                @click=${t=>t.stopPropagation()}>
                ${[0,1,2,3].map(t=>j`<option value=${t}>${i[t]}</option>`)}
              </select>
              <span class="x" title="Remove" @click=${()=>this._remove(t.target)}>
                <ha-svg-icon .path=${Et}></ha-svg-icon>
              </span>
            </span>
          `})}
        <button class="add" ?disabled=${0===e.length} @click=${()=>this._open=!this._open}>
          <ha-svg-icon .path=${"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"}></ha-svg-icon>Add target
        </button>
      </div>
      ${this._open&&e.length>0?j`
            <div class="menu">
              ${e.map(t=>j`
                  <div
                    class="opt"
                    @click=${()=>{this._add(t.id),1===e.length&&(this._open=!1)}}
                  >
                    <ha-svg-icon .path=${t.path}></ha-svg-icon>
                    <span class="lbl">${t.label}</span>
                    <span class="id">${t.id}</span>
                  </div>
                `)}
            </div>
          `:Z}
    `}};t([mt({attribute:!1})],Ke.prototype,"value",void 0),t([mt({attribute:!1})],Ke.prototype,"targets",void 0),t([ut()],Ke.prototype,"_open",void 0),Ke=t([ct("notify-target-picker")],Ke);const We={name:"Channel name",min_priority:"Minimum priority",persistent_notification:"Persistent notifications",mobile_push:"Mobile push",critical_notification:"Critical alerts"},Ge={min_priority:"Only alarms at or above this priority will use this channel.",persistent_notification:"Show the alarm in Home Assistant's notifications panel.",mobile_push:"Send a push notification to mobile devices via the Companion app.",critical_notification:"Critical alerts bypass Do Not Disturb on iOS and Android."},Ye=[0,1,2,3].map(t=>({value:String(t),label:Ut[t]})),Je=[{name:"",type:"grid",schema:[{name:"name",required:!0,selector:{text:{}}},{name:"min_priority",required:!0,selector:{select:{mode:"dropdown",options:Ye}}}]}],Qe=[{name:"",type:"grid",schema:[{name:"persistent_notification",selector:{boolean:{}}},{name:"mobile_push",selector:{boolean:{}}},{name:"critical_notification",selector:{boolean:{}}}]}];let Xe=class extends lt{constructor(){super(...arguments),this._channels=[],this._loading=!0,this._formAvailable=!0,this._editing=null,this._data={name:"",min_priority:"0",persistent_notification:!0,mobile_push:!0,critical_notification:!1},this._targets=[],this._saving=!1,this._error="",this._filterName="",this._computeLabel=t=>We[t.name]??t.name,this._computeHelper=t=>Ge[t.name]??""}get _notifyTargets(){return this.hass?.services?.notify?Object.keys(this.hass.services.notify).filter(t=>"send_message"!==t&&"persistent_notification"!==t).map(t=>({id:`notify.${t}`,label:t.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase()),path:At})):[]}static{this.styles=[_t,n`
      :host { display: block; padding: 16px; }
      .editor { max-width: 840px; margin: 0 auto; }
      h2 { margin: 0 0 16px; font-size: 1.5em; font-weight: 400; }
      .error {
        margin-bottom: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent);
        color: color-mix(in srgb, var(--error-color, #db4437) 75%, var(--primary-text-color, #212121));
      }
      .footer { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 0 24px; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      td.row-actions { white-space: nowrap; }
      .confirm-text { margin: 0; line-height: 1.5; }
    `]}connectedCallback(){super.connectedCallback(),this._loadChannels(),Yt().then(()=>Jt("ha-form",3e3)).then(t=>this._formAvailable=t)}async _loadChannels(){if(this.hass)try{this._channels=await Ft(this.hass)}finally{this._loading=!1}}_startCreate(){this._editing={},this._data={name:"",min_priority:"0",persistent_notification:!0,mobile_push:!0,critical_notification:!1},this._targets=[],this._error=""}_startEdit(t){this._editing=t,this._data=(t=>({name:t.name,min_priority:String(t.min_priority??0),persistent_notification:t.persistent_notification,mobile_push:t.mobile_push,critical_notification:t.critical_notification}))(t),this._targets=Be(t.notification_targets),this._error=""}_cancel(){this._editing=null,this._error=""}_onFormChange(t){t.stopPropagation(),this._data={...this._data,...t.detail.value}}async _save(){if(!this.hass)return;if(!this._data.name.trim())return void(this._error="Enter a channel name.");this._error="";const t=((t,e)=>({name:t.name.trim(),notification_targets:e,min_priority:Number(t.min_priority),persistent_notification:t.persistent_notification,mobile_push:t.mobile_push,critical_notification:t.critical_notification}))(this._data,this._targets);this._saving=!0;try{this._editing?.id?await(async(t,e,i)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/update",channel_id:e,...i}))(this.hass,this._editing.id,{...t}):await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/create",...e}))(this.hass,{...t})}catch(t){return this._error=`Saving channel failed: ${_e(t)}`,void ge(this,this._error)}finally{this._saving=!1}this._editing=null,this._loadChannels()}async _doDelete(){if(!this.hass||!this._deleteTarget)return;const{id:t,name:e}=this._deleteTarget;this._deleteTarget=void 0;try{await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/delete",channel_id:e})})(this.hass,t),ge(this,`Deleted channel: ${e}`)}catch(t){ge(this,`Deleting channel failed: ${_e(t)}`)}this._loadChannels()}render(){return this._loading?ve():null!==this._editing?this._renderForm():j`
      <div class="toolbar">
        <span>${this._channels.length} channel${1!==this._channels.length?"s":""}</span>
        <button class="btn btn-primary" @click=${this._startCreate}>+ New channel</button>
      </div>
      <div class="table-wrap">
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
            <th><input type="text" placeholder="Filter..." aria-label="Filter by name" .value=${this._filterName} @input=${t=>this._filterName=t.target.value} /></th>
            <th></th><th></th><th></th><th></th><th></th><th></th>
          </tr>
        </thead>
        <tbody>
          ${this._channels.filter(t=>!this._filterName||t.name.toLowerCase().includes(this._filterName.toLowerCase())).map(t=>j`
              <tr>
                <td><strong>${t.name}</strong></td>
                <td>${0===t.notification_targets.length?"-":Be(t.notification_targets).map(t=>t.target).join(", ")}</td>
                <td>${Ut[t.min_priority]??"Info"}</td>
                <td>${t.persistent_notification?"Yes":"No"}</td>
                <td>${t.mobile_push?"Yes":"No"}</td>
                <td>${t.critical_notification?"Yes":"No"}</td>
                <td class="row-actions">
                  <button class="btn btn-small btn-plain" @click=${()=>this._startEdit(t)}>Edit</button>
                  <button class="btn btn-small btn-plain danger" @click=${()=>this._deleteTarget=t}>Delete</button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
      </div>

      <scada-dialog
        .open=${!!this._deleteTarget}
        heading="Delete channel?"
        width="small"
        @dialog-closed=${()=>this._deleteTarget=void 0}
      >
        <p class="confirm-text">
          Delete the channel <strong>${this._deleteTarget?.name??""}</strong>? Alarms using it will no longer send
          notifications until you assign another channel.
        </p>
        <button slot="footer" class="btn btn-plain" @click=${()=>this._deleteTarget=void 0}>Cancel</button>
        <button slot="footer" class="btn btn-danger" @click=${this._doDelete}>Delete</button>
      </scada-dialog>
    `}_section(t,e,i){return j`
      <section class="form-section">
        <div class="form-section-header">${t}${e?j`<span class="sub">${e}</span>`:Z}</div>
        <div class="form-section-body">${i}</div>
      </section>
    `}_haForm(t){return j`
      <ha-form
        .hass=${this.hass}
        .data=${this._data}
        .schema=${t}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._onFormChange}
      ></ha-form>
    `}_renderForm(){const t=!!this._editing?.id;return this._formAvailable?j`
      <div class="editor">
        <h2>${t?"Edit channel":"New channel"}</h2>
        ${this._error?j`<div class="error" role="alert">${this._error}</div>`:Z}

        ${this._section("General",void 0,this._haForm(Je))}
        ${this._section("Notification targets","Notify services that receive alerts. Each target can set its own minimum priority to filter low-severity alarms.",j`
            <notify-target-picker
              .value=${this._targets}
              .targets=${this._notifyTargets}
              @value-changed=${t=>this._targets=t.detail.value}
            ></notify-target-picker>
          `)}
        ${this._section("Delivery","How alarms on this channel reach people.",this._haForm(Qe))}

        <div class="footer">
          <button class="btn btn-plain" @click=${this._cancel}>Cancel</button>
          <button class="btn btn-primary" ?disabled=${this._saving} @click=${this._save}>
            ${this._saving?"Saving…":t?"Save":"Create"}
          </button>
        </div>
      </div>
    `:j`
        <div class="editor">
          <div class="error">
            Home Assistant's form components could not be loaded. Reload the page (Ctrl+Shift+R) and try again.
          </div>
          <div class="footer">
            <button class="btn btn-plain" @click=${this._cancel}>Back</button>
          </div>
        </div>
      `}};t([mt({attribute:!1})],Xe.prototype,"hass",void 0),t([ut()],Xe.prototype,"_channels",void 0),t([ut()],Xe.prototype,"_loading",void 0),t([ut()],Xe.prototype,"_formAvailable",void 0),t([ut()],Xe.prototype,"_editing",void 0),t([ut()],Xe.prototype,"_data",void 0),t([ut()],Xe.prototype,"_targets",void 0),t([ut()],Xe.prototype,"_saving",void 0),t([ut()],Xe.prototype,"_error",void 0),t([ut()],Xe.prototype,"_deleteTarget",void 0),t([ut()],Xe.prototype,"_filterName",void 0),Xe=t([ct("channels-view")],Xe);const ti="__none__",ei="__default__",ii="__dashboard__",ai=()=>({name:"",description:"",priority:"1",channel_id:ti,source_entity_id:"",trigger_type:"digital",operator:">",threshold:0,hysteresis:void 0,target_state:"on",match_values:[],trigger_delay:void 0,clear_delay:void 0,area:"",equipment:"",tag:"",enabled:!0,latching:!1,ack_required:!0,auto_clear:!0,suppress_milder:!0,repeat_interval:void 0,auto_ack_delay:void 0,condition_mode:"none",condition_entity:"",condition_state:"",condition_template:"",notification_title_template:"",notification_text_template:"",link_page_path:ei,link_view_path:ii,action_label:"",action_service:"",action_target:void 0}),ri={name:"Alarm name",description:"Description",priority:"Priority",channel_id:"Channel",source_entity_id:"Source entity",trigger_type:"Trigger type",operator:"Operator",threshold:"Threshold",hysteresis:"Hysteresis (deadband)",target_state:"Target state",match_values:"Match values",trigger_delay:"On-delay",clear_delay:"Clear delay",area:"Area",equipment:"Equipment",tag:"Tag",enabled:"Enabled",latching:"Latching",ack_required:"Acknowledge required",auto_clear:"Auto clear",suppress_milder:"Suppress milder alarms",repeat_interval:"Reminder interval",auto_ack_delay:"Auto-acknowledge after return to normal",condition_mode:"Condition",condition_entity:"Condition entity",condition_state:"Expected state",condition_template:"Condition template",notification_title_template:"Title template",notification_text_template:"Message template",link_page_path:"Link to dashboard",link_view_path:"View",action_label:"Action button label",action_service:"Action",action_target:"Action target"},si={source_entity_id:"The entity whose state this alarm monitors.",channel_id:"Channels define where notifications go. Create one in the Channels tab.",hysteresis:"Prevents rapid on/off: the alarm clears only when the value moves past the threshold by this much.",match_values:"The alarm is active while the entity has any of these states.",trigger_delay:"The condition must hold this long before the alarm activates. Empty = no delay.",clear_delay:"The condition must stay cleared this long before the alarm returns to normal. Empty = no delay.",enabled:"When off, the alarm is not evaluated.",latching:"Stays active until manually reset, even if the condition clears.",ack_required:"The alarm must be acknowledged before it can return to normal.",auto_clear:"Clear automatically when the trigger condition is no longer met.",suppress_milder:"While active, milder alarms on the same sensor in the same direction are suppressed (e.g. Very Low suppresses Low).",repeat_interval:"Re-send the notification this often while the alarm is active and unacknowledged. Empty = no reminders.",auto_ack_delay:"Acknowledge automatically once the alarm has been back to normal this long. Empty = manual acknowledge. Good for event-type alarms.",condition_template:"Jinja2 template that must render true, e.g. {{ is_state('device_tracker.car', 'home') }}",notification_title_template:"Default: [Priority] Alarm name",link_page_path:"Where the alarm's notifications link to.",action_label:"Optional button on the push notification and in the alarm list. Needs a label, an action and a target.",action_target:"Entity, device or area the action runs against."},oi=[{value:"0",label:"Info — panel only, no notifications"},{value:"1",label:"Warning — persistent notification"},{value:"2",label:"High — persistent + mobile push"},{value:"3",label:"Critical — mobile push, bypasses Do Not Disturb"}],ni=[{value:">",label:"Greater than (>)"},{value:">=",label:"Greater or equal (>=)"},{value:"<",label:"Less than (<)"},{value:"<=",label:"Less or equal (<=)"},{value:"==",label:"Equal (==)"},{value:"!=",label:"Not equal (!=)"}],li={duration:{enable_second:!0}},di={duration:{enable_day:!0,enable_second:!0}};let ci=class extends lt{constructor(){super(...arguments),this._channels=[],this._loading=!0,this._saving=!1,this._formAvailable=!0,this._data=ai(),this._views=[],this._error="",this._actionEntity="",this._externalTriggerConfig={},this._computeLabel=t=>ri[t.name]??t.name,this._computeHelper=t=>si[t.name]??""}static{this.styles=[_t,n`
      :host { display: block; padding: 16px; max-width: 840px; margin: 0 auto; }
      h2 { margin: 0 0 16px; font-size: 1.5em; font-weight: 400; }
      .vars {
        margin-top: 8px;
        font-size: 0.8em;
        line-height: 1.6;
        color: var(--secondary-text-color);
      }
      .vars code { font-family: var(--ha-font-family-code, monospace); }
      .error {
        margin-bottom: 16px;
        padding: 12px 16px;
        border-radius: 8px;
        background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent);
        color: color-mix(in srgb, var(--error-color, #db4437) 75%, var(--primary-text-color, #212121));
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 8px 0 24px;
      }
    `]}connectedCallback(){super.connectedCallback(),this._load()}updated(t){t.has("alarmId")&&this._load()}async _ensureHaPickersLoaded(){await Yt(),this._formAvailable=await Jt("ha-form",3e3)}async _load(){if(this.hass){this._loading=!0,this._error="";try{if(await this._ensureHaPickersLoaded(),this._channels=await Ft(this.hass),this.alarmId){const t=await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/get",alarm_id:e}))(this.hass,this.alarmId),e=t.trigger_config??{},i=(t.condition_template||"").match(/\{\{\s*is_state\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*\}\}/),a=i?"simple":t.condition_template?"template":"none";this._actionEntity=t.action_entity||"",this._externalTriggerConfig="external"===t.trigger_type?{...e}:{},this._data={...ai(),name:t.name,description:t.description,priority:String(t.priority),channel_id:t.channel_id??ti,source_entity_id:t.source_entity_id,trigger_type:t.trigger_type,operator:"analog"===t.trigger_type?e.operator??">":">",threshold:"analog"===t.trigger_type?Number(e.threshold??0):0,hysteresis:t.hysteresis??void 0,target_state:"digital"===t.trigger_type?e.target_state??"on":"on",match_values:"custom_state"===t.trigger_type?[...e.match_values??[]]:[],trigger_delay:de(t.trigger_delay),clear_delay:de(t.clear_delay),area:t.area,equipment:t.equipment,tag:t.tag,enabled:t.enabled,latching:t.latching,ack_required:t.ack_required,auto_clear:t.auto_clear,suppress_milder:t.suppress_milder??!0,repeat_interval:de(t.repeat_interval),auto_ack_delay:de(t.auto_ack_delay),condition_mode:a,condition_entity:i?i[1]:"",condition_state:i?i[2]:"",condition_template:t.condition_template||"",notification_title_template:t.notification_title_template||"",notification_text_template:t.notification_text_template||"",link_page_path:t.link_page_path||ei,link_view_path:t.link_view_path||ii,action_label:t.action_label||"",action_service:t.action_service||"",action_target:t.action_target?{...t.action_target}:t.action_entity?{entity_id:[t.action_entity]}:void 0},await this._loadViews(t.link_page_path||"")}else this._resetForm()}catch(t){this._error=`Could not load the alarm: ${_e(t)}`}finally{this._loading=!1}}}_resetForm(){this._data=ai(),this._views=[],this._actionEntity="",this._externalTriggerConfig={}}get _dashboards(){const t=this.hass?.panels??{};return Object.values(t).filter(t=>"lovelace"===t.component_name).sort((t,e)=>(t.title||t.url_path).localeCompare(e.title||e.url_path))}async _loadViews(t){if(this._views=[],this.hass&&t)try{const e=await(async(t,e)=>t.connection.sendMessagePromise({type:"lovelace/config",url_path:e}))(this.hass,t);this._views=(e?.views??[]).filter(t=>t.path).map(t=>({path:t.path,title:t.title||t.path}))}catch(t){}}get _serviceOptions(){const t=this.hass?.services??{},e=[];for(const i of Object.keys(t))for(const a of Object.keys(t[i]??{}))e.push(`${i}.${a}`);return e.sort()}_onFormChange(t){t.stopPropagation();const e={...this._data,...t.detail.value};e.link_page_path!==this._data.link_page_path&&(e.link_view_path=ii,this._loadViews(e.link_page_path===ei?"":e.link_page_path)),this._data=e}get _generalSchema(){return[{name:"name",required:!0,selector:{text:{}}},{name:"description",selector:{text:{multiline:!0}}},{name:"",type:"grid",schema:[{name:"priority",required:!0,selector:{select:{mode:"dropdown",options:oi}}},{name:"channel_id",required:!0,selector:{select:{mode:"dropdown",options:[{value:ti,label:"No channel"},...this._channels.map(t=>({value:t.id,label:t.name}))]}}}]}]}get _triggerSchema(){const t=this._data,e=this.hass?.states?.[t.source_entity_id]?.attributes?.unit_of_measurement,i={number:{mode:"box",step:"any",...e?{unit_of_measurement:e}:{}}},a=[{value:"analog",label:"Analog — numeric threshold"},{value:"digital",label:"Digital — state match"},{value:"custom_state",label:"Custom state — list of values"},..."external"===t.trigger_type?[{value:"external",label:"External — set by automation"}]:[]],r=t.source_entity_id?{state:{entity_id:t.source_entity_id}}:{text:{}},s=[{name:"source_entity_id",required:!0,selector:{entity:{}}},{name:"trigger_type",required:!0,selector:{select:{mode:"dropdown",options:a}}}];return"analog"===t.trigger_type?s.push({name:"",type:"grid",schema:[{name:"operator",required:!0,selector:{select:{mode:"dropdown",options:ni}}},{name:"threshold",required:!0,selector:i},{name:"hysteresis",selector:i}]}):"digital"===t.trigger_type?s.push({name:"target_state",required:!0,selector:r}):"custom_state"===t.trigger_type&&s.push({name:"match_values",required:!0,selector:{select:{multiple:!0,custom_value:!0,options:this._entityStates(t.source_entity_id)}}}),s.push({name:"",type:"grid",schema:[{name:"trigger_delay",selector:li},{name:"clear_delay",selector:li}]}),s}_entityStates(t){const e=this.hass?.states?.[t],i=new Set(this._data.match_values);e&&i.add(e.state);for(const t of e?.attributes?.options??[])i.add(t);return[...i]}get _locationSchema(){return[{name:"",type:"grid",schema:[{name:"area",selector:{area:{}}},{name:"equipment",selector:{text:{}}},{name:"tag",selector:{text:{}}}]}]}get _behaviorSchema(){const t=[{name:"enabled",selector:{boolean:{}}},{name:"latching",selector:{boolean:{}}},{name:"ack_required",selector:{boolean:{}}},{name:"auto_clear",selector:{boolean:{}}}];return"analog"===this._data.trigger_type&&t.push({name:"suppress_milder",selector:{boolean:{}}}),[{name:"",type:"grid",schema:t},{name:"",type:"grid",schema:[{name:"repeat_interval",selector:li},{name:"auto_ack_delay",selector:di}]}]}get _conditionSchema(){const t=this._data,e=[{name:"condition_mode",selector:{select:{mode:"list",options:[{value:"none",label:"None — alarm triggers whenever the trigger is met"},{value:"simple",label:"Entity state — e.g. the car must be home"},{value:"template",label:"Template — advanced Jinja2 condition"}]}}}];return"simple"===t.condition_mode?e.push({name:"",type:"grid",schema:[{name:"condition_entity",required:!0,selector:{entity:{}}},{name:"condition_state",required:!0,selector:t.condition_entity?{state:{entity_id:t.condition_entity}}:{text:{}}}]}):"template"===t.condition_mode&&e.push({name:"condition_template",required:!0,selector:{template:{}}}),e}get _notificationSchema(){return[{name:"notification_title_template",selector:{template:{}}},{name:"notification_text_template",selector:{template:{}}}]}get _linkActionSchema(){const t=[{name:"link_page_path",selector:{select:{mode:"dropdown",options:[{value:ei,label:"Alarm Center (default)"},...this._dashboards.map(t=>({value:t.url_path,label:t.title||t.url_path}))]}}}];return this._data.link_page_path!==ei&&this._views.length&&t.push({name:"link_view_path",selector:{select:{mode:"dropdown",options:[{value:ii,label:"Entire dashboard"},...this._views.map(t=>({value:t.path,label:t.title}))]}}}),[{name:"",type:"grid",schema:t},{name:"",type:"grid",schema:[{name:"action_label",selector:{text:{}}},{name:"action_service",selector:{select:{mode:"dropdown",custom_value:!0,options:this._serviceOptions}}}]},{name:"action_target",selector:{target:{}}}]}_buildTriggerConfig(){const t=this._data;switch(t.trigger_type){case"analog":return{operator:t.operator,threshold:Number(t.threshold??0)};case"digital":return{target_state:t.target_state};case"custom_state":return{match_values:(t.match_values??[]).map(t=>String(t).trim()).filter(Boolean)};default:return{...this._externalTriggerConfig}}}_validate(){const t=this._data;return t.name.trim()?t.source_entity_id.trim()?"analog"!==t.trigger_type||void 0!==t.threshold&&!isNaN(Number(t.threshold))?"custom_state"!==t.trigger_type||(t.match_values??[]).some(t=>String(t).trim())?"simple"===t.condition_mode&&t.condition_entity&&!t.condition_state?"Enter the expected state for the condition entity.":"":"Add at least one match value.":"Enter a numeric threshold.":"Choose a source entity.":"Enter an alarm name."}async _save(){if(!this.hass)return;const t=this._validate();if(t)return this._error=t,void ge(this,t);this._error="";const e=this._data,i="number"!=typeof e.hysteresis||isNaN(e.hysteresis)?null:e.hysteresis;this._saving=!0;try{const t={name:e.name.trim(),description:e.description??"",source_entity_id:e.source_entity_id.trim(),trigger_type:e.trigger_type,trigger_config:this._buildTriggerConfig(),priority:Number(e.priority),area:e.area??"",equipment:e.equipment??"",tag:e.tag??"",channel_id:e.channel_id&&e.channel_id!==ti?e.channel_id:null,enabled:e.enabled,latching:e.latching,ack_required:e.ack_required,auto_clear:e.auto_clear,suppress_milder:e.suppress_milder,condition_template:"simple"===e.condition_mode&&e.condition_entity?`{{ is_state('${e.condition_entity}', '${e.condition_state}') }}`:"template"===e.condition_mode&&e.condition_template||null,notification_title_template:e.notification_title_template||null,notification_text_template:e.notification_text_template||null,hysteresis:i,repeat_interval:le(e.repeat_interval),auto_ack_delay:le(e.auto_ack_delay),trigger_delay:le(e.trigger_delay),clear_delay:le(e.clear_delay),action_label:(e.action_label??"").trim()||null,action_service:(e.action_service??"").trim()||null,action_entity:this._actionEntity.trim()||null,action_target:e.action_target&&Object.keys(e.action_target).length>0?e.action_target:null,link_page_path:e.link_page_path&&e.link_page_path!==ei?e.link_page_path:null,link_view_path:e.link_page_path!==ei&&e.link_view_path&&e.link_view_path!==ii?e.link_view_path:null};this.alarmId?(await(async(t,e,i)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/update",alarm_id:e,...i}))(this.hass,this.alarmId,t),ge(this,`Saved: ${t.name}`)):(await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/create",...e}))(this.hass,t),ge(this,`Created: ${t.name}`),this._resetForm()),this._navigateBack()}catch(t){this._error=`Saving failed: ${_e(t)}`,ge(this,this._error)}finally{this._saving=!1}}_navigateBack(){this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"all"},bubbles:!0,composed:!0}))}_section(t,e,i,a=Z){return j`
      <section class="form-section">
        <div class="form-section-header">${t}${e?j`<span class="sub">${e}</span>`:Z}</div>
        <div class="form-section-body">
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${i}
            .computeLabel=${this._computeLabel}
            .computeHelper=${this._computeHelper}
            @value-changed=${this._onFormChange}
          ></ha-form>
          ${a}
        </div>
      </section>
    `}render(){if(this._loading)return ve();if(!this._formAvailable)return j`<div class="error">
        Home Assistant's form components could not be loaded. Reload the page (Ctrl+Shift+R) and try again.
      </div>`;const t="external"===this._data.trigger_type;return j`
      <h2>${this.alarmId?"Edit alarm":"Create alarm"}</h2>
      ${this._error?j`<div class="error" role="alert">${this._error}</div>`:Z}

      ${this._section("General",void 0,this._generalSchema)}
      ${this._section("Trigger",t?"This alarm is raised and cleared by an automation or blueprint.":"When the alarm becomes active.",this._triggerSchema)}
      ${this._section("Location","Used for grouping and filtering.",this._locationSchema)}
      ${this._section("Behavior",void 0,this._behaviorSchema)}
      ${this._section("Condition","Optional gate: the alarm only fires while the condition is true, e.g. low battery only when the device is home.",this._conditionSchema)}
      ${this._section("Notification text","Optional Jinja2 templates that override the default notification.",this._notificationSchema,j`<div class="vars">
          Variables:
          ${["name","value","unit","area","equipment","friendly_name","threshold","operator","priority"].map((t,e)=>j`${e?", ":""}<code>{{ ${t} }}</code>`)}
        </div>`)}
      ${this._section("Link and action","Optional.",this._linkActionSchema)}

      <div class="footer">
        <button class="btn btn-plain" @click=${this._navigateBack}>Cancel</button>
        <button class="btn btn-primary" ?disabled=${this._saving} @click=${this._save}>
          ${this._saving?"Saving…":this.alarmId?"Save":"Create"}
        </button>
      </div>
    `}};t([mt({attribute:!1})],ci.prototype,"hass",void 0),t([mt()],ci.prototype,"alarmId",void 0),t([ut()],ci.prototype,"_channels",void 0),t([ut()],ci.prototype,"_loading",void 0),t([ut()],ci.prototype,"_saving",void 0),t([ut()],ci.prototype,"_formAvailable",void 0),t([ut()],ci.prototype,"_data",void 0),t([ut()],ci.prototype,"_views",void 0),t([ut()],ci.prototype,"_error",void 0),ci=t([ct("create-edit-view")],ci);const hi=["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"];let pi=class extends lt{constructor(){super(...arguments),this._alarms=[],this._channelCount=0,this._events=[],this._loading=!0}static{this.styles=[_t,n`
      :host { display: block; padding: 16px; max-width: 800px; }
      .stats-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 12px; margin-bottom: 24px;
      }
      .stat-card {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 14px; text-align: center;
      }
      .stat-value { font-size: 1.8em; font-weight: 600; color: var(--primary-color); }
      .stat-label { font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px; }
      .section {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 8px; padding: 16px; margin-bottom: 16px;
      }
      .section h3 { margin: 0 0 12px; font-size: 1em; color: var(--secondary-text-color); }
      .freq-row {
        display: flex; align-items: center; gap: 8px; padding: 6px 0;
        border-bottom: 1px solid var(--divider-color);
        font-size: 0.9em;
      }
      .freq-row:last-child { border-bottom: none; }
      .freq-bar {
        height: 6px; border-radius: 3px; min-width: 4px;
      }
      .freq-count { font-weight: 600; min-width: 24px; text-align: right; font-variant-numeric: tabular-nums; }
      .freq-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--divider-color); font-size: 0.9em; }
      .info-row:last-child { border-bottom: none; }
    `]}connectedCallback(){super.connectedCallback(),this._loadStats()}async _loadStats(){if(this.hass)try{const[t,e,i]=await Promise.all([Pt(this.hass),Ft(this.hass),qt(this.hass,{limit:500})]);this._alarms=t,this._channelCount=e.length,this._events=i}finally{this._loading=!1}}_getMostFrequent(){const t={};for(const e of this._events)if("triggered"===e.event_type){const i=this._alarms.find(t=>t.id===e.alarm_id),a=e.alarm_id;t[a]||(t[a]={count:0,name:e.alarm_name||"Unknown",priority:i?.priority??1}),t[a].count++}return Object.values(t).sort((t,e)=>e.count-t.count).slice(0,10)}_getAvgAckTime(){const t=this._events.filter(t=>"acknowledged"===t.event_type);if(0===t.length)return"—";const e={};for(const t of this._events)"triggered"===t.event_type&&(e[t.alarm_id]=t.timestamp);let i=0,a=0;for(const r of t){const t=e[r.alarm_id];if(t){const e=(new Date(r.timestamp).getTime()-new Date(t).getTime())/6e4;e>0&&e<1440&&(i+=e,a++)}}if(0===a)return"—";const r=i/a;return r<60?`${Math.round(r)} min`:`${(r/60).toFixed(1)} h`}render(){if(this._loading)return ve();const t=this._alarms.filter(t=>hi.includes(t.runtime.state)).length,e=this._alarms.filter(t=>"shelved"===t.runtime.state).length,i=this._alarms.filter(t=>"disabled"===t.runtime.state).length,a=this._getMostFrequent(),r=a.length>0?a[0].count:1;return j`
      <h2>Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${this._alarms.length}</div>
          <div class="stat-label">Total Alarms</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${t}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${e}</div>
          <div class="stat-label">Shelved</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${i}</div>
          <div class="stat-label">Disabled</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._channelCount}</div>
          <div class="stat-label">Channels</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${this._getAvgAckTime()}</div>
          <div class="stat-label">Avg. ACK Time</div>
        </div>
      </div>

      ${a.length>0?j`
        <div class="section">
          <h3>Most Frequent Alarms (recent ${this._events.length} events)</h3>
          ${a.map(t=>j`
            <div class="freq-row">
              <span class="freq-count">${t.count}</span>
              <span class="freq-bar" style="width:${Math.max(t.count/r*120,4)}px;background:${yt(t.priority)}"></span>
              <span class="freq-name">${t.name}</span>
              <span style="font-size:0.8em;color:var(--secondary-text-color)">${Ut[t.priority]}</span>
            </div>
          `)}
        </div>
      `:""}

      <div class="section">
        <h3>About</h3>
        <div class="info-row">
          <span>Integration</span>
          <span>SCADA Alarm Manager</span>
        </div>
        <div class="info-row">
          <span>Domain</span>
          <span>scada_alarm_manager</span>
        </div>
        <div class="info-row">
          <span>Total Events</span>
          <span>${this._events.length}+</span>
        </div>
      </div>

      <p style="margin-top: 16px; font-size: 0.85em; color: var(--secondary-text-color);">
        To change global settings, go to Settings &rarr; Integrations &rarr; SCADA Alarm Manager &rarr; Options.
      </p>
    `}};t([mt({attribute:!1})],pi.prototype,"hass",void 0),t([ut()],pi.prototype,"_alarms",void 0),t([ut()],pi.prototype,"_channelCount",void 0),t([ut()],pi.prototype,"_events",void 0),t([ut()],pi.prototype,"_loading",void 0),pi=t([ct("statistics-view")],pi);const mi=[{id:"active",label:"Active",icon:Ct},{id:"all",label:"All Alarms",icon:"M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z"},{id:"history",label:"History",icon:Lt},{id:"noise",label:"Noise",icon:"M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z"},{id:"channels",label:"Channels",icon:"M12 10C10.9 10 10 10.9 10 12S10.9 14 12 14 14 13.1 14 12 13.1 10 12 10M18 12C18 8.7 15.3 6 12 6S6 8.7 6 12C6 14.2 7.2 16.1 9 17.2L10 15.5C8.8 14.8 8 13.5 8 12.1C8 9.9 9.8 8.1 12 8.1S16 9.9 16 12.1C16 13.6 15.2 14.9 14 15.5L15 17.2C16.8 16.2 18 14.2 18 12M12 2C6.5 2 2 6.5 2 12C2 15.7 4 18.9 7 20.6L8 18.9C5.6 17.5 4 14.9 4 12C4 7.6 7.6 4 12 4S20 7.6 20 12C20 15 18.4 17.5 16 18.9L17 20.6C20 18.9 22 15.7 22 12C22 6.5 17.5 2 12 2Z"},{id:"create-edit",label:"Create / Edit",icon:"M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"},{id:"statistics",label:"Statistics",icon:"M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M9 17H7V10H9V17M13 17H11V7H13V17M17 17H15V13H17V17Z"}],ui=["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"];let gi=class extends lt{constructor(){super(...arguments),this._activeTab="active",this._priorityFilter="",this._alarms=[],this._showHelp=!1,this._version="",this._handleNavigate=t=>{const{view:e,alarmId:i}=t.detail;this._activeTab=e,this._editAlarmId=i}}setConfig(t){this._config=t;const e="settings"===t.default_tab?"statistics":t.default_tab;e&&(this._activeTab=e)}getCardSize(){return 12}static getConfigElement(){return document.createElement("scada-alarm-overview-editor")}static getStubConfig(){return{type:"custom:scada-alarm-overview",title:"Alarm Center"}}static{this.styles=[_t,n`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 600px;
        background: var(--primary-background-color, #fafafa);
      }
      .header {
        height: 56px;
        flex: none;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 16px;
        background: var(--card-background-color, #fff);
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        --mdc-icon-size: 24px;
      }
      .header .title {
        font-size: 20px;
        font-weight: 400;
        color: var(--primary-text-color, #212121);
      }
      .status {
        --c: var(--success-color, #43a047);
        background: color-mix(in srgb, var(--c) 16%, transparent);
        color: color-mix(in srgb, var(--c) 70%, var(--primary-text-color, #212121));
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 600;
        --mdc-icon-size: 15px;
      }
      .tab .count {
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 9999px;
        background: var(--secondary-text-color, #727272);
        color: var(--card-background-color, #fff);
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tab.active .count {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
      }
      .content {
        flex: 1;
        overflow-y: auto;
      }
      .help-btn {
        margin-left: auto;
      }
    `]}connectedCallback(){super.connectedCallback(),this.addEventListener("navigate",this._handleNavigate),this._loadAlarms(),this._loadVersion(),this._subscribe()}async _loadVersion(){if(this.hass)try{this._version=await(async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/version"})).version)(this.hass)}catch(t){}}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("navigate",this._handleNavigate),this._unsub?.()}updated(t){t.has("hass")&&!t.get("hass")&&(this._loadAlarms(),this._loadVersion(),this._subscribe())}async _loadAlarms(){this.hass&&(this._alarms=await Pt(this.hass))}async _subscribe(){this.hass&&(this._unsub=await Ot(this.hass,()=>this._loadAlarms()))}_setTab(t){this._activeTab=t,"create-edit"!==t&&(this._editAlarmId=void 0)}get _activeCount(){return this._alarms.filter(t=>ui.includes(t.runtime.state)).length}get _criticalCount(){return this._alarms.filter(t=>ui.includes(t.runtime.state)&&3===t.priority).length}_renderStatus(){const t=this._criticalCount,e=this._activeCount;let i,a,r;return t>0?(i=yt(3),a=wt,r=`${t} critical`):e>0?(i=yt(1),a=xt,r=`${e} active`):(i="var(--success-color, #43a047)",a="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",r="All normal"),j`
      <div class="status" role="status" style=${`--c:${i}`}>
        <ha-svg-icon .path=${a}></ha-svg-icon>${r}
      </div>
    `}render(){if(!this._config)return j``;const t=this._config.show_header??!1,e=this._config.max_width??"",i="active"===this._activeTab||"all"===this._activeTab;return j`
      <div style=${e?`max-width:${e};margin:0 auto`:""}>
      ${t?j`
        <div class="header">
          <ha-svg-icon .path=${Ct} style="color: var(--primary-color)"></ha-svg-icon>
          <span class="title">${this._config.title??"Alarm Center"}</span>
          ${this._renderStatus()}
        </div>
      `:Z}

      <div class="tabs" role="tablist">
        ${mi.map(t=>j`
            <button
              class="tab ${this._activeTab===t.id?"active":""}"
              role="tab"
              aria-selected=${this._activeTab===t.id?"true":"false"}
              @click=${()=>this._setTab(t.id)}
            >
              <ha-svg-icon .path=${t.icon}></ha-svg-icon>
              <span>${t.label}</span>
              ${"active"===t.id&&this._activeCount>0?j`<span class="count">${this._activeCount}</span>`:Z}
            </button>
          `)}
        <button
          class="icon-btn help-btn"
          title="Quick start guide"
          aria-label="Quick start guide"
          @click=${()=>this._showHelp=!0}
        >
          <ha-svg-icon .path=${"M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"}></ha-svg-icon>
        </button>
      </div>

      <div
        class="content"
        @priority-filter=${t=>{this._priorityFilter=t.detail.priority??""}}
      >
        ${i?j`<alarm-kpi-strip
              .alarms=${this._alarms}
              .filterPriority=${this._priorityFilter}
            ></alarm-kpi-strip>`:Z}
        ${this._renderView()}
      </div>
      <help-dialog .open=${this._showHelp} .version=${this._version} @close=${()=>this._showHelp=!1}></help-dialog>
      </div>
    `}_renderView(){switch(this._activeTab){case"active":return j`<active-alarms-view
          .hass=${this.hass}
          .priorityFilter=${this._priorityFilter}
        ></active-alarms-view>`;case"all":return j`<all-alarms-view
          .hass=${this.hass}
          .priorityFilter=${this._priorityFilter}
        ></all-alarms-view>`;case"history":return j`<history-view .hass=${this.hass}></history-view>`;case"noise":return j`<noise-view .hass=${this.hass}></noise-view>`;case"channels":return j`<channels-view .hass=${this.hass}></channels-view>`;case"create-edit":return j`<create-edit-view
          .hass=${this.hass}
          .alarmId=${this._editAlarmId??""}
        ></create-edit-view>`;case"statistics":return j`<statistics-view .hass=${this.hass}></statistics-view>`;default:return j`<active-alarms-view .hass=${this.hass}></active-alarms-view>`}}};t([mt({attribute:!1})],gi.prototype,"hass",void 0),t([ut()],gi.prototype,"_config",void 0),t([ut()],gi.prototype,"_activeTab",void 0),t([ut()],gi.prototype,"_editAlarmId",void 0),t([ut()],gi.prototype,"_priorityFilter",void 0),t([ut()],gi.prototype,"_alarms",void 0),t([ut()],gi.prototype,"_showHelp",void 0),t([ut()],gi.prototype,"_version",void 0),gi=t([ct("scada-alarm-overview")],gi),window.customCards=window.customCards||[],window.customCards.push({type:"scada-alarm-overview",name:"SCADA Alarm Overview",description:"Full Alarm Center with tabs, KPI strip, and management views. Best in panel mode."});export{gi as ScadaAlarmOverview};
