import{e as d,r as f}from"./index-7-PLLXxu.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],y=d("shield-check",m),l='a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';function p(o=!0){const n=f.useRef(null);return f.useEffect(()=>{if(!o||!n.current)return;const r=n.current,c=document.activeElement,u=r.querySelectorAll(l);u.length>0&&u[0].focus();function s(e){if(e.key!=="Tab")return;const t=r.querySelectorAll(l);if(t.length===0)return;const a=t[0],i=t[t.length-1];e.shiftKey?document.activeElement===a&&(e.preventDefault(),i.focus()):document.activeElement===i&&(e.preventDefault(),a.focus())}return document.addEventListener("keydown",s),()=>{document.removeEventListener("keydown",s),c==null||c.focus()}},[o]),n}export{y as S,p as u};
