import{d as o,r as l}from"./index-CdjrQ9b3.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],E=o("chevron-left",h);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],p=o("chevron-right",m);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],k=o("eye",y),d='a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';function g(r=!0){const n=l.useRef(null);return l.useEffect(()=>{if(!r||!n.current)return;const s=n.current,c=document.activeElement,u=s.querySelectorAll(d);u.length>0&&u[0].focus();function a(e){if(e.key!=="Tab")return;const t=s.querySelectorAll(d);if(t.length===0)return;const i=t[0],f=t[t.length-1];e.shiftKey?document.activeElement===i&&(e.preventDefault(),f.focus()):document.activeElement===f&&(e.preventDefault(),i.focus())}return document.addEventListener("keydown",a),()=>{document.removeEventListener("keydown",a),c==null||c.focus()}},[r]),n}export{E as C,k as E,p as a,g as u};
