function t(t,e,i,a){var s,o=arguments.length,r=o<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(s=t[n])&&(r=(o<3?s(r):o>3?s(e,i,r):s(e,i))||r);return o>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),s=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const r=t=>new o("string"==typeof t?t:t+"",void 0,a),n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,a)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new o(i,t,a)},l=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return r(e)})(t):t,{is:d,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:p,getOwnPropertySymbols:u,getPrototypeOf:g}=Object,m=globalThis,v=m.trustedTypes,_=v?v.emptyScript:"",f=m.reactiveElementPolyfillSupport,b=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!d(t,e),$={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:x};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),a=this.getPropertyDescriptor(t,i,e);void 0!==a&&c(this.prototype,t,a)}}static getPropertyDescriptor(t,e,i){const{get:a,set:s}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:a,set(e){const o=a?.call(this);s?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...p(t),...u(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(l(t))}else void 0!==t&&e.push(l(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,a)=>{if(i)t.adoptedStyleSheets=a.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of a){const a=document.createElement("style"),s=e.litNonce;void 0!==s&&a.setAttribute("nonce",s),a.textContent=i.cssText,t.appendChild(a)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),a=this.constructor._$Eu(t,i);if(void 0!==a&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(a):this.setAttribute(a,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,a=i._$Eh.get(t);if(void 0!==a&&this._$Em!==a){const t=i.getPropertyOptions(a),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=a;const o=s.fromAttribute(e,t.type);this[a]=o??this._$Ej?.get(a)??o,this._$Em=null}}requestUpdate(t,e,i,a=!1,s){if(void 0!==t){const o=this.constructor;if(!1===a&&(s=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??x)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:a,wrapped:s},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==s||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===a&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,a=this[e];!0!==t||this._$AL.has(e)||void 0===a||this.C(e,void 0,i,a)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[b("elementProperties")]=new Map,w[b("finalized")]=new Map,f?.({ReactiveElement:w}),(m.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const k=globalThis,C=t=>t,A=k.trustedTypes,T=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,E="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+M,S=`<${L}>`,H=document,P=()=>H.createComment(""),V=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,N="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,O=/>/g,D=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,R=/"/g,F=/^(?:script|style|textarea|title)$/i,q=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),Z=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),W=new WeakMap,K=H.createTreeWalker(H,129);function Y(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,a=[];let s,o=2===e?"<svg>":3===e?"<math>":"",r=I;for(let e=0;e<i;e++){const i=t[e];let n,l,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,l=r.exec(i),null!==l);)c=r.lastIndex,r===I?"!--"===l[1]?r=U:void 0!==l[1]?r=O:void 0!==l[2]?(F.test(l[2])&&(s=RegExp("</"+l[2],"g")),r=D):void 0!==l[3]&&(r=D):r===D?">"===l[0]?(r=s??I,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,n=l[1],r=void 0===l[3]?D:'"'===l[3]?R:j):r===R||r===j?r=D:r===U||r===O?r=I:(r=D,s=void 0);const h=r===D&&t[e+1].startsWith("/>")?" ":"";o+=r===I?i+S:d>=0?(a.push(n),i.slice(0,d)+E+i.slice(d)+M+h):i+M+(-2===d?e:h)}return[Y(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),a]};class X{constructor({strings:t,_$litType$:e},i){let a;this.parts=[];let s=0,o=0;const r=t.length-1,n=this.parts,[l,d]=J(t,e);if(this.el=X.createElement(l,i),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(a=K.nextNode())&&n.length<r;){if(1===a.nodeType){if(a.hasAttributes())for(const t of a.getAttributeNames())if(t.endsWith(E)){const e=d[o++],i=a.getAttribute(t).split(M),r=/([.?@])?(.*)/.exec(e);n.push({type:1,index:s,name:r[2],strings:i,ctor:"."===r[1]?it:"?"===r[1]?at:"@"===r[1]?st:et}),a.removeAttribute(t)}else t.startsWith(M)&&(n.push({type:6,index:s}),a.removeAttribute(t));if(F.test(a.tagName)){const t=a.textContent.split(M),e=t.length-1;if(e>0){a.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)a.append(t[i],P()),K.nextNode(),n.push({type:2,index:++s});a.append(t[e],P())}}}else if(8===a.nodeType)if(a.data===L)n.push({type:2,index:s});else{let t=-1;for(;-1!==(t=a.data.indexOf(M,t+1));)n.push({type:7,index:s}),t+=M.length-1}s++}}static createElement(t,e){const i=H.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,a){if(e===Z)return e;let s=void 0!==a?i._$Co?.[a]:i._$Cl;const o=V(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),void 0===o?s=void 0:(s=new o(t),s._$AT(t,i,a)),void 0!==a?(i._$Co??=[])[a]=s:i._$Cl=s),void 0!==s&&(e=G(t,s._$AS(t,e.values),s,a)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,a=(t?.creationScope??H).importNode(e,!0);K.currentNode=a;let s=K.nextNode(),o=0,r=0,n=i[0];for(;void 0!==n;){if(o===n.index){let e;2===n.type?e=new tt(s,s.nextSibling,this,t):1===n.type?e=new n.ctor(s,n.name,n.strings,this,t):6===n.type&&(e=new ot(s,this,t)),this._$AV.push(e),n=i[++r]}o!==n?.index&&(s=K.nextNode(),o++)}return K.currentNode=H,a}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,a){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),V(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==Z&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==B&&V(this._$AH)?this._$AA.nextSibling.data=t:this.T(H.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,a="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=X.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===a)this._$AH.p(e);else{const t=new Q(a,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new X(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,a=0;for(const s of t)a===e.length?e.push(i=new tt(this.O(P()),this.O(P()),this,this.options)):i=e[a],i._$AI(s),a++;a<e.length&&(this._$AR(i&&i._$AB.nextSibling,a),e.length=a)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=C(t).nextSibling;C(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,a,s){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=a,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}_$AI(t,e=this,i,a){const s=this.strings;let o=!1;if(void 0===s)t=G(this,t,e,0),o=!V(t)||t!==this._$AH&&t!==Z,o&&(this._$AH=t);else{const a=t;let r,n;for(t=s[0],r=0;r<s.length-1;r++)n=G(this,a[i+r],e,r),n===Z&&(n=this._$AH[r]),o||=!V(n)||n!==this._$AH[r],n===B?t=B:t!==B&&(t+=(n??"")+s[r+1]),this._$AH[r]=n}o&&!a&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}class at extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==B)}}class st extends et{constructor(t,e,i,a,s){super(t,e,i,a,s),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??B)===Z)return;const i=this._$AH,a=t===B&&i!==B||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==B&&(i===B||a);a&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const rt=k.litHtmlPolyfillSupport;rt?.(X,tt),(k.litHtmlVersions??=[]).push("3.3.3");const nt=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class lt extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const a=i?.renderBefore??e;let s=a._$litPart$;if(void 0===s){const t=i?.renderBefore??null;a._$litPart$=s=new tt(e.insertBefore(P(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}}lt._$litElement$=!0,lt.finalized=!0,nt.litElementHydrateSupport?.({LitElement:lt});const dt=nt.litElementPolyfillSupport;dt?.({LitElement:lt}),(nt.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:x},pt=(t=ht,e,i)=>{const{kind:a,metadata:s}=i;let o=globalThis.litPropertyMetadata.get(s);if(void 0===o&&globalThis.litPropertyMetadata.set(s,o=new Map),"setter"===a&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===a){const{name:a}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(a,s,t,!0,i)},init(e){return void 0!==e&&this.C(a,void 0,t,e),e}}}if("setter"===a){const{name:a}=i;return function(i){const s=this[a];e.call(this,i),this.requestUpdate(a,s,t,!0,i)}}throw Error("Unsupported decorator location: "+a)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const a=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),a?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function gt(t){return ut({...t,state:!0,attribute:!1})}var mt="M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z",vt="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M13,17H11V15H13V17M13,13H11V7H13V13Z",_t="M13 13H11V7H13M11 15H13V17H11M15.73 3H8.27L3 8.27V15.73L8.27 21H15.73L21 15.73V8.27L15.73 3Z",ft="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21M19.75,3.19L18.33,4.61C20.04,6.3 21,8.6 21,11H23C23,8.07 21.84,5.25 19.75,3.19M1,11H3C3,8.6 3.96,6.3 5.67,4.61L4.25,3.19C2.16,5.25 1,8.07 1,11Z",bt="M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M15,9H9V11H12.24L9,13.7V16H15V14H11.76L15,11.3V9Z",yt="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z",xt="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",$t="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z";const wt=n`
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
`,kt=t=>({0:"#2196F3",1:"#FF9800",2:"#FF5722",3:"#F44336"}[t]??"#9E9E9E"),Ct=t=>({normal:"#4CAF50",active_unacknowledged:"#F44336",active_acknowledged:"#FF9800",returned_to_normal_unacknowledged:"#FF9800",shelved:"#9C27B0",disabled:"#9E9E9E"}[t]??"#9E9E9E"),At=async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/list"})).alarms,Tt=async(t,e,i)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/shelve",alarm_id:e,duration:i})},Et=async t=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/list"})).channels,Mt=async(t,e)=>t.connection.subscribeMessage(e,{type:"scada_alarm_manager/subscribe"}),Lt={0:"Info",1:"Warning",2:"High",3:"Critical"},St={normal:"Normal",active_unacknowledged:"Active (Unacked)",active_acknowledged:"Active (Acked)",returned_to_normal_unacknowledged:"RTN (Unacked)",shelved:"Shelved",disabled:"Disabled"},Ht=["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"],Pt=["active_unacknowledged","returned_to_normal_unacknowledged"],Vt=[3,2,1,0],zt={0:$t,1:mt,2:_t,3:vt};let Nt=class extends lt{constructor(){super(...arguments),this.alarms=[],this.filterPriority=""}static{this.styles=[wt,n`
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
    `]}_emit(t){this.dispatchEvent(new CustomEvent("priority-filter",{detail:{priority:t},bubbles:!0,composed:!0}))}_tile(t,e,i,a,s){const o=null!==s,r=o&&this.filterPriority===s;return q`
      <button
        class="tile ${r?"sel":""}"
        style=${`--c:${t}`}
        ?data-clickable=${o}
        @click=${()=>o&&this._emit(this.filterPriority===s?"":s)}
      >
        <div class="ic"><ha-svg-icon .path=${a}></ha-svg-icon></div>
        <div>
          <div class="num ${0===e?"zero":""}">${e}</div>
          <div class="lbl">${i}</div>
        </div>
      </button>
    `}render(){const t=this.alarms.filter(t=>Ht.includes(t.runtime.state)),e=e=>t.filter(t=>t.priority===e).length,i=t.filter(t=>Pt.includes(t.runtime.state)).length,a=this.alarms.filter(t=>"shelved"===t.runtime.state).length,s=t.length,o=Vt.map(t=>({p:t,n:e(t)})).filter(t=>t.n>0);return q`
      <div class="kpis">
        ${this._tile("#5e5e5e",s,"Active alarms",ft,null)}
        ${Vt.map(t=>this._tile(kt(t),e(t),Lt[t],zt[t],String(t)))}
        ${this._tile("#ff9800",i,"Unacknowledged","M23 7V13H21V7M21 15H23V17H21M12 2A2 2 0 0 0 10 4A2 2 0 0 0 10 4.29C7.12 5.14 5 7.82 5 11V17L3 19V20H21V19L19 17V11C19 7.82 16.88 5.14 14 4.29A2 2 0 0 0 14 4A2 2 0 0 0 12 2M10 21A2 2 0 0 0 12 23A2 2 0 0 0 14 21Z",null)}
        ${this._tile("#9c27b0",a,"Shelved",bt,null)}
      </div>
      ${s>0?q`
            <div class="bar-row">
              <div class="bar">
                ${o.map(t=>q`<span
                      style=${`flex:${t.n};background:${kt(t.p)}`}
                      title=${`${t.n} ${Lt[t.p]}`}
                    ></span>`)}
              </div>
              <span class="hint">${i} of ${s} need attention</span>
            </div>
          `:B}
    `}};t([ut({attribute:!1})],Nt.prototype,"alarms",void 0),t([ut()],Nt.prototype,"filterPriority",void 0),Nt=t([ct("alarm-kpi-strip")],Nt);const It={0:$t,1:mt,2:_t,3:vt};let Ut=class extends lt{constructor(){super(...arguments),this.priority=0}static{this.styles=n`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      --mdc-icon-size: 18px;
    }
  `}render(){const t=kt(this.priority),e=Lt[this.priority]??"Unknown";return q`
      <span
        class="badge"
        style="background: color-mix(in srgb, ${t} 18%, transparent); color: ${t}"
        title=${e}
      >
        <ha-svg-icon .path=${It[this.priority]}></ha-svg-icon>
      </span>
    `}};t([ut({type:Number})],Ut.prototype,"priority",void 0),Ut=t([ct("severity-badge")],Ut);let Ot=class extends lt{constructor(){super(...arguments),this.open=!1}static{this.styles=[wt,n`
      .overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 1000;
      }
      .dialog {
        background: var(--card-background-color, white);
        border-radius: 12px;
        width: 90%; max-width: 600px; max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .dialog-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
      }
      .dialog-header h2 { margin: 0; font-size: 1.1em; }
      .close-btn {
        background: none; border: none; font-size: 1.4em;
        cursor: pointer; color: var(--secondary-text-color);
        padding: 4px 8px; border-radius: 4px;
      }
      .close-btn:hover { background: var(--secondary-background-color, #f5f5f5); }
      .dialog-body { padding: 20px; }
      .section { margin-bottom: 20px; }
      .section-title {
        font-size: 0.8em; font-weight: 600; text-transform: uppercase;
        color: var(--secondary-text-color); margin-bottom: 8px;
        letter-spacing: 0.5px;
      }
      .field { display: flex; justify-content: space-between; padding: 6px 0; }
      .field-label { color: var(--secondary-text-color); font-size: 0.9em; }
      .field-value { font-weight: 500; font-size: 0.9em; text-align: right; max-width: 60%; word-break: break-all; }
      .priority-dot {
        display: inline-block; width: 10px; height: 10px;
        border-radius: 50%; margin-right: 6px; vertical-align: middle;
      }
      .description { font-size: 0.9em; color: var(--primary-text-color); padding: 8px 0; }
      .flags { display: flex; gap: 8px; flex-wrap: wrap; }
      .flag {
        padding: 3px 10px; border-radius: 12px; font-size: 0.75em; font-weight: 600;
        background: var(--secondary-background-color, #f5f5f5);
        color: var(--primary-text-color);
      }
      .flag.active { background: var(--primary-color); color: white; }
      .dialog-footer {
        display: flex; gap: 8px; justify-content: flex-end; padding: 12px 20px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }
    `]}_close(){this.open=!1,this.dispatchEvent(new CustomEvent("close"))}_emit(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}render(){if(!this.open||!this.alarm)return q``;const t=this.alarm,e=t.runtime;return q`
      <div class="overlay" @click=${this._close}>
        <div class="dialog" @click=${t=>t.stopPropagation()}>
          <div class="dialog-header">
            <h2>
              <span class="priority-dot" style="background: ${kt(t.priority)}"></span>
              ${t.name}
            </h2>
            <button class="close-btn" @click=${this._close}>&times;</button>
          </div>
          <div class="dialog-body">
            ${t.description?q`<div class="description">${t.description}</div>`:""}

            <div class="section">
              <div class="section-title">State</div>
              <div class="field">
                <span class="field-label">Current State</span>
                <span class="field-value"><span class="badge" style="background: ${Ct(e.state)}">${St[e.state]??e.state}</span></span>
              </div>
              <div class="field">
                <span class="field-label">Last Value</span>
                <span class="field-value">${e.last_value??"-"}</span>
              </div>
              <div class="field">
                <span class="field-label">Triggered At</span>
                <span class="field-value">${e.triggered_at?new Date(e.triggered_at).toLocaleString():"-"}</span>
              </div>
              ${e.acked_at?q`
                <div class="field">
                  <span class="field-label">Acknowledged At</span>
                  <span class="field-value">${new Date(e.acked_at).toLocaleString()}</span>
                </div>
                <div class="field">
                  <span class="field-label">Acknowledged By</span>
                  <span class="field-value">${e.acked_by??"-"}</span>
                </div>
              `:""}
              ${e.shelved_until?q`
                <div class="field">
                  <span class="field-label">Shelved Until</span>
                  <span class="field-value">${new Date(e.shelved_until).toLocaleString()}</span>
                </div>
              `:""}
            </div>

            <div class="section">
              <div class="section-title">Definition</div>
              <div class="field">
                <span class="field-label">Priority</span>
                <span class="field-value">${Lt[t.priority]}</span>
              </div>
              <div class="field">
                <span class="field-label">Source Entity</span>
                <span class="field-value">${t.source_entity_id}</span>
              </div>
              <div class="field">
                <span class="field-label">Trigger Type</span>
                <span class="field-value">${t.trigger_type}</span>
              </div>
              <div class="field">
                <span class="field-label">Trigger Config</span>
                <span class="field-value">${JSON.stringify(t.trigger_config)}</span>
              </div>
              ${t.area?q`<div class="field"><span class="field-label">Area</span><span class="field-value">${t.area}</span></div>`:""}
              ${t.equipment?q`<div class="field"><span class="field-label">Equipment</span><span class="field-value">${t.equipment}</span></div>`:""}
              ${t.tag?q`<div class="field"><span class="field-label">Tag</span><span class="field-value">${t.tag}</span></div>`:""}
              ${t.channel_id?q`<div class="field"><span class="field-label">Channel ID</span><span class="field-value">${t.channel_id}</span></div>`:""}
            </div>

            <div class="section">
              <div class="section-title">Behavior</div>
              <div class="flags">
                <span class="flag ${t.enabled?"active":""}">Enabled</span>
                <span class="flag ${t.latching?"active":""}">Latching</span>
                <span class="flag ${t.ack_required?"active":""}">ACK Required</span>
                <span class="flag ${t.auto_clear?"active":""}">Auto Clear</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Metadata</div>
              <div class="field">
                <span class="field-label">Alarm ID</span>
                <span class="field-value">${t.id}</span>
              </div>
              <div class="field">
                <span class="field-label">Created</span>
                <span class="field-value">${new Date(t.created_at).toLocaleString()}</span>
              </div>
              <div class="field">
                <span class="field-label">Updated</span>
                <span class="field-value">${new Date(t.updated_at).toLocaleString()}</span>
              </div>
            </div>
            <div class="dialog-footer">
              ${"active_unacknowledged"===e.state||"returned_to_normal_unacknowledged"===e.state?q`<button class="btn btn-primary" @click=${()=>{this._emit("ack-alarm",{id:t.id}),this._close()}}>Acknowledge</button>`:""}
              ${"shelved"!==e.state&&"disabled"!==e.state?q`<button class="btn" style="background: var(--alarm-shelved, #9c27b0); color: white;" @click=${()=>{this._emit("shelve-alarm",{alarm:t}),this._close()}}>Shelve</button>`:""}
              <button class="btn" style="background: var(--secondary-background-color, #f5f5f5);" @click=${()=>{this._emit("edit-alarm",{id:t.id}),this._close()}}>Edit</button>
            </div>
          </div>
        </div>
      </div>
    `}};t([ut({attribute:!1})],Ot.prototype,"alarm",void 0),t([ut({type:Boolean})],Ot.prototype,"open",void 0),Ot=t([ct("alarm-detail-dialog")],Ot);const Dt=r("#9c27b0"),jt=[15,30,60,240,480];let Rt=class extends lt{constructor(){super(...arguments),this.open=!1,this.alarmId="",this.alarmName="",this._minutes=15}static{this.styles=[wt,n`
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
        padding: 20px;
      }
      .dialog {
        width: min(440px, 94vw);
        background: var(--card-background-color, #fff);
        border-radius: 16px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.32);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 12px 16px 20px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        --mdc-icon-size: 22px;
        color: var(--alarm-shelved, ${Dt});
      }
      .title {
        flex: 1;
        font-size: 17px;
        font-weight: 500;
        color: var(--primary-text-color, #212121);
      }
      .icon-btn {
        border: none;
        background: none;
        cursor: pointer;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color, #727272);
        --mdc-icon-size: 22px;
      }
      .icon-btn:hover {
        background: var(--secondary-background-color, #f0f0f0);
      }
      .body {
        padding: 20px;
      }
      .body p {
        margin: 0 0 16px;
        font-size: 14px;
        line-height: 1.55;
        color: var(--primary-text-color, #212121);
      }
      .presets {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .chip {
        padding: 8px 14px;
        border-radius: 9999px;
        cursor: pointer;
        font: inherit;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: transparent;
        color: var(--primary-text-color, #212121);
      }
      .chip.sel {
        border-color: ${Dt};
        background: color-mix(in srgb, ${Dt} 14%, transparent);
        color: ${Dt};
      }
      .slider {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .slider input {
        flex: 1;
        accent-color: ${Dt};
      }
      .slider span {
        font-size: 14px;
        font-weight: 600;
        min-width: 64px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .foot {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 0 20px 20px;
      }
      .btn-shelve {
        background: ${Dt};
        color: #fff;
      }
    `]}_fmt(t){return t<60?`${t} min`:t/60+" h"}_close(){this.dispatchEvent(new CustomEvent("dialog-closed"))}_confirm(){this.dispatchEvent(new CustomEvent("shelve-confirm",{detail:{alarmId:this.alarmId,minutes:this._minutes}}))}render(){return this.open?q`
      <div class="overlay" @click=${this._close}>
        <div class="dialog" @click=${t=>t.stopPropagation()}>
          <div class="head">
            <ha-svg-icon .path=${bt}></ha-svg-icon>
            <span class="title">Shelve alarm</span>
            <button class="icon-btn" @click=${this._close}>
              <ha-svg-icon .path=${xt}></ha-svg-icon>
            </button>
          </div>
          <div class="body">
            <p>
              Temporarily suppress <strong>${this.alarmName}</strong>. It won't notify or appear as
              active until the timer expires, then it returns to normal evaluation.
            </p>
            <div class="presets">
              ${jt.map(t=>q`
                  <button class="chip ${this._minutes===t?"sel":""}" @click=${()=>this._minutes=t}>
                    ${this._fmt(t)}
                  </button>
                `)}
            </div>
            <div class="slider">
              <input
                type="range"
                min="5"
                max="480"
                step="5"
                .value=${String(this._minutes)}
                @input=${t=>this._minutes=Number(t.target.value)}
              />
              <span>${this._fmt(this._minutes)}</span>
            </div>
          </div>
          <div class="foot">
            <button class="btn" @click=${this._close}>Cancel</button>
            <button class="btn btn-shelve" @click=${this._confirm}>
              Shelve for ${this._fmt(this._minutes)}
            </button>
          </div>
        </div>
      </div>
    `:q``}};t([ut({type:Boolean})],Rt.prototype,"open",void 0),t([ut()],Rt.prototype,"alarmId",void 0),t([ut()],Rt.prototype,"alarmName",void 0),t([gt()],Rt.prototype,"_minutes",void 0),Rt=t([ct("shelve-dialog")],Rt);const Ft=["active_unacknowledged","returned_to_normal_unacknowledged"];let qt=class extends lt{static{this.styles=[wt,n`
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
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
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
      .value {
        font-size: 22px;
        font-weight: 600;
        line-height: 1;
        font-variant-numeric: tabular-nums;
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
      .state-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 9999px;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .state-badge .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .foot {
        border-top: 1px solid var(--divider-color, #e0e0e0);
        padding-top: 10px;
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
      .btn-shelve {
        background: color-mix(in srgb, #9c27b0 14%, transparent);
        color: #9c27b0;
      }
      /* critical + unacked draws attention */
      :host([flashing]) .card {
        animation: flash 1.1s infinite alternate;
      }
      @keyframes flash {
        from {
          box-shadow: 0 0 0 1px #f44336;
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
    `]}_emit(t,e){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}willUpdate(){const t=this.alarm,e=t&&t.priority>=3&&Ft.includes(t.runtime.state);this.toggleAttribute("flashing",!!e)}render(){const t=this.alarm;if(!t)return q``;const e=kt(t.priority),i=Ct(t.runtime.state),a=Ft.includes(t.runtime.state);return q`
      <div class="card" @click=${()=>this._emit("open-alarm",{alarm:t})}>
        <span class="accent" style=${`background:${e}`}></span>

        <div class="top">
          <severity-badge .priority=${t.priority}></severity-badge>
          <span class="ago">${function(t){if(!t)return"—";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);if(e<60)return"just now";const i=Math.floor(e/60);if(i<60)return`${i}m ago`;const a=Math.floor(i/60);return a<24?`${a}h ago`:`${Math.floor(a/24)}d ago`}(t.runtime.triggered_at)}</span>
        </div>

        <div>
          <div class="name">${t.name}</div>
          <div class="sub">${t.area}${t.equipment?` · ${t.equipment}`:""}</div>
        </div>

        <div class="mid">
          <div style="flex:1; min-width:0;">
            <div class="value" style=${`color:${e}`}>${t.runtime.last_value??"—"}</div>
            <div class="entity">${t.source_entity_id}</div>
          </div>
          <span
            class="state-badge"
            style=${`background:color-mix(in srgb, ${i} 15%, transparent); color:${i}`}
          >
            <span class="dot" style=${`background:${i}`}></span>
            ${St[t.runtime.state]??t.runtime.state}
          </span>
        </div>

        <div class="foot">
          ${a?q`<button
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
    `}};t([ut({attribute:!1})],qt.prototype,"alarm",void 0),qt=t([ct("alarm-tile-card")],qt);const Zt=["active_unacknowledged","returned_to_normal_unacknowledged"];let Bt=class extends lt{constructor(){super(...arguments),this.priorityFilter="",this._alarms=[],this._loading=!0,this._layout="table",this._search="",this._toast="",this._filterPriority="",this._filterState=""}static{this.styles=[wt,n`
      :host { display: block; padding: 16px; }
      .toolbar {
        display: flex; gap: 8px; margin-bottom: 14px; align-items: center; flex-wrap: wrap;
      }
      .count-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 4px 12px; border-radius: 16px; font-size: 0.85em; font-weight: 600;
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
      .search-box .clear {
        cursor: pointer; --mdc-icon-size: 16px; display: flex; align-items: center;
      }
      .ack-all {
        display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 14px;
        border: none; border-radius: 9999px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 600;
        background: var(--primary-color, #03a9f4); color: #fff; --mdc-icon-size: 17px;
        transition: opacity .15s;
      }
      .ack-all:hover { opacity: 0.85; }
      .ack-all:disabled { opacity: 0.4; cursor: default; }
      .layout-toggle {
        display: flex; gap: 2px; margin-left: auto; --mdc-icon-size: 18px;
      }
      .layout-toggle button {
        width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
        border: 1px solid var(--divider-color, #e0e0e0); background: transparent; cursor: pointer;
        color: var(--secondary-text-color); border-radius: 6px;
      }
      .layout-toggle button.active {
        background: var(--primary-color); color: #fff; border-color: var(--primary-color);
      }
      .flashing { animation: flash 1s infinite alternate; }
      @keyframes flash { from { opacity: 1; } to { opacity: 0.5; } }
      @media (prefers-reduced-motion: reduce) { .flashing { animation: none; } }
      .alarm-row-critical { border-left: 3px solid var(--alarm-critical); }
      .alarm-row-high { border-left: 3px solid var(--alarm-high); }
      tbody tr { cursor: pointer; }
      .time-ago { font-size: 0.8em; color: var(--secondary-text-color); }
      .filter-row input, .filter-row select {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
      .cards-grid {
        display: grid; gap: 14px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      .toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 999;
        padding: 10px 20px; border-radius: 9999px; font-size: 13px; font-weight: 500;
        background: var(--primary-text-color, #333); color: var(--card-background-color, #fff);
        box-shadow: 0 4px 16px rgba(0,0,0,.2); animation: toast-in .25s ease;
      }
      @keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
    `]}connectedCallback(){super.connectedCallback(),this._loadAlarms(),this._subscribe()}disconnectedCallback(){super.disconnectedCallback(),this._unsub?.()}async _loadAlarms(){if(this.hass)try{const t=await At(this.hass);this._alarms=t.filter(t=>"active_unacknowledged"===t.runtime.state||"active_acknowledged"===t.runtime.state||"returned_to_normal_unacknowledged"===t.runtime.state)}finally{this._loading=!1}}async _subscribe(){this.hass&&(this._unsub=await Mt(this.hass,()=>this._loadAlarms()))}get _filtered(){return this._alarms.filter(t=>{const e=this.priorityFilter||this._filterPriority;if(e&&String(t.priority)!==e)return!1;if(this._filterState&&t.runtime.state!==this._filterState)return!1;if(this._search){const e=this._search.toLowerCase();if(!t.name.toLowerCase().includes(e)&&!t.area.toLowerCase().includes(e)&&!t.source_entity_id.toLowerCase().includes(e))return!1}return!0}).sort((t,e)=>e.priority-t.priority)}_showToast(t){this._toast=t,setTimeout(()=>this._toast="",2600)}async _ack(t){this.hass&&(await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/acknowledge",alarm_id:e})})(this.hass,t),this._showToast("Alarm acknowledged"),this._loadAlarms())}async _ackAll(){if(!this.hass)return;const t=await(async t=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/acknowledge_all"}))(this.hass);this._showToast(`Acknowledged ${t.acknowledged} alarms`),this._loadAlarms()}_shelve(t){this._shelveTarget=t}render(){if(this._loading)return q`<div class="empty-state">Loading...</div>`;if(0===this._alarms.length)return q`
        <div class="empty-state">
          <div class="icon">&#x2714;</div>
          <div>No active alarms</div>
        </div>
      `;const t=this._filtered,e=this._alarms.filter(t=>Zt.includes(t.runtime.state)).length;return q`
      <div class="toolbar">
        <span class="count-badge" style="background: ${kt(3)}22; color: ${kt(3)}">
          ${this._alarms.length} active
        </span>
        ${t.length!==this._alarms.length?q`<span style="font-size: 0.85em; color: var(--secondary-text-color);">(${t.length} shown)</span>`:""}

        <div class="search-box">
          <ha-svg-icon .path=${"M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"}></ha-svg-icon>
          <input type="text" placeholder="Search alarms..."
            .value=${this._search}
            @input=${t=>this._search=t.target.value} />
          ${this._search?q`<span class="clear" @click=${()=>this._search=""}><ha-svg-icon .path=${xt}></ha-svg-icon></span>`:B}
        </div>

        <button class="ack-all" ?disabled=${0===e} @click=${this._ackAll} title="Acknowledge all unacknowledged alarms">
          <ha-svg-icon .path=${"M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z"}></ha-svg-icon>
          ACK All${e>0?` (${e})`:""}
        </button>

        <div class="layout-toggle">
          <button class="${"table"===this._layout?"active":""}" @click=${()=>this._layout="table"} title="Table view">
            <ha-svg-icon .path=${"M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"}></ha-svg-icon>
          </button>
          <button class="${"cards"===this._layout?"active":""}" @click=${()=>this._layout="cards"} title="Cards view">
            <ha-svg-icon .path=${"M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"}></ha-svg-icon>
          </button>
        </div>
      </div>

      ${"cards"===this._layout?q`
        <div class="cards-grid">
          ${t.map(t=>q`
            <alarm-tile-card
              .alarm=${t}
              @ack-alarm=${t=>this._ack(t.detail.id)}
              @shelve-alarm=${t=>this._shelve(t.detail.alarm)}
              @open-alarm=${t=>this._detailAlarm=t.detail.alarm}>
            </alarm-tile-card>`)}
        </div>
      `:q`
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
                <select @change=${t=>this._filterPriority=t.target.value}>
                  <option value="">All</option>
                  ${[0,1,2,3].map(t=>q`<option value=${t}>${Lt[t]}</option>`)}
                </select>
              </th>
              <th></th>
              <th>
                <select @change=${t=>this._filterState=t.target.value}>
                  <option value="">All</option>
                  ${["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"].map(t=>q`<option value=${t}>${St[t]}</option>`)}
                </select>
              </th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${t.map(t=>{const e=t.priority>=3?"alarm-row-critical":t.priority>=2?"alarm-row-high":"",i=Zt.includes(t.runtime.state);return q`
                <tr class="${e} ${t.priority>=3&&i?"flashing":""}" @click=${()=>this._detailAlarm=t}>
                  <td><severity-badge .priority=${t.priority}></severity-badge></td>
                  <td><strong>${t.name}</strong>${t.area?q`<br><span class="time-ago">${t.area}</span>`:""}</td>
                  <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${Ct(t.runtime.state)}" title="${St[t.runtime.state]??t.runtime.state}"></span></td>
                  <td style="font-size:0.85em">${t.source_entity_id}</td>
                  <td>${t.runtime.last_value??"-"}</td>
                  <td class="time-ago">${t.runtime.triggered_at?new Date(t.runtime.triggered_at).toLocaleString():"-"}</td>
                  <td class="actions">
                    ${i?q`<button class="btn btn-primary btn-small" @click=${e=>{e.stopPropagation(),this._ack(t.id)}}>ACK</button>`:""}
                    <button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${e=>{e.stopPropagation(),this._shelve(t)}}>Shelve</button>
                  </td>
                </tr>
              `})}
          </tbody>
        </table>
      `}

      <alarm-detail-dialog
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${()=>this._detailAlarm=void 0}
      ></alarm-detail-dialog>

      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id??""}
        .alarmName=${this._shelveTarget?.name??""}
        @dialog-closed=${()=>this._shelveTarget=void 0}
        @shelve-confirm=${async t=>{await Tt(this.hass,t.detail.alarmId,t.detail.minutes),this._shelveTarget=void 0,this._showToast("Alarm shelved"),this._loadAlarms()}}
      ></shelve-dialog>

      ${this._toast?q`<div class="toast">${this._toast}</div>`:B}
    `}};t([ut({attribute:!1})],Bt.prototype,"hass",void 0),t([ut()],Bt.prototype,"priorityFilter",void 0),t([gt()],Bt.prototype,"_alarms",void 0),t([gt()],Bt.prototype,"_loading",void 0),t([gt()],Bt.prototype,"_detailAlarm",void 0),t([gt()],Bt.prototype,"_shelveTarget",void 0),t([gt()],Bt.prototype,"_layout",void 0),t([gt()],Bt.prototype,"_search",void 0),t([gt()],Bt.prototype,"_toast",void 0),t([gt()],Bt.prototype,"_filterPriority",void 0),t([gt()],Bt.prototype,"_filterState",void 0),Bt=t([ct("active-alarms-view")],Bt);let Wt=class extends lt{constructor(){super(...arguments),this.priorityFilter="",this._alarms=[],this._channels=[],this._loading=!0,this._filterPriority="",this._filterName="",this._filterState="",this._filterEntity="",this._filterTrigger="",this._filterChannel="",this._filterEnabled="",this._toast=""}static{this.styles=[wt,n`
      :host { display: block; padding: 16px; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .filter-row input, .filter-row select {
        width: 100%; padding: 4px 6px; font-size: 0.8em;
        border: 1px solid var(--divider-color, #ccc); border-radius: 4px;
        background: var(--card-background-color, white);
        color: var(--primary-text-color, #333);
      }
      .test-ok { color: var(--alarm-normal, #4CAF50); font-size: 0.8em; }
      tbody tr { cursor: pointer; }
      .overlay {
        position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,.45); padding: 20px;
      }
      .confirm-dialog {
        background: var(--card-background-color, #fff); border-radius: 12px; padding: 24px;
        box-shadow: 0 16px 48px rgba(0,0,0,.3); max-width: 400px; width: 100%;
      }
      .confirm-dialog h3 { margin: 0 0 8px; font-size: 1.1em; }
      .confirm-dialog p { margin: 0 0 20px; font-size: 0.9em; color: var(--primary-text-color); line-height: 1.5; }
      .confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
      .toast {
        position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 999;
        padding: 10px 20px; border-radius: 9999px; font-size: 13px; font-weight: 500;
        background: var(--primary-text-color, #333); color: var(--card-background-color, #fff);
        box-shadow: 0 4px 16px rgba(0,0,0,.2); animation: toast-in .25s ease;
      }
      @keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
    `]}connectedCallback(){super.connectedCallback(),this._load()}async _load(){if(this.hass)try{const[t,e]=await Promise.all([At(this.hass),Et(this.hass)]);this._alarms=t,this._channels=e}finally{this._loading=!1}}_getChannelName(t){if(!t)return"-";const e=this._channels.find(e=>e.id===t);return e?e.name:t}get _filtered(){return this._alarms.filter(t=>{const e=this.priorityFilter||this._filterPriority;if(e&&String(t.priority)!==e)return!1;if(this._filterName&&!t.name.toLowerCase().includes(this._filterName.toLowerCase()))return!1;if(this._filterState&&t.runtime.state!==this._filterState)return!1;if(this._filterEntity&&!t.source_entity_id.toLowerCase().includes(this._filterEntity.toLowerCase()))return!1;if(this._filterTrigger&&t.trigger_type!==this._filterTrigger)return!1;if(this._filterChannel){if(!this._getChannelName(t.channel_id).toLowerCase().includes(this._filterChannel.toLowerCase()))return!1}return!("yes"===this._filterEnabled&&!t.enabled)&&("no"!==this._filterEnabled||!t.enabled)})}_showToast(t){this._toast=t,setTimeout(()=>this._toast="",2600)}_confirmDelete(t){this._deleteTarget=t}async _doDelete(){if(!this.hass||!this._deleteTarget)return;const t=this._deleteTarget.name;await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/delete",alarm_id:e})})(this.hass,this._deleteTarget.id),this._deleteTarget=void 0,this._showToast(`Deleted: ${t}`),this._load()}_edit(t){this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"create-edit",alarmId:t},bubbles:!0,composed:!0}))}async _testNotification(t){this.hass&&t.channel_id&&await this.hass.callService("scada_alarm_manager","test_notification",{channel_id:t.channel_id})}_shelve(t){this._shelveTarget=t}async _unshelve(t){this.hass&&(await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/unshelve",alarm_id:e})})(this.hass,t),this._load())}render(){if(this._loading)return q`<div class="empty-state">Loading...</div>`;const t=this._filtered;return q`
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
                ${[0,1,2,3].map(t=>q`<option value=${t}>${Lt[t]}</option>`)}
              </select>
            </th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterName} @input=${t=>this._filterName=t.target.value} /></th>
            <th>
              <select @change=${t=>this._filterState=t.target.value}>
                <option value="">All</option>
                ${Object.entries(St).map(([t,e])=>q`<option value=${t}>${e}</option>`)}
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
          ${t.map(t=>q`
              <tr @click=${()=>this._detailAlarm=t}>
                <td><severity-badge .priority=${t.priority}></severity-badge></td>
                <td>
                  <strong>${t.name}</strong>
                  ${"shelved"===t.runtime.state&&t.runtime.shelved_until?q`<br><span style="font-size: 0.75em; color: var(--secondary-text-color);">Until ${new Date(t.runtime.shelved_until).toLocaleString()}</span>`:""}
                </td>
                <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${Ct(t.runtime.state)}" title="${St[t.runtime.state]??t.runtime.state}"></span></td>
                <td>${t.source_entity_id}</td>
                <td>${t.trigger_type}</td>
                <td>${this._getChannelName(t.channel_id)}</td>
                <td>${t.enabled?"Yes":"No"}</td>
                <td class="actions">
                  ${"shelved"===t.runtime.state?q`<button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${e=>{e.stopPropagation(),this._unshelve(t.id)}}>Unshelve</button>`:"disabled"!==t.runtime.state?q`<button class="btn btn-small" style="background: var(--alarm-shelved); color: white;" @click=${e=>{e.stopPropagation(),this._shelve(t)}}>Shelve</button>`:""}
                  ${t.channel_id?q`<button class="btn btn-small" style="background: #607D8B; color: white;" @click=${e=>{e.stopPropagation(),this._testNotification(t)}} title="Test notification">Test</button>`:""}
                  <button class="btn btn-small btn-primary" @click=${e=>{e.stopPropagation(),this._edit(t.id)}}>Edit</button>
                  <button class="btn btn-small btn-danger" @click=${e=>{e.stopPropagation(),this._confirmDelete(t)}}>Delete</button>
                </td>
              </tr>
            `)}
        </tbody>
      </table>
      <alarm-detail-dialog
        .alarm=${this._detailAlarm}
        .open=${!!this._detailAlarm}
        @close=${()=>this._detailAlarm=void 0}
      ></alarm-detail-dialog>

      <shelve-dialog
        .open=${!!this._shelveTarget}
        .alarmId=${this._shelveTarget?.id??""}
        .alarmName=${this._shelveTarget?.name??""}
        @dialog-closed=${()=>this._shelveTarget=void 0}
        @shelve-confirm=${async t=>{await Tt(this.hass,t.detail.alarmId,t.detail.minutes),this._shelveTarget=void 0,this._showToast("Alarm shelved"),this._load()}}
      ></shelve-dialog>

      ${this._deleteTarget?q`
        <div class="overlay" @click=${()=>this._deleteTarget=void 0}>
          <div class="confirm-dialog" @click=${t=>t.stopPropagation()}>
            <h3>Delete alarm</h3>
            <p>Permanently delete <strong>${this._deleteTarget.name}</strong>?</p>
            <div class="confirm-actions">
              <button class="btn" style="background: var(--secondary-background-color)" @click=${()=>this._deleteTarget=void 0}>Cancel</button>
              <button class="btn btn-danger" @click=${this._doDelete}>Delete</button>
            </div>
          </div>
        </div>
      `:""}

      ${this._toast?q`<div class="toast">${this._toast}</div>`:""}
    `}};t([ut({attribute:!1})],Wt.prototype,"hass",void 0),t([ut()],Wt.prototype,"priorityFilter",void 0),t([gt()],Wt.prototype,"_alarms",void 0),t([gt()],Wt.prototype,"_channels",void 0),t([gt()],Wt.prototype,"_loading",void 0),t([gt()],Wt.prototype,"_detailAlarm",void 0),t([gt()],Wt.prototype,"_shelveTarget",void 0),t([gt()],Wt.prototype,"_filterPriority",void 0),t([gt()],Wt.prototype,"_filterName",void 0),t([gt()],Wt.prototype,"_filterState",void 0),t([gt()],Wt.prototype,"_filterEntity",void 0),t([gt()],Wt.prototype,"_filterTrigger",void 0),t([gt()],Wt.prototype,"_filterChannel",void 0),t([gt()],Wt.prototype,"_filterEnabled",void 0),t([gt()],Wt.prototype,"_deleteTarget",void 0),t([gt()],Wt.prototype,"_toast",void 0),Wt=t([ct("all-alarms-view")],Wt);let Kt=class extends lt{constructor(){super(...arguments),this._events=[],this._loading=!0,this._offset=0,this._limit=50,this._filterAlarm="",this._filterEvent="",this._filterUser=""}static{this.styles=[wt,n`
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
    `]}connectedCallback(){super.connectedCallback(),this._loadEvents()}async _loadEvents(){if(this.hass)try{this._events=await(async(t,e={})=>(await t.connection.sendMessagePromise({type:"scada_alarm_manager/event/list",...e})).events)(this.hass,{limit:this._limit,offset:this._offset})}finally{this._loading=!1}}get _filtered(){return this._events.filter(t=>!(this._filterAlarm&&!t.alarm_name.toLowerCase().includes(this._filterAlarm.toLowerCase()))&&((!this._filterEvent||t.event_type===this._filterEvent)&&!(this._filterUser&&!(t.user??"").toLowerCase().includes(this._filterUser.toLowerCase()))))}_nextPage(){this._offset+=this._limit,this._loading=!0,this._loadEvents()}_prevPage(){this._offset=Math.max(0,this._offset-this._limit),this._loading=!0,this._loadEvents()}render(){if(this._loading)return q`<div class="empty-state">Loading...</div>`;if(0===this._events.length&&0===this._offset)return q`<div class="empty-state">No alarm events recorded yet.</div>`;const t=[...new Set(this._events.map(t=>t.event_type))].sort(),e=this._filtered;return q`
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
                ${t.map(t=>q`<option value=${t}>${t}</option>`)}
              </select>
            </th>
            <th></th>
            <th></th>
            <th><input type="text" placeholder="Filter..." .value=${this._filterUser} @input=${t=>this._filterUser=t.target.value} /></th>
          </tr>
        </thead>
        <tbody>
          ${e.map(t=>q`
              <tr>
                <td>${new Date(t.timestamp).toLocaleString()}</td>
                <td><strong>${t.alarm_name}</strong></td>
                <td><span class="event-type">${t.event_type}</span></td>
                <td>${t.old_state?q`<span class="badge" style="background: ${Ct(t.old_state)}">${St[t.old_state]??t.old_state}</span>`:"-"}</td>
                <td>${t.new_state?q`<span class="badge" style="background: ${Ct(t.new_state)}">${St[t.new_state]??t.new_state}</span>`:"-"}</td>
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
    `}};t([ut({attribute:!1})],Kt.prototype,"hass",void 0),t([gt()],Kt.prototype,"_events",void 0),t([gt()],Kt.prototype,"_loading",void 0),t([gt()],Kt.prototype,"_offset",void 0),t([gt()],Kt.prototype,"_filterAlarm",void 0),t([gt()],Kt.prototype,"_filterEvent",void 0),t([gt()],Kt.prototype,"_filterUser",void 0),Kt=t([ct("history-view")],Kt);const Yt=[{id:"notify.mobile_app_marius",label:"Marius — phone",path:yt},{id:"notify.mobile_app_anna",label:"Anna — phone",path:yt},{id:"notify.mobile_app_security",label:"Security — phone",path:"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z"},{id:"notify.facilities_team",label:"Facilities team",path:"M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"},{id:"notify.it_oncall",label:"IT on-call",path:"M12,15C7.58,15 4,16.79 4,19V21H20V19C20,16.79 16.42,15 12,15M8,9A4,4 0 0,0 12,13A4,4 0 0,0 16,9M11.5,2C11.2,2 11,2.21 11,2.5V5.5H10V3C10,3 7.75,3.86 7.75,6.75C7.75,6.75 7,6.89 7,8H17C16.95,6.89 16.25,6.75 16.25,6.75C16.25,3.86 14,3 14,3V5.5H13V2.5C13,2.21 12.81,2 12.5,2H11.5Z"},{id:"notify.persistent",label:"Persistent notification",path:"M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"},{id:"notify.telegram_ops",label:"Telegram — Ops",path:"M2,21L23,12L2,3V10L17,12L2,14V21Z"},{id:"notify.email_admin",label:"Email — admin",path:"M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"},{id:"notify.alexa_everywhere",label:"Alexa — announce",path:"M12,8H4A2,2 0 0,0 2,10V14A2,2 0 0,0 4,16H5V20A1,1 0 0,0 6,21H8A1,1 0 0,0 9,20V16H12L17,20V4L12,8M21.5,12C21.5,13.71 20.54,15.26 19,16V8C20.53,8.75 21.5,10.3 21.5,12Z"}];let Jt=class extends lt{constructor(){super(...arguments),this.value=[],this.targets=Yt,this._open=!1}static{this.styles=[wt,n`
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
        background: rgba(127, 127, 127, 0.08);
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
    `]}connectedCallback(){super.connectedCallback(),this._onDoc=this._onDoc.bind(this),document.addEventListener("mousedown",this._onDoc)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("mousedown",this._onDoc)}_onDoc(t){t.composedPath().includes(this)||(this._open=!1)}_meta(t){return this.targets.find(e=>e.id===t)??{id:t,label:t,path:"M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z"}}_emit(t){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t}}))}_add(t){this._emit([...this.value,t])}_remove(t){this._emit(this.value.filter(e=>e!==t))}render(){const t=this.targets.filter(t=>!this.value.includes(t.id));return q`
      <div class="box">
        ${0===this.value.length?q`<span class="empty">No targets — alarms log to history only</span>`:B}
        ${this.value.map(t=>{const e=this._meta(t);return q`
            <span class="chip">
              <ha-svg-icon .path=${e.path}></ha-svg-icon>
              ${e.label}
              <span class="x" title="Remove" @click=${()=>this._remove(t)}>
                <ha-svg-icon .path=${xt}></ha-svg-icon>
              </span>
            </span>
          `})}
        <button class="add" ?disabled=${0===t.length} @click=${()=>this._open=!this._open}>
          <ha-svg-icon .path=${"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"}></ha-svg-icon>Add target
        </button>
      </div>
      ${this._open&&t.length>0?q`
            <div class="menu">
              ${t.map(e=>q`
                  <div
                    class="opt"
                    @click=${()=>{this._add(e.id),1===t.length&&(this._open=!1)}}
                  >
                    <ha-svg-icon .path=${e.path}></ha-svg-icon>
                    <span class="lbl">${e.label}</span>
                    <span class="id">${e.id}</span>
                  </div>
                `)}
            </div>
          `:B}
    `}};t([ut({attribute:!1})],Jt.prototype,"value",void 0),t([ut({attribute:!1})],Jt.prototype,"targets",void 0),t([gt()],Jt.prototype,"_open",void 0),Jt=t([ct("notify-target-picker")],Jt);let Xt=class extends lt{constructor(){super(...arguments),this._channels=[],this._loading=!0,this._editing=null,this._formName="",this._formTargets=[],this._formMinPriority=0,this._formPersistent=!0,this._formMobile=!0,this._formCritical=!1,this._filterName=""}static{this.styles=[wt,n`
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
    `]}connectedCallback(){super.connectedCallback(),this._loadChannels()}async _loadChannels(){if(this.hass)try{this._channels=await Et(this.hass)}finally{this._loading=!1}}_startCreate(){this._editing={},this._formName="",this._formTargets=[],this._formMinPriority=0,this._formPersistent=!0,this._formMobile=!0,this._formCritical=!1}_startEdit(t){this._editing=t,this._formName=t.name,this._formTargets=[...t.notification_targets],this._formMinPriority=t.min_priority,this._formPersistent=t.persistent_notification,this._formMobile=t.mobile_push,this._formCritical=t.critical_notification}async _save(){if(!this.hass||!this._formName.trim())return;const t={name:this._formName.trim(),notification_targets:this._formTargets,min_priority:this._formMinPriority,persistent_notification:this._formPersistent,mobile_push:this._formMobile,critical_notification:this._formCritical};this._editing?.id?await(async(t,e,i)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/update",channel_id:e,...i}))(this.hass,this._editing.id,t):await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/create",...e}))(this.hass,t),this._editing=null,this._loadChannels()}async _delete(t){this.hass&&confirm("Delete this channel?")&&(await(async(t,e)=>{await t.connection.sendMessagePromise({type:"scada_alarm_manager/channel/delete",channel_id:e})})(this.hass,t),this._loadChannels())}render(){return this._loading?q`<div class="empty-state">Loading...</div>`:q`
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
          ${this._channels.filter(t=>!this._filterName||t.name.toLowerCase().includes(this._filterName.toLowerCase())).map(t=>q`
              <tr>
                <td><strong>${t.name}</strong></td>
                <td>${t.notification_targets.join(", ")||"-"}</td>
                <td>${Lt[t.min_priority]??"Info"}</td>
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
    `}_renderForm(){return q`
      <div class="form-card">
        <h3>${this._editing?.id?"Edit Channel":"New Channel"}</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Name</label>
            <input type="text" .value=${this._formName} @input=${t=>this._formName=t.target.value} />
          </div>
        </div>
        <div class="form-group">
          <label>Notification Targets</label>
          <notify-target-picker
            .value=${this._formTargets}
            @value-changed=${t=>this._formTargets=t.detail.value}
          ></notify-target-picker>
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
    `}};t([ut({attribute:!1})],Xt.prototype,"hass",void 0),t([gt()],Xt.prototype,"_channels",void 0),t([gt()],Xt.prototype,"_loading",void 0),t([gt()],Xt.prototype,"_editing",void 0),t([gt()],Xt.prototype,"_formName",void 0),t([gt()],Xt.prototype,"_formTargets",void 0),t([gt()],Xt.prototype,"_formMinPriority",void 0),t([gt()],Xt.prototype,"_formPersistent",void 0),t([gt()],Xt.prototype,"_formMobile",void 0),t([gt()],Xt.prototype,"_formCritical",void 0),t([gt()],Xt.prototype,"_filterName",void 0),Xt=t([ct("channels-view")],Xt);let Gt=class extends lt{constructor(){super(...arguments),this._channels=[],this._loading=!0,this._saving=!1,this._name="",this._description="",this._sourceEntityId="",this._triggerType="digital",this._priority=1,this._area="",this._equipment="",this._tag="",this._channelId=null,this._enabled=!0,this._latching=!1,this._ackRequired=!0,this._autoClear=!0,this._conditionTemplate="",this._conditionMode="none",this._conditionEntity="",this._notificationTitleTemplate="",this._notificationTextTemplate="",this._conditionState="",this._analogOperator=">",this._analogThreshold="0",this._digitalTargetState="on",this._customMatchValues=""}static{this.styles=[wt,n`
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
    `]}connectedCallback(){super.connectedCallback(),this._load()}updated(t){t.has("alarmId")&&this._load()}async _load(){if(this.hass){this._loading=!0;try{if(this._channels=await Et(this.hass),this.alarmId){const t=await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/get",alarm_id:e}))(this.hass,this.alarmId);this._name=t.name,this._description=t.description,this._sourceEntityId=t.source_entity_id,this._triggerType=t.trigger_type,this._priority=t.priority,this._area=t.area,this._equipment=t.equipment,this._tag=t.tag,this._channelId=t.channel_id,this._enabled=t.enabled,this._latching=t.latching,this._ackRequired=t.ack_required,this._autoClear=t.auto_clear,this._conditionTemplate=t.condition_template||"";const e=(t.condition_template||"").match(/\{\{\s*is_state\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*\}\}/);e?(this._conditionMode="simple",this._conditionEntity=e[1],this._conditionState=e[2]):t.condition_template?this._conditionMode="template":this._conditionMode="none",this._notificationTitleTemplate=t.notification_title_template||"",this._notificationTextTemplate=t.notification_text_template||"","analog"===t.trigger_type?(this._analogOperator=t.trigger_config.operator??">",this._analogThreshold=String(t.trigger_config.threshold??0)):"digital"===t.trigger_type?this._digitalTargetState=t.trigger_config.target_state??"on":"custom_state"===t.trigger_type&&(this._customMatchValues=(t.trigger_config.match_values??[]).join(", "))}else this._resetForm()}finally{this._loading=!1}}}_resetForm(){this._name="",this._description="",this._sourceEntityId="",this._triggerType="digital",this._priority=1,this._area="",this._equipment="",this._tag="",this._channelId=null,this._enabled=!0,this._latching=!1,this._ackRequired=!0,this._autoClear=!0,this._conditionTemplate="",this._conditionMode="none",this._conditionEntity="",this._conditionState="",this._notificationTitleTemplate="",this._notificationTextTemplate="",this._analogOperator=">",this._analogThreshold="0",this._digitalTargetState="on",this._customMatchValues=""}_buildTriggerConfig(){switch(this._triggerType){case"analog":return{operator:this._analogOperator,threshold:parseFloat(this._analogThreshold)};case"digital":return{target_state:this._digitalTargetState};case"custom_state":return{match_values:this._customMatchValues.split(",").map(t=>t.trim()).filter(Boolean)}}}async _save(){if(this.hass&&this._name.trim()&&this._sourceEntityId.trim()){this._saving=!0;try{const t={name:this._name.trim(),description:this._description,source_entity_id:this._sourceEntityId.trim(),trigger_type:this._triggerType,trigger_config:this._buildTriggerConfig(),priority:this._priority,area:this._area,equipment:this._equipment,tag:this._tag,channel_id:this._channelId,enabled:this._enabled,latching:this._latching,ack_required:this._ackRequired,auto_clear:this._autoClear,condition_template:"simple"===this._conditionMode&&this._conditionEntity?`{{ is_state('${this._conditionEntity}', '${this._conditionState}') }}`:"template"===this._conditionMode&&this._conditionTemplate||null,notification_title_template:this._notificationTitleTemplate||null,notification_text_template:this._notificationTextTemplate||null};this.alarmId?await(async(t,e,i)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/update",alarm_id:e,...i}))(this.hass,this.alarmId,t):(await(async(t,e)=>t.connection.sendMessagePromise({type:"scada_alarm_manager/alarm/create",...e}))(this.hass,t),this._resetForm()),this.dispatchEvent(new CustomEvent("navigate",{detail:{view:"all"},bubbles:!0,composed:!0}))}finally{this._saving=!1}}}render(){return this._loading?q`<div class="empty-state">Loading...</div>`:q`
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
              ${this._channels.map(t=>q`<option value=${t.id}>${t.name}</option>`)}
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

          ${"analog"===this._triggerType?q`
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

          ${"digital"===this._triggerType?q`
            <div class="form-group">
              <label>Target State</label>
              <input type="text" .value=${this._digitalTargetState} @input=${t=>this._digitalTargetState=t.target.value} placeholder="on" />
            </div>
          `:""}

          ${"custom_state"===this._triggerType?q`
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
          <div class="form-group">
            <label>Condition (optional — alarm only fires when condition is true)</label>
            <div style="display:flex;gap:4px;margin-bottom:8px">
              ${["none","simple","template"].map(t=>q`
                <button class="btn btn-small" style=${this._conditionMode===t?"background:var(--primary-color);color:#fff":"background:var(--secondary-background-color)"}
                  @click=${()=>this._conditionMode=t}>
                  ${"none"===t?"None":"simple"===t?"Entity state":"Template"}
                </button>
              `)}
            </div>
            ${"simple"===this._conditionMode?q`
              <div class="form-row">
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${this._conditionEntity}
                  @value-changed=${t=>this._conditionEntity=t.detail.value}
                  allow-custom-entity
                  .label=${"Condition entity"}
                ></ha-entity-picker>
                <div class="form-group">
                  <label>Expected state</label>
                  <input type="text" .value=${this._conditionState} @input=${t=>this._conditionState=t.target.value} placeholder="home, on, true, etc." />
                </div>
              </div>
            `:"template"===this._conditionMode?q`
              <textarea rows="2" .value=${this._conditionTemplate} @input=${t=>this._conditionTemplate=t.target.value} placeholder="e.g. {{ is_state('device_tracker.car', 'home') }}"></textarea>
            `:""}
          </div>
        </div>

        <div class="section">
          <h3>Notification Templates (optional Jinja2)</h3>
          <div class="form-group">
            <label>Title template</label>
            <input type="text" .value=${this._notificationTitleTemplate} @input=${t=>this._notificationTitleTemplate=t.target.value} placeholder="Default: [Priority] Alarm Name" />
          </div>
          <div class="form-group">
            <label>Message template</label>
            <textarea rows="2" .value=${this._notificationTextTemplate} @input=${t=>this._notificationTextTemplate=t.target.value} placeholder="e.g. {{ name }} har lite batteri, kun {{ value }}{{ unit }} igjen"></textarea>
          </div>
          <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: -8px;">
            Variables: {{ name }}, {{ value }}, {{ unit }}, {{ area }}, {{ equipment }}, {{ friendly_name }}, {{ threshold }}, {{ operator }}, {{ priority }}
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
    `}};t([ut({attribute:!1})],Gt.prototype,"hass",void 0),t([ut()],Gt.prototype,"alarmId",void 0),t([gt()],Gt.prototype,"_channels",void 0),t([gt()],Gt.prototype,"_loading",void 0),t([gt()],Gt.prototype,"_saving",void 0),t([gt()],Gt.prototype,"_name",void 0),t([gt()],Gt.prototype,"_description",void 0),t([gt()],Gt.prototype,"_sourceEntityId",void 0),t([gt()],Gt.prototype,"_triggerType",void 0),t([gt()],Gt.prototype,"_priority",void 0),t([gt()],Gt.prototype,"_area",void 0),t([gt()],Gt.prototype,"_equipment",void 0),t([gt()],Gt.prototype,"_tag",void 0),t([gt()],Gt.prototype,"_channelId",void 0),t([gt()],Gt.prototype,"_enabled",void 0),t([gt()],Gt.prototype,"_latching",void 0),t([gt()],Gt.prototype,"_ackRequired",void 0),t([gt()],Gt.prototype,"_autoClear",void 0),t([gt()],Gt.prototype,"_conditionTemplate",void 0),t([gt()],Gt.prototype,"_conditionMode",void 0),t([gt()],Gt.prototype,"_conditionEntity",void 0),t([gt()],Gt.prototype,"_notificationTitleTemplate",void 0),t([gt()],Gt.prototype,"_notificationTextTemplate",void 0),t([gt()],Gt.prototype,"_conditionState",void 0),t([gt()],Gt.prototype,"_analogOperator",void 0),t([gt()],Gt.prototype,"_analogThreshold",void 0),t([gt()],Gt.prototype,"_digitalTargetState",void 0),t([gt()],Gt.prototype,"_customMatchValues",void 0),Gt=t([ct("create-edit-view")],Gt);let Qt=class extends lt{constructor(){super(...arguments),this._alarmCount=0,this._channelCount=0,this._loading=!0}static{this.styles=[wt,n`
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
    `]}connectedCallback(){super.connectedCallback(),this._loadStats()}async _loadStats(){if(this.hass)try{const[t,e]=await Promise.all([At(this.hass),Et(this.hass)]);this._alarmCount=t.length,this._channelCount=e.length}finally{this._loading=!1}}render(){return this._loading?q`<div class="empty-state">Loading...</div>`:q`
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
    `}};t([ut({attribute:!1})],Qt.prototype,"hass",void 0),t([gt()],Qt.prototype,"_alarmCount",void 0),t([gt()],Qt.prototype,"_channelCount",void 0),t([gt()],Qt.prototype,"_loading",void 0),Qt=t([ct("settings-view")],Qt);const te=[{id:"active",label:"Active",icon:ft},{id:"all",label:"All Alarms",icon:"M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z"},{id:"history",label:"History",icon:"M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3"},{id:"channels",label:"Channels",icon:"M12 10C10.9 10 10 10.9 10 12S10.9 14 12 14 14 13.1 14 12 13.1 10 12 10M18 12C18 8.7 15.3 6 12 6S6 8.7 6 12C6 14.2 7.2 16.1 9 17.2L10 15.5C8.8 14.8 8 13.5 8 12.1C8 9.9 9.8 8.1 12 8.1S16 9.9 16 12.1C16 13.6 15.2 14.9 14 15.5L15 17.2C16.8 16.2 18 14.2 18 12M12 2C6.5 2 2 6.5 2 12C2 15.7 4 18.9 7 20.6L8 18.9C5.6 17.5 4 14.9 4 12C4 7.6 7.6 4 12 4S20 7.6 20 12C20 15 18.4 17.5 16 18.9L17 20.6C20 18.9 22 15.7 22 12C22 6.5 17.5 2 12 2Z"},{id:"create-edit",label:"Create / Edit",icon:"M17,13H13V17H11V13H7V11H11V7H13V11H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"},{id:"settings",label:"Settings",icon:"M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"}],ee=["active_unacknowledged","active_acknowledged","returned_to_normal_unacknowledged"];let ie=class extends lt{constructor(){super(...arguments),this._activeTab="active",this._priorityFilter="",this._alarms=[],this._handleNavigate=t=>{const{view:e,alarmId:i}=t.detail;this._activeTab=e,this._editAlarmId=i}}setConfig(t){this._config=t,t.default_tab&&(this._activeTab=t.default_tab)}getCardSize(){return 12}static getStubConfig(){return{type:"custom:scada-alarm-overview",title:"Alarm Center"}}static{this.styles=[wt,n`
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
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 600;
        --mdc-icon-size: 15px;
      }
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
      .tab.active {
        color: var(--primary-color, #009ac7);
      }
      .tab.active::after {
        content: "";
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: 0;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: var(--primary-color, #009ac7);
      }
      .tab .count {
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 9999px;
        background: var(--ha-color-neutral-60, #989898);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tab.active .count {
        background: var(--primary-color, #009ac7);
      }
      .content {
        flex: 1;
        overflow-y: auto;
      }
    `]}connectedCallback(){super.connectedCallback(),this.addEventListener("navigate",this._handleNavigate),this._loadAlarms(),this._subscribe()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("navigate",this._handleNavigate),this._unsub?.()}updated(t){t.has("hass")&&!t.get("hass")&&(this._loadAlarms(),this._subscribe())}async _loadAlarms(){this.hass&&(this._alarms=await At(this.hass))}async _subscribe(){this.hass&&(this._unsub=await Mt(this.hass,()=>this._loadAlarms()))}_setTab(t){this._activeTab=t,"create-edit"!==t&&(this._editAlarmId=void 0)}get _activeCount(){return this._alarms.filter(t=>ee.includes(t.runtime.state)).length}get _criticalCount(){return this._alarms.filter(t=>ee.includes(t.runtime.state)&&3===t.priority).length}_renderStatus(){const t=this._criticalCount,e=this._activeCount;let i,a,s;return t>0?(i="#f44336",a=vt,s=`${t} critical`):e>0?(i="#ff9800",a=mt,s=`${e} active`):(i="#4caf50",a="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",s="All normal"),q`
      <div
        class="status"
        style=${`background:color-mix(in srgb, ${i} 14%, transparent); color:${i}`}
      >
        <ha-svg-icon .path=${a}></ha-svg-icon>${s}
      </div>
    `}render(){if(!this._config)return q``;const t=this._config.show_header??!1,e=this._config.max_width??"",i="active"===this._activeTab||"all"===this._activeTab;return q`
      <div style=${e?`max-width:${e};margin:0 auto`:""}>
      ${t?q`
        <div class="header">
          <ha-svg-icon .path=${ft} style="color: var(--primary-color)"></ha-svg-icon>
          <span class="title">${this._config.title??"Alarm Center"}</span>
          ${this._renderStatus()}
        </div>
      `:B}

      <div class="tabs">
        ${te.map(t=>q`
            <button
              class="tab ${this._activeTab===t.id?"active":""}"
              @click=${()=>this._setTab(t.id)}
            >
              <ha-svg-icon .path=${t.icon}></ha-svg-icon>
              <span>${t.label}</span>
              ${"active"===t.id&&this._activeCount>0?q`<span class="count">${this._activeCount}</span>`:B}
            </button>
          `)}
      </div>

      <div class="content">
        ${i?q`<alarm-kpi-strip
              .alarms=${this._alarms}
              .filterPriority=${this._priorityFilter}
              @priority-filter=${t=>{this._priorityFilter=t.detail.priority,this._priorityFilter&&"active"!==this._activeTab&&this._setTab("active")}}
            ></alarm-kpi-strip>`:B}
        ${this._renderView()}
      </div>
      </div>
    `}_renderView(){switch(this._activeTab){case"active":return q`<active-alarms-view
          .hass=${this.hass}
          .priorityFilter=${this._priorityFilter}
        ></active-alarms-view>`;case"all":return q`<all-alarms-view
          .hass=${this.hass}
          .priorityFilter=${this._priorityFilter}
        ></all-alarms-view>`;case"history":return q`<history-view .hass=${this.hass}></history-view>`;case"channels":return q`<channels-view .hass=${this.hass}></channels-view>`;case"create-edit":return q`<create-edit-view
          .hass=${this.hass}
          .alarmId=${this._editAlarmId??""}
        ></create-edit-view>`;case"settings":return q`<settings-view .hass=${this.hass}></settings-view>`;default:return q`<active-alarms-view .hass=${this.hass}></active-alarms-view>`}}};t([ut({attribute:!1})],ie.prototype,"hass",void 0),t([gt()],ie.prototype,"_config",void 0),t([gt()],ie.prototype,"_activeTab",void 0),t([gt()],ie.prototype,"_editAlarmId",void 0),t([gt()],ie.prototype,"_priorityFilter",void 0),t([gt()],ie.prototype,"_alarms",void 0),ie=t([ct("scada-alarm-overview")],ie),window.customCards=window.customCards||[],window.customCards.push({type:"scada-alarm-overview",name:"SCADA Alarm Overview",description:"Full Alarm Center with tabs, KPI strip, and management views. Best in panel mode."});export{ie as ScadaAlarmOverview};
