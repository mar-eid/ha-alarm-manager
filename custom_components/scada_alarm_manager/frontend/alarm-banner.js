function t(t,e,i,r){var o,s=arguments.length,a=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,r);else for(var n=t.length-1;n>=0;n--)(o=t[n])&&(a=(s<3?o(a):s>3?o(e,i,a):o(e,i))||a);return s>3&&a&&Object.defineProperty(e,i,a),a}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),o=new WeakMap;let s=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const a=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1],t[0]);return new s(i,t,r)},n=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,m=globalThis,f=m.trustedTypes,g=f?f.emptyScript:"",v=m.reactiveElementPolyfillSupport,b=(t,e)=>t,_={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),y={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=y){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);void 0!==r&&c(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:o}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:r,set(e){const s=r?.call(this);o?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??y}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(n(t))}else void 0!==t&&e.push(n(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,r)=>{if(i)t.adoptedStyleSheets=r.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of r){const r=document.createElement("style"),o=e.litNonce;void 0!==o&&r.setAttribute("nonce",o),r.textContent=i.cssText,t.appendChild(r)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(void 0!==r&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:_).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,r=i._$Eh.get(t);if(void 0!==r&&this._$Em!==r){const t=i.getPropertyOptions(r),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:_;this._$Em=r;const s=o.fromAttribute(e,t.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(t,e,i,r=!1,o){if(void 0!==t){const s=this.constructor;if(!1===r&&(o=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??x)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:o},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==o||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===r&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,r=this[e];!0!==t||this._$AL.has(e)||void 0===r||this.C(e,void 0,i,r)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,v?.({ReactiveElement:$}),(m.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w=globalThis,A=t=>t,k=w.trustedTypes,S=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+C,M=`<${L}>`,z=document,H=()=>z.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,T="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,R=/>/g,V=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),D=/'/g,j=/"/g,F=/^(?:script|style|textarea|title)$/i,I=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),B=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),q=new WeakMap,W=z.createTreeWalker(z,129);function K(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,r=[];let o,s=2===e?"<svg>":3===e?"<math>":"",a=O;for(let e=0;e<i;e++){const i=t[e];let n,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===O?"!--"===l[1]?a=N:void 0!==l[1]?a=R:void 0!==l[2]?(F.test(l[2])&&(o=RegExp("</"+l[2],"g")),a=V):void 0!==l[3]&&(a=V):a===V?">"===l[0]?(a=o??O,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,n=l[1],a=void 0===l[3]?V:'"'===l[3]?j:D):a===j||a===D?a=V:a===N||a===R?a=O:(a=V,o=void 0);const h=a===V&&t[e+1].startsWith("/>")?" ":"";s+=a===O?i+M:c>=0?(r.push(n),i.slice(0,c)+E+i.slice(c)+C+h):i+C+(-2===c?e:h)}return[K(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),r]};class Y{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let o=0,s=0;const a=t.length-1,n=this.parts,[l,c]=J(t,e);if(this.el=Y.createElement(l,i),W.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=W.nextNode())&&n.length<a;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(E)){const e=c[s++],i=r.getAttribute(t).split(C),a=/([.?@])?(.*)/.exec(e);n.push({type:1,index:o,name:a[2],strings:i,ctor:"."===a[1]?et:"?"===a[1]?it:"@"===a[1]?rt:tt}),r.removeAttribute(t)}else t.startsWith(C)&&(n.push({type:6,index:o}),r.removeAttribute(t));if(F.test(r.tagName)){const t=r.textContent.split(C),e=t.length-1;if(e>0){r.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],H()),W.nextNode(),n.push({type:2,index:++o});r.append(t[e],H())}}}else if(8===r.nodeType)if(r.data===L)n.push({type:2,index:o});else{let t=-1;for(;-1!==(t=r.data.indexOf(C,t+1));)n.push({type:7,index:o}),t+=C.length-1}o++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,r){if(e===B)return e;let o=void 0!==r?i._$Co?.[r]:i._$Cl;const s=P(e)?void 0:e._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),void 0===s?o=void 0:(o=new s(t),o._$AT(t,i,r)),void 0!==r?(i._$Co??=[])[r]=o:i._$Cl=o),void 0!==o&&(e=G(t,o._$AS(t,e.values),o,r)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=(t?.creationScope??z).importNode(e,!0);W.currentNode=r;let o=W.nextNode(),s=0,a=0,n=i[0];for(;void 0!==n;){if(s===n.index){let e;2===n.type?e=new X(o,o.nextSibling,this,t):1===n.type?e=new n.ctor(o,n.name,n.strings,this,t):6===n.type&&(e=new ot(o,this,t)),this._$AV.push(e),n=i[++a]}s!==n?.index&&(o=W.nextNode(),s++)}return W.currentNode=z,r}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),P(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==B&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,r="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(e);else{const t=new Q(r,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new Y(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const o of t)r===e.length?e.push(i=new X(this.O(H()),this.O(H()),this,this.options)):i=e[r],i._$AI(o),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,o){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,r){const o=this.strings;let s=!1;if(void 0===o)t=G(this,t,e,0),s=!P(t)||t!==this._$AH&&t!==B,s&&(this._$AH=t);else{const r=t;let a,n;for(t=o[0],a=0;a<o.length-1;a++)n=G(this,r[i+a],e,a),n===B&&(n=this._$AH[a]),s||=!P(n)||n!==this._$AH[a],n===Z?t=Z:t!==Z&&(t+=(n??"")+o[a+1]),this._$AH[a]=n}s&&!r&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}}class rt extends tt{constructor(t,e,i,r,o){super(t,e,i,r,o),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??Z)===B)return;const i=this._$AH,r=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==Z&&(i===Z||r);r&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const st=w.litHtmlPolyfillSupport;st?.(Y,X),(w.litHtmlVersions??=[]).push("3.3.3");const at=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class nt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const r=i?.renderBefore??e;let o=r._$litPart$;if(void 0===o){const t=i?.renderBefore??null;r._$litPart$=o=new X(e.insertBefore(H(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return B}}nt._$litElement$=!0,nt.finalized=!0,at.litElementHydrateSupport?.({LitElement:nt});const lt=at.litElementPolyfillSupport;lt?.({LitElement:nt}),(at.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},dt={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:x},ht=(t=dt,e,i)=>{const{kind:r,metadata:o}=i;let s=globalThis.litPropertyMetadata.get(o);if(void 0===s&&globalThis.litPropertyMetadata.set(o,s=new Map),"setter"===r&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===r){const{name:r}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(r,o,t,!0,i)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===r){const{name:r}=i;return function(i){const o=this[r];e.call(this,i),this.requestUpdate(r,o,t,!0,i)}}throw Error("Unsupported decorator location: "+r)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function pt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const r=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),r?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return pt({...t,state:!0,attribute:!1})}const mt=a`
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
`,ft={0:"var(--info-color, #039be5)",1:"var(--warning-color, #ffa600)",2:"var(--deep-orange-color, #ff6f22)",3:"var(--error-color, #db4437)"},gt=t=>ft[t]??"var(--disabled-text-color, #9e9e9e)";let vt=class extends nt{constructor(){super(...arguments),this._channels=[]}static{this.styles=[mt,a`
      :host { display: block; }
      .row {
        display: flex; gap: 12px; margin-bottom: 12px; align-items: center;
      }
      .row > * { flex: 1; min-width: 0; }
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
      .checkbox-row {
        display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;
      }
      .checkbox-row label {
        display: flex; align-items: center; gap: 4px; font-size: 0.9em; cursor: pointer;
      }
    `]}setConfig(t){this._config=t,this._loadChannels()}async _loadChannels(){if(this.hass)try{this._channels=await(async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/list"})).channels)(this.hass)}catch{}}_update(t,e){const i={...this._config,[t]:e};""!==e&&void 0!==e||delete i[t],this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))}render(){return this._config?I`
      <div class="form-group">
        <label>Title</label>
        <input type="text"
          .value=${this._config.title??"Alarm Center"}
          @input=${t=>this._update("title",t.target.value)} />
      </div>

      <div class="row">
        <div class="form-group">
          <label>Max items shown</label>
          <input type="number" min="1" max="50"
            .value=${String(this._config.max_items??5)}
            @input=${t=>this._update("max_items",parseInt(t.target.value)||5)} />
        </div>
        <div class="form-group">
          <label>Default shelve (min)</label>
          <input type="number" min="1" max="480"
            .value=${String(this._config.default_shelve_minutes??15)}
            @input=${t=>this._update("default_shelve_minutes",parseInt(t.target.value)||15)} />
        </div>
      </div>

      <div class="form-group">
        <label>Filter by area</label>
        <ha-area-picker
          .hass=${this.hass}
          .value=${this._config.filter_area??""}
          @value-changed=${t=>this._update("filter_area",t.detail.value||void 0)}
          .label=${"Area (empty = all)"}
        ></ha-area-picker>
      </div>

      <div class="form-group">
        <label>Show alarm states</label>
        <div class="checkbox-row">
          ${[["active_unacknowledged","Active (Unacked)"],["active_acknowledged","Active (Acked)"],["returned_to_normal_unacknowledged","RTN (Unacked)"],["shelved","Shelved"],["normal","Normal"],["disabled","Disabled"]].map(([t,e])=>{const i=(this._config.filter_states??["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"]).includes(t);return I`<label title="Show alarms in ${e} state">
              <input type="checkbox" .checked=${i}
                @change=${e=>{const i=e.target.checked,r=[...this._config.filter_states??["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"]];if(i&&!r.includes(t)&&r.push(t),!i){const e=r.indexOf(t);e>=0&&r.splice(e,1)}this._update("filter_states",r.length>0?r:void 0)}} />
              ${e}
            </label>`})}
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Filter by priority</label>
          <select .value=${String(this._config.filter_priority??"")}
            @change=${t=>{const e=t.target.value;this._update("filter_priority",e?parseInt(e):void 0)}}>
            <option value="">All priorities</option>
            <option value="0">Info</option>
            <option value="1">Warning</option>
            <option value="2">High</option>
            <option value="3">Critical</option>
          </select>
        </div>
        <div class="form-group">
          <label>Filter by channel</label>
          <select .value=${this._config.filter_channel??""}
            @change=${t=>this._update("filter_channel",t.target.value||void 0)}>
            <option value="">All channels</option>
            ${this._channels.map(t=>I`<option value=${t.id}>${t.name}</option>`)}
          </select>
        </div>
      </div>

      <div class="checkbox-row">
        <label>
          <input type="checkbox"
            .checked=${this._config.show_header??!1}
            @change=${t=>this._update("show_header",t.target.checked)} />
          Show header
        </label>
        <label>
          <input type="checkbox"
            .checked=${this._config.selectable_area??!1}
            @change=${t=>this._update("selectable_area",t.target.checked)} />
          Area dropdown
        </label>
        <label>
          <input type="checkbox"
            .checked=${this._config.show_ack_button??!0}
            @change=${t=>this._update("show_ack_button",t.target.checked)} />
          ACK button
        </label>
        <label>
          <input type="checkbox"
            .checked=${this._config.show_shelve_button??!0}
            @change=${t=>this._update("show_shelve_button",t.target.checked)} />
          Shelve button
        </label>
      </div>
    `:I``}};t([pt({attribute:!1})],vt.prototype,"hass",void 0),t([ut()],vt.prototype,"_config",void 0),t([ut()],vt.prototype,"_channels",void 0),vt=t([ct("scada-alarm-banner-editor")],vt);const bt=t=>t?.locale?.language||t?.language||void 0,_t=t=>{const e=t?.locale?.time_format;return"12"===e||"24"!==e&&void 0},xt=t=>"server"===t?.locale?.time_zone?t?.config?.time_zone:void 0,yt=t=>{if(!t)return null;const e=new Date(t);return isNaN(e.getTime())?null:e},$t=(t,e)=>{const i=yt(e);if(!i)return"—";try{return new Intl.DateTimeFormat(bt(t),{year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",hour12:_t(t),timeZone:xt(t)}).format(i)}catch(t){return i.toLocaleString()}},wt=[["second",60],["minute",60],["hour",24],["day",7],["week",4.35],["month",12],["year",1/0]],At=(t,e)=>e?t?.areas?.[e]?.name??e:"",kt=(t,e)=>{const i=((t,e)=>{if("external"!==e.trigger_type){const o=t?.states?.[e.source_entity_id];if(o){if("function"==typeof t?.formatEntityState)try{const e=t.formatEntityState(o);return{text:e,long:e.length>32}}catch(t){}return{text:(i=o.state,r=o.attributes?.unit_of_measurement??"",null==i||""===i?"—":r?"%"===r?`${i}%`:`${i} ${r}`:String(i)),long:!1}}}var i,r;const o=e.runtime.last_value;return null==o||""===o?{text:"—",long:!1}:{text:String(o),long:"external"===e.trigger_type||String(o).length>32}})(t,e);return i.long?I`<span class="value-text" title=${i.text}>${i.text}</span>`:I`<span class="value">${i.text}</span>`};class St extends nt{constructor(){super(...arguments),this.datetime=null}static{this.styles=a`
    :host {
      white-space: nowrap;
    }
  `}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>this.requestUpdate(),3e4)}disconnectedCallback(){super.disconnectedCallback(),window.clearInterval(this._timer)}render(){return this.datetime?I`<time datetime=${this.datetime} title=${$t(this.hass,this.datetime)}
      >${((t,e)=>{const i=yt(e);if(!i)return"—";let r=(i.getTime()-Date.now())/1e3,o="second";for(const[t,e]of wt){if(o=t,Math.abs(r)<e)break;r/=e}const s="second"===o&&Math.abs(r)<45?0:Math.round(r);try{return new Intl.RelativeTimeFormat(bt(t),{numeric:"auto"}).format(s,o)}catch(i){return $t(t,e)}})(this.hass,this.datetime)}</time
    >`:I`—`}}t([pt({attribute:!1})],St.prototype,"hass",void 0),t([pt()],St.prototype,"datetime",void 0),customElements.get("rel-time")||customElements.define("rel-time",St);const Et=["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"],Ct=["active_unacknowledged","returned_to_normal_unacknowledged"],Lt=[3,2,1,0];let Mt=class extends nt{constructor(){super(...arguments),this._alarms=[],this._areaFilter=""}static{this.styles=[mt,a`
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
        flex: none;
        max-width: 40%;
        font-size: 13.5px;
        text-align: right;
      }
      .row .val .value-text {
        max-width: none;
        font-size: 12.5px;
      }
      .btn {
        height: 30px;
        --mdc-icon-size: 16px;
      }
      .empty {
        text-align: center;
        padding: 20px 16px 28px;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 40px;
      }
      .empty ha-svg-icon {
        color: var(--success-color, #43a047);
      }
      .head .ic,
      .pill {
        background: color-mix(in srgb, var(--c) 16%, transparent);
        color: color-mix(in srgb, var(--c) 75%, var(--primary-text-color, #212121));
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
    `]}setConfig(t){this._config={title:"Alarm Center",max_items:5,show_ack_button:!0,show_shelve_button:!0,default_shelve_minutes:15,...t},this._areaFilter=t.filter_area??""}getCardSize(){return 3}static getConfigElement(){return document.createElement("scada-alarm-banner-editor")}static getStubConfig(){return{type:"custom:scada-alarm-banner",title:"Alarm Center",max_items:6}}firstUpdated(){this._load(),this._subscribe()}disconnectedCallback(){super.disconnectedCallback(),this._unsub?.()}updated(t){t.has("hass")&&!t.get("hass")&&this._load()}async _load(){this.hass&&(this._alarms=await(async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/list"})).alarms)(this.hass))}async _subscribe(){this.hass&&(this._unsub=await(async(t,e)=>t.connection.subscribeMessage(e,{type:"scada_alarm_manager/subscribe"}))(this.hass,()=>this._load()))}async _run(t){try{await t()}catch(t){e=this,i=`Failed: ${(t=>String(t&&"object"==typeof t&&"message"in t?t.message:t))(t)}`,e.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:i},bubbles:!0,composed:!0}))}var e,i;this._load()}_ack(t){this.hass&&this._run(()=>(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/acknowledge",alarm_id:e})})(this.hass,t))}_shelve(t){this.hass&&this._run(()=>(async(t,e,i)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/shelve",alarm_id:e,duration:i})})(this.hass,t,this._config.default_shelve_minutes??15))}get _active(){const t=this._config,e=t.filter_states??Et;return this._alarms.filter(t=>e.includes(t.runtime.state)).filter(t=>!this._areaFilter||t.area===this._areaFilter||At(this.hass,t.area)===this._areaFilter).filter(e=>null==t.filter_priority||String(e.priority)===String(t.filter_priority)).filter(e=>!t.filter_channel||e.channel_id===t.filter_channel).sort((t,e)=>e.priority-t.priority||new Date(e.runtime.triggered_at??0).getTime()-new Date(t.runtime.triggered_at??0).getTime())}render(){if(!this._config)return I``;const t=this._config,e=this._active,i=e.length,r=e.filter(t=>3===t.priority).length,o=e.filter(t=>Ct.includes(t.runtime.state)).length,s=r>0?gt(3):i?gt(1):"var(--success-color, #43a047)",a=Lt.map(t=>({p:t,n:e.filter(e=>e.priority===t).length})).filter(t=>t.n>0),n=[...new Set(this._alarms.filter(t=>Et.includes(t.runtime.state)).map(t=>At(this.hass,t.area)))].filter(Boolean).sort(),l=e.slice(0,t.max_items),c=t.show_header??!1;return I`
      <ha-card>
        ${c?I`
          <div class="head">
            <div class="ic" style=${`--c:${s}`}>
              <ha-svg-icon .path=${"M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z"}></ha-svg-icon>
            </div>
            <div class="t">
              <div class="name">${t.title}</div>
              <div class="sub">
                ${this._areaFilter?`${this._areaFilter} · `:""}
                ${0===i?"All systems normal":`${i} active · ${o} unacknowledged`}
              </div>
            </div>
            ${i>0?I`<span class="pill" style=${`--c:${s}`}>
                <ha-svg-icon .path=${r>0?"M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M13,17H11V15H13V17M13,13H11V7H13V13Z":"M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z"}></ha-svg-icon>${i}
              </span>`:Z}
          </div>
        `:Z}

        ${i>0?I`<div class="bar">
              ${a.map(t=>I`<span style=${`flex:${t.n}; background:${gt(t.p)}`}></span>`)}
            </div>`:Z}

        ${t.selectable_area&&n.length>0?I`<div class="filter">
              <ha-svg-icon .path=${"M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z"}></ha-svg-icon>
              <div class="wrap">
                <select
                  aria-label="Filter by area"
                  .value=${this._areaFilter}
                  @change=${t=>this._areaFilter=t.target.value}
                >
                  <option value="">All areas</option>
                  ${n.map(t=>I`<option value=${t}>${t}</option>`)}
                </select>
                <ha-svg-icon class="chev" .path=${"M7,10L12,15L17,10H7Z"}></ha-svg-icon>
              </div>
              ${this._areaFilter?I`<button class="clear" @click=${()=>this._areaFilter=""}>
                    <ha-svg-icon .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}></ha-svg-icon>Clear
                  </button>`:Z}
            </div>`:Z}

        ${0===i?I`<div class="empty">
              <ha-svg-icon .path=${"M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z"}></ha-svg-icon>
              <div class="lbl">No active alarms</div>
            </div>`:I`
              ${l.map(e=>{const i=Ct.includes(e.runtime.state),r=gt(e.priority);return I`
                  <div class="row">
                    <span class="dot" style=${`background:${r}`}></span>
                    <div class="info">
                      <div class="nm">${e.name}</div>
                      <div class="meta">
                        ${e.area?I`${At(this.hass,e.area)} · `:Z}<rel-time .hass=${this.hass} .datetime=${e.runtime.triggered_at}></rel-time>
                      </div>
                    </div>
                    <span class="val">${kt(this.hass,e)}</span>
                    ${!1!==t.show_ack_button&&i?I`<button class="btn btn-primary btn-small" @click=${()=>this._ack(e.id)}>ACK</button>`:!1!==t.show_shelve_button?I`<button class="btn btn-shelve btn-small" @click=${()=>this._shelve(e.id)} title="Shelve" aria-label=${`Shelve ${e.name}`}>
                          <ha-svg-icon .path=${"M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M15,9H9V11H12.24L9,13.7V16H15V14H11.76L15,11.3V9Z"}></ha-svg-icon>
                        </button>`:Z}
                  </div>
                `})}
              ${i>(t.max_items??5)?I`<div class="more">+ ${i-(t.max_items??5)} more</div>`:Z}
            `}
      </ha-card>
    `}};t([pt({attribute:!1})],Mt.prototype,"hass",void 0),t([ut()],Mt.prototype,"_config",void 0),t([ut()],Mt.prototype,"_alarms",void 0),t([ut()],Mt.prototype,"_areaFilter",void 0),Mt=t([ct("scada-alarm-banner")],Mt),window.customCards=window.customCards||[],window.customCards.push({type:"scada-alarm-banner",name:"SCADA Alarm Banner",description:"Compact monitoring card for the SCADA Alarm Manager."});export{Mt as ScadaAlarmBanner};
