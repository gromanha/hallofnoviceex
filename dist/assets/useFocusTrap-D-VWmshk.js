import{f as d,r as i}from"./index-iQ5ax3_X.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],v=d("chevron-left",m),l='a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';function E(r=!0){const n=i.useRef(null);return i.useEffect(()=>{if(!r||!n.current)return;const c=n.current,o=document.activeElement,u=c.querySelectorAll(l);u.length>0&&u[0].focus();function s(e){if(e.key!=="Tab")return;const t=c.querySelectorAll(l);if(t.length===0)return;const f=t[0],a=t[t.length-1];e.shiftKey?document.activeElement===f&&(e.preventDefault(),a.focus()):document.activeElement===a&&(e.preventDefault(),f.focus())}return document.addEventListener("keydown",s),()=>{document.removeEventListener("keydown",s),o==null||o.focus()}},[r]),n}export{v as C,E as u};
