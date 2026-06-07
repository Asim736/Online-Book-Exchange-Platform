import{u as ze,a as r,A as z,j as e,R as qe}from"./index-BvnNb_h-.js";const De=()=>{var F,Y,W,K,J,X,G,Q,Z,ee,se,te,ae,ie,ne,re,le,oe,de,ce,me,he,xe;const{user:o,token:m}=ze(),[b,q]=r.useState(null),[w,M]=r.useState(""),[Me,Le]=r.useState(!1),[f,ue]=r.useState(!1),[A,$]=r.useState(!1),[pe,B]=r.useState(!1),[i,I]=r.useState(null),[ge,L]=r.useState([]),[Re,_]=r.useState([]),[Ce,D]=r.useState(!1),[Ae,be]=r.useState(1),[$e,fe]=r.useState(0),[Be,je]=r.useState(1),[v,y]=r.useState([]),[T,E]=r.useState(!1),[H,ve]=r.useState(1),[Ie,Ne]=r.useState(0),[we,ye]=r.useState(1),[P,R]=r.useState({});r.useRef(null),r.useEffect(()=>{const s=()=>{ue(window.innerWidth<=768)};return s(),window.addEventListener("resize",s),()=>window.removeEventListener("resize",s)},[]),r.useEffect(()=>{o!=null&&o._id&&m&&typeof o._id=="string"?(ke(1),V(1)):(y([]),R({}),q(null))},[o==null?void 0:o._id,m]);const ke=async(s=1)=>{D(!0);try{const n=await fetch(`${z}/requests/owner/${o._id}?page=${s}&limit=10`,{headers:{Authorization:`Bearer ${m}`}});if(n.ok){const l=await n.json();Array.isArray(l.requests)?(L(s===1?l.requests.map(a=>{var d,h,x,u,p,g;return{id:String(a._id||""),bookId:String(((d=a.book)==null?void 0:d._id)||""),bookTitle:String(((h=a.book)==null?void 0:h.title)||"Unknown Book"),bookCover:String(((u=(x=a.book)==null?void 0:x.images)==null?void 0:u[0])||"/placeholder-book.jpg"),requesterName:String(((p=a.requester)==null?void 0:p.username)||"Unknown"),requesterId:String(((g=a.requester)==null?void 0:g._id)||""),message:String(a.message||""),status:String(a.status||"pending"),createdAt:a.createdAt,type:"incoming"}}):[...ge,...l.requests.map(a=>{var d,h,x,u,p,g;return{id:String(a._id||""),bookId:String(((d=a.book)==null?void 0:d._id)||""),bookTitle:String(((h=a.book)==null?void 0:h.title)||"Unknown Book"),bookCover:String(((u=(x=a.book)==null?void 0:x.images)==null?void 0:u[0])||"/placeholder-book.jpg"),requesterName:String(((p=a.requester)==null?void 0:p.username)||"Unknown"),requesterId:String(((g=a.requester)==null?void 0:g._id)||""),message:String(a.message||""),status:String(a.status||"pending"),createdAt:a.createdAt,type:"incoming"}})]),fe(l.total||0),je(l.pages||1),be(l.page||1)):L([])}const c=await fetch(`${z}/requests/user/${o._id}`,{headers:{Authorization:`Bearer ${m}`}});if(c.ok){const l=await c.json();Array.isArray(l)?_(l.map(a=>{var d,h,x,u,p,g;return{id:String(a._id||""),bookId:String(((d=a.book)==null?void 0:d._id)||""),bookTitle:String(((h=a.book)==null?void 0:h.title)||"Unknown Book"),bookCover:String(((u=(x=a.book)==null?void 0:x.images)==null?void 0:u[0])||"/placeholder-book.jpg"),ownerName:String(((p=a.owner)==null?void 0:p.username)||"Unknown"),ownerId:String(((g=a.owner)==null?void 0:g._id)||""),message:String(a.message||""),status:String(a.status||"pending"),createdAt:a.createdAt,type:"outgoing"}})):_([])}}catch(n){console.error("Error fetching requests:",n)}finally{D(!1)}},V=async(s=1)=>{E(!0);try{const n=await fetch(`${z}/requests/conversations/${o._id}?page=${s}&limit=10`,{headers:{Authorization:`Bearer ${m}`}});if(n.ok){const c=await n.json();if(Array.isArray(c.conversations)){y(s===1?c.conversations.map(a=>({id:a.id,name:a.participant.username,message:a.lastMessage,time:C(a.lastMessageTime),status:a.status,avatar:`https://i.pravatar.cc/150?u=${a.participant.email}`,unread:a.unreadCount,book:a.book,requestId:a.requestId,isOwner:a.isOwner,participantId:a.id})):[...v,...c.conversations.map(a=>({id:a.id,name:a.participant.username,message:a.lastMessage,time:C(a.lastMessageTime),status:a.status,avatar:`https://i.pravatar.cc/150?u=${a.participant.email}`,unread:a.unreadCount,book:a.book,requestId:a.requestId,isOwner:a.isOwner,participantId:a.id}))]),Ne(c.total||0),ye(c.pages||1),ve(c.page||1);const l={};c.conversations.forEach(a=>{l[a.id]=[{id:1,sender:a.isOwner?"other":"me",text:a.lastMessage,time:C(a.lastMessageTime)}]}),R(l),!b&&c.conversations.length>0&&q(c.conversations[0].id)}else y([])}}catch(n){console.error("Error fetching conversations:",n)}finally{E(!1)}},C=s=>{const n=new Date(s),l=new Date-n,a=Math.floor(l/(1e3*60*60*24));return a===0?n.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:!0}):a===1?"Yesterday":a<7?`${a} days ago`:n.toLocaleDateString("en-US",{month:"short",day:"numeric"})},j=async(s,n,c)=>{if(!s||!n||!m){console.error("Missing required parameters for request action"),alert("Unable to process request. Please try again.");return}try{if(!(await fetch(`${z}/requests/${s}`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m}`},body:JSON.stringify({status:n})})).ok)throw new Error("Failed to update request");L(a=>a.map(d=>d.id===s?{...d,status:n}:d)),y(a=>a.map(d=>d.requestId===s?{...d,status:n}:d)),alert(`Request has been ${n} successfully!`)}catch(l){console.error("Error updating request:",l),alert(`Failed to update request: ${l.message}`)}},k=()=>{if(w.trim()){const s={id:Date.now(),sender:"me",text:w,time:new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})};R(n=>({...n,[b]:[...n[b]||[],s]})),M("")}},Se=s=>{q(s),f&&$(!0)},O=()=>{$(!1)},U=s=>({pending:e.jsx("span",{className:"badge bg-warning text-dark",children:"Pending"}),accepted:e.jsx("span",{className:"badge bg-success",children:"Accepted"}),rejected:e.jsx("span",{className:"badge bg-danger",children:"Rejected"})})[s]||null,S=s=>{I(s),B(!0)},N=()=>{B(!1),I(null)};if(!o||!m)return e.jsx("div",{className:"d-flex justify-content-center align-items-center",style:{height:"100vh"},children:e.jsxs("div",{className:"text-center",children:[e.jsx("h5",{children:"Please log in to access your inbox"}),e.jsx("p",{className:"text-muted",children:"You need to be logged in to see your conversations."})]})});const t=v.find(s=>s.id===b)||v[0];return T?e.jsx("div",{className:"d-flex justify-content-center align-items-center",style:{height:"100vh"},children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"spinner-border text-primary",role:"status",children:e.jsx("span",{className:"visually-hidden",children:"Loading..."})}),e.jsx("p",{className:"mt-2",children:"Loading conversations..."})]})}):!T&&v.length===0?e.jsx("div",{className:"d-flex justify-content-center align-items-center",style:{height:"100vh"},children:e.jsxs("div",{className:"text-center",children:[e.jsx("h5",{children:"No conversations yet"}),e.jsx("p",{className:"text-muted",children:"Start exchanging books to see your conversations here!"})]})}):t?e.jsxs(qe.Fragment,{children:[e.jsx("link",{href:"https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css",rel:"stylesheet"}),e.jsx("style",{children:`
        .app-container {
          min-height: 100vh;
          background-color: #f0f2f5;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .sidebar {
          background-color: white;
          border-right: 1px solid #e0e0e0;
          overflow-y: auto;
          height: 100vh;
        }

        .search-icon {
          background-color: white;
          border-right: 0;
        }

        .search-input {
          border-left: 0;
        }

        .contact-item {
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .contact-item:hover {
          background-color: #f8f9fa;
        }

        .contact-item.active {
          background-color: #f8f9fa;
        }

        .online-indicator {
          width: 12px;
          height: 12px;
          border: 2px solid white;
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .unread-badge {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-container {
          background-color: white;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          border-bottom: 1px solid #e0e0e0;
        }

        .request-banner {
          background-color: #fff9e6;
          border: 1px solid #ffe4a3;
        }

        .request-banner-accepted {
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .request-banner-rejected {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
        }

        .request-title {
          color: #92400e;
        }

        .request-text {
          color: #92400e;
        }

        .messages-area {
          flex-grow: 1;
          overflow-y: auto;
          background-color: #fafafa;
        }

        .message-bubble {
          max-width: 60%;
        }

        .message-sent {
          background-color: #28a745;
          color: white;
          border-radius: 18px 18px 4px 18px;
        }

        .message-received {
          background-color: white;
          border-radius: 18px 18px 18px 4px;
        }

        .message-avatar {
          align-self: flex-end;
        }

        .message-input-container {
          background-color: white;
          border-top: 1px solid #e0e0e0;
        }

        .message-input {
          background-color: #f8f9fa;
          border-radius: 24px 0 0 24px;
          border: 0;
          padding: 0.75rem 1rem;
        }

        .message-input:focus {
          background-color: #f8f9fa;
          box-shadow: none;
        }

        .attach-button {
          background-color: #f8f9fa;
          border: 0;
        }

        .attach-button:hover {
          background-color: #e9ecef;
        }

        .send-button {
          border-radius: 24px;
          padding: 0.75rem 1.5rem;
        }

        .icon-button {
          width: 20px;
          height: 20px;
        }

        .mobile-chat-view {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mobile-back-button {
          background: none;
          border: none;
          color: #007bff;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 16px;
          font-weight: 500;
          border-radius: 6px;
        }

        .mobile-back-button:hover {
          background-color: #f8f9fa;
        }

        .mobile-header-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        .min-width-0 {
          min-width: 0;
        }

        .mobile-header-name {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .mobile-header-status {
          font-size: 14px;
          margin: 0;
          line-height: 1;
        }

        .mobile-header-actions {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          flex-shrink: 0 !important;
          margin-left: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .mobile-action-btn {
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          background-color: #f8f9fa !important;
          border: 1px solid #dee2e6 !important;
          padding: 0 !important;
          margin: 0 !important;
          min-width: 40px !important;
          flex-shrink: 0 !important;
        }

        .mobile-action-btn:hover {
          background-color: #e9ecef !important;
        }

        .mobile-action-btn:focus {
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
        }

        .mobile-action-btn svg {
          width: 18px !important;
          height: 18px !important;
          color: #6c757d !important;
          flex-shrink: 0 !important;
        }

        @media (max-width: 768px) {
          .app-container {
            overflow-x: hidden;
          }

          .sidebar {
            height: 100vh;
            width: 100%;
          }
          
          .chat-container {
            display: none;
          }
          
          .message-bubble {
            max-width: 85%;
          }

          .mobile-sidebar-only .sidebar {
            display: block;
          }

          .mobile-sidebar-only .chat-container {
            display: none;
          }

          .mobile-chat-only .sidebar {
            display: none;
          }

          .mobile-chat-only .chat-container {
            display: flex;
            height: 100vh;
          }

          .chat-header {
            padding: 12px 16px;
            min-height: 70px;
            border-bottom: 1px solid #e0e0e0;
            flex-shrink: 0;
          }

          .messages-area {
            padding: 16px 12px;
            overflow-y: auto;
            flex: 1;
          }

          .message-input-container {
            padding: 12px 16px;
            flex-shrink: 0;
            border-top: 1px solid #e0e0e0;
          }

          .contact-item {
            padding: 16px 12px;
          }

          .mobile-chat-view .chat-header {
            position: sticky;
            top: 0;
            background: white;
            z-index: 10;
          }
        }

        @media (min-width: 769px) {
          .mobile-chat-view {
            display: none;
          }
          
          .sidebar {
            height: 100vh;
          }
          
          .chat-container {
            display: flex;
            height: 100vh;
          }
        }
      `}),e.jsxs("div",{className:"app-container",children:[e.jsx("div",{className:"container-fluid p-0",style:{maxWidth:"100vw",overflowX:"hidden"},children:e.jsxs("div",{className:`row g-0 ${f?A?"mobile-chat-only":"mobile-sidebar-only":""}`,children:[e.jsxs("div",{className:"col-md-4 col-lg-3 sidebar left-sidebar",children:[e.jsxs("div",{className:"search-section",children:[e.jsx("h4",{className:"mb-4 fw-bold",style:{color:"#1f2937",fontSize:"24px",fontWeight:"600"},children:"Inbox"}),e.jsx("input",{type:"text",className:"search-bar",placeholder:"Search conversations..."})]}),e.jsx("div",{className:"contacts-list",children:v.map(s=>e.jsxs("div",{className:`contact-item d-flex align-items-start p-3 mb-2 rounded ${b===s.id?"active":""}`,onClick:()=>Se(s.id),children:[e.jsxs("div",{className:"position-relative me-3",style:{minWidth:"50px"},children:[e.jsx("img",{src:s.avatar,alt:s.name,className:"rounded-circle",width:"50",height:"50"}),s.status==="online"&&e.jsx("span",{className:"online-indicator bg-success rounded-circle"})]}),e.jsxs("div",{className:"flex-grow-1 overflow-hidden",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-start mb-1",children:[e.jsx("h6",{className:"mb-0 fw-bold",style:{fontSize:"16px"},children:s.name}),e.jsx("small",{className:"text-muted",style:{fontSize:"12px",whiteSpace:"nowrap",marginLeft:"8px"},children:s.time})]}),e.jsx("p",{className:"mb-2 text-muted small text-truncate",style:{fontSize:"14px"},children:s.message}),s.status&&e.jsx("div",{children:U(s.status)}),s.unread&&s.unread>0&&e.jsx("span",{className:"badge bg-success rounded-circle mt-2 unread-badge",children:s.unread})]})]},s.id))}),H<we&&e.jsx("div",{className:"d-flex justify-content-center my-3",children:e.jsx("button",{className:"btn btn-outline-primary",onClick:()=>V(H+1),children:"Load More Conversations"})}),"// Optionally, you can add a similar Load More for incoming requests if you want to paginate the requests list in the UI."]}),e.jsxs("div",{className:"col-md-8 col-lg-9 chat-container",children:[e.jsxs("div",{className:"chat-header d-flex align-items-center justify-content-between p-3",children:[e.jsxs("div",{className:"d-flex align-items-center",children:[f&&e.jsxs("button",{className:"mobile-back-button me-3",onClick:O,children:[e.jsx("svg",{width:"20",height:"20",fill:"currentColor",viewBox:"0 0 16 16",children:e.jsx("path",{fillRule:"evenodd",d:"M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"})}),"Back"]}),e.jsx("img",{src:t==null?void 0:t.avatar,alt:t==null?void 0:t.name,className:"rounded-circle me-3",width:"50",height:"50"}),e.jsxs("div",{children:[e.jsx("h5",{className:"mb-0 fw-bold",children:t==null?void 0:t.name}),e.jsx("small",{className:"text-success",children:"Online"})]})]}),!f&&e.jsxs("div",{children:[e.jsx("button",{className:"btn btn-light me-2",children:e.jsx("svg",{className:"icon-button",fill:"currentColor",viewBox:"0 0 16 16",children:e.jsx("path",{d:"M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"})})}),e.jsx("button",{className:"btn btn-light me-2",children:e.jsx("svg",{className:"icon-button",fill:"currentColor",viewBox:"0 0 16 16",children:e.jsx("path",{d:"M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"})})}),e.jsx("button",{className:"btn btn-light",children:e.jsx("svg",{className:"icon-button",fill:"currentColor",viewBox:"0 0 16 16",children:e.jsx("path",{d:"M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"})})})]}),f&&e.jsxs("div",{className:"mobile-header-actions",children:[e.jsx("button",{type:"button",className:"btn mobile-action-btn",title:"Call",children:e.jsx("svg",{width:"18",height:"18",fill:"currentColor",viewBox:"0 0 16 16",children:e.jsx("path",{d:"M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"})})}),e.jsx("button",{type:"button",className:"btn mobile-action-btn",title:"More options",children:e.jsx("svg",{width:"18",height:"18",fill:"currentColor",viewBox:"0 0 16 16",children:e.jsx("path",{d:"M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"})})})]})]}),t&&t.requestId&&t.isOwner&&e.jsx("div",{className:`mx-4 mt-4 p-4 rounded ${t.status==="pending"?"request-banner":t.status==="accepted"?"request-banner-accepted":"request-banner-rejected"}`,children:e.jsxs("div",{className:"d-flex align-items-start",children:[e.jsxs("svg",{width:"24",height:"24",fill:t.status==="pending"?"#f59e0b":t.status==="accepted"?"#10b981":"#ef4444",viewBox:"0 0 16 16",className:"me-3 mt-1",children:[t.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"}),e.jsx("path",{d:"m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"})]}),t.status==="accepted"&&e.jsx("path",{d:"M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"}),t.status==="rejected"&&e.jsx("path",{d:"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"})]}),e.jsxs("div",{className:"flex-grow-1",children:[e.jsx("h6",{className:"mb-2 fw-bold request-title",children:t.status==="pending"?"Book Exchange Request":t.status==="accepted"?"Request Accepted":"Request Rejected"}),e.jsx("p",{className:"mb-3 request-text",children:t.status==="pending"?`${t.name} wants to exchange for "${(F=t.book)==null?void 0:F.title}".`:t.status==="accepted"?`You accepted ${t.name}'s request for "${(Y=t.book)==null?void 0:Y.title}".`:`You rejected ${t.name}'s request for "${(W=t.book)==null?void 0:W.title}".`}),t.status==="pending"?e.jsxs("div",{className:"d-flex gap-2",children:[e.jsxs("button",{className:"btn btn-success d-flex align-items-center",onClick:()=>{var s;return j(t.requestId,"accepted",(s=t.book)==null?void 0:s._id)},children:[e.jsx("svg",{width:"16",height:"16",fill:"currentColor",viewBox:"0 0 16 16",className:"me-2",children:e.jsx("path",{d:"M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"})}),"Approve Request"]}),e.jsxs("button",{className:"btn btn-danger d-flex align-items-center",onClick:()=>{var s;return j(t.requestId,"rejected",(s=t.book)==null?void 0:s._id)},children:[e.jsx("svg",{width:"16",height:"16",fill:"currentColor",viewBox:"0 0 16 16",className:"me-2",children:e.jsx("path",{d:"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"})}),"Reject"]}),e.jsx("button",{className:"btn btn-light",onClick:()=>S(t),children:"View Request Details"})]}):e.jsxs("div",{className:"d-flex gap-2",children:[e.jsx("button",{className:"btn btn-light",onClick:()=>S(t),children:"View Request Details"}),t.status==="accepted"&&e.jsx("button",{className:"btn btn-outline-primary",children:"Contact for Exchange"})]})]})]})}),e.jsxs("div",{className:"messages-area p-4",children:[e.jsx("div",{className:"text-center mb-4",children:e.jsx("small",{className:"text-muted",children:"Today"})}),((K=P[b])==null?void 0:K.map(s=>e.jsxs("div",{className:`d-flex mb-3 ${s.sender==="me"?"justify-content-end":"justify-content-start"}`,children:[s.sender==="other"&&e.jsx("img",{src:(t==null?void 0:t.avatar)||"https://i.pravatar.cc/150?img=1",alt:"",className:"rounded-circle me-2 message-avatar",width:"40",height:"40"}),e.jsxs("div",{className:"message-bubble",children:[e.jsx("div",{className:`p-3 rounded ${s.sender==="me"?"message-sent":"message-received"}`,children:e.jsx("p",{className:"mb-0",children:String(s.text||"")})}),e.jsx("small",{className:`text-muted d-block mt-1 ${s.sender==="me"?"text-end":""}`,children:String(s.time||"")})]}),s.sender==="me"&&e.jsx("img",{src:`https://i.pravatar.cc/150?u=${o==null?void 0:o.email}`,alt:"",className:"rounded-circle ms-2 message-avatar",width:"40",height:"40"})]},String(s.id))))||[]]}),e.jsx("div",{className:"message-input-container p-3",children:e.jsxs("div",{className:"input-group",children:[e.jsx("input",{type:"text",className:"form-control message-input py-3",placeholder:"Type your message...",value:w,onChange:s=>M(s.target.value),onKeyPress:s=>s.key==="Enter"&&k()}),e.jsx("button",{className:"btn attach-button",children:e.jsxs("svg",{className:"icon-button",fill:"currentColor",viewBox:"0 0 16 16",children:[e.jsx("path",{d:"M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"}),e.jsx("path",{d:"M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"})]})}),e.jsx("button",{className:"btn btn-success ms-2 send-button",onClick:k,children:"Send"})]})})]})]})}),f&&A&&e.jsxs("div",{className:"mobile-chat-view",children:[e.jsxs("div",{className:"chat-header d-flex align-items-center",style:{padding:"12px 16px",minHeight:"70px"},children:[e.jsxs("button",{className:"mobile-back-button me-2 flex-shrink-0",onClick:O,children:[e.jsx("svg",{width:"18",height:"18",fill:"currentColor",viewBox:"0 0 16 16",children:e.jsx("path",{fillRule:"evenodd",d:"M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"})}),"Back"]}),e.jsx("img",{src:t==null?void 0:t.avatar,alt:t==null?void 0:t.name,className:"rounded-circle me-3 flex-shrink-0",width:"44",height:"44"}),e.jsxs("div",{className:"mobile-header-info flex-grow-1 min-width-0",children:[e.jsx("h5",{className:"mobile-header-name text-truncate",children:t==null?void 0:t.name}),e.jsx("small",{className:"text-success mobile-header-status",children:"Online"})]}),e.jsxs("div",{className:"mobile-header-actions",style:{display:"flex",alignItems:"center",gap:"8px",flexShrink:0},children:[e.jsx("button",{type:"button",className:"mobile-action-btn",title:"Call",style:{width:"40px",height:"40px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",backgroundColor:"#f8f9fa",border:"1px solid #dee2e6",padding:"0"},children:e.jsx("svg",{width:"18",height:"18",fill:"#6c757d",viewBox:"0 0 16 16",children:e.jsx("path",{d:"M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.22 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"})})}),e.jsx("button",{type:"button",className:"mobile-action-btn",title:"More options",style:{width:"40px",height:"40px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",backgroundColor:"#f8f9fa",border:"1px solid #dee2e6",padding:"0"},children:e.jsx("svg",{width:"18",height:"18",fill:"#6c757d",viewBox:"0 0 16 16",children:e.jsx("path",{d:"M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"})})})]})]}),t&&t.requestId&&t.isOwner&&e.jsx("div",{className:`${t.status==="pending"?"request-banner":t.status==="accepted"?"request-banner-accepted":"request-banner-rejected"}`,style:{margin:"12px 16px",padding:"16px",borderRadius:"12px"},children:e.jsxs("div",{className:"d-flex align-items-start",children:[e.jsxs("svg",{width:"20",height:"20",fill:t.status==="pending"?"#f59e0b":t.status==="accepted"?"#10b981":"#ef4444",viewBox:"0 0 16 16",className:"me-3 mt-1 flex-shrink-0",children:[t.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("path",{d:"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"}),e.jsx("path",{d:"m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"})]}),t.status==="accepted"&&e.jsx("path",{d:"M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"}),t.status==="rejected"&&e.jsx("path",{d:"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"})]}),e.jsxs("div",{className:"flex-grow-1",children:[e.jsx("h6",{className:"mb-2 fw-bold request-title",style:{fontSize:"16px",color:t.status==="pending"?"#92400e":t.status==="accepted"?"#065f46":"#991b1b"},children:t.status==="pending"?"Book Exchange Request":t.status==="accepted"?"Request Accepted":"Request Rejected"}),e.jsx("p",{className:"mb-3 request-text",style:{fontSize:"14px",color:t.status==="pending"?"#92400e":t.status==="accepted"?"#065f46":"#991b1b"},children:t.status==="pending"?`${t.name} wants to exchange for "${(J=t.book)==null?void 0:J.title}".`:t.status==="accepted"?`You accepted ${t.name}'s request for "${(X=t.book)==null?void 0:X.title}".`:`You rejected ${t.name}'s request for "${(G=t.book)==null?void 0:G.title}".`}),t.status==="pending"?e.jsxs("div",{className:"d-flex flex-column gap-2",children:[e.jsxs("button",{className:"btn btn-success d-flex align-items-center justify-content-center",style:{padding:"12px",fontSize:"14px"},onClick:()=>{var s;return j(t.requestId,"accepted",(s=t.book)==null?void 0:s._id)},children:[e.jsx("svg",{width:"16",height:"16",fill:"currentColor",viewBox:"0 0 16 16",className:"me-2",children:e.jsx("path",{d:"M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"})}),"Approve Request"]}),e.jsxs("button",{className:"btn btn-danger d-flex align-items-center justify-content-center",style:{padding:"12px",fontSize:"14px"},onClick:()=>{var s;return j(t.requestId,"rejected",(s=t.book)==null?void 0:s._id)},children:[e.jsx("svg",{width:"16",height:"16",fill:"currentColor",viewBox:"0 0 16 16",className:"me-2",children:e.jsx("path",{d:"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"})}),"Reject"]}),e.jsx("button",{className:"btn btn-light",style:{padding:"12px",fontSize:"14px"},onClick:()=>S(t),children:"View Request Details"})]}):e.jsxs("div",{className:"d-flex flex-column gap-2",children:[e.jsx("button",{className:"btn btn-light",style:{padding:"12px",fontSize:"14px"},onClick:()=>S(t),children:"View Request Details"}),t.status==="accepted"&&e.jsx("button",{className:"btn btn-outline-primary",style:{padding:"12px",fontSize:"14px"},children:"Contact for Exchange"})]})]})]})}),e.jsxs("div",{className:"messages-area flex-grow-1",style:{backgroundColor:"#fafafa",padding:"16px 12px"},children:[e.jsx("div",{className:"text-center mb-4",children:e.jsx("small",{className:"text-muted",children:"Today"})}),((Q=P[b])==null?void 0:Q.map(s=>e.jsxs("div",{className:`d-flex mb-3 ${s.sender==="me"?"justify-content-end":"justify-content-start"}`,children:[s.sender==="other"&&e.jsx("img",{src:(t==null?void 0:t.avatar)||"https://i.pravatar.cc/150?img=1",alt:"",className:"rounded-circle me-2 message-avatar",width:"36",height:"36"}),e.jsxs("div",{className:"message-bubble",children:[e.jsx("div",{className:`p-3 rounded ${s.sender==="me"?"message-sent":"message-received"}`,style:{fontSize:"15px",lineHeight:"1.4"},children:e.jsx("p",{className:"mb-0",children:String(s.text||"")})}),e.jsx("small",{className:`text-muted d-block mt-1 ${s.sender==="me"?"text-end":""}`,style:{fontSize:"12px"},children:String(s.time||"")})]}),s.sender==="me"&&e.jsx("img",{src:`https://i.pravatar.cc/150?u=${o==null?void 0:o.email}`,alt:"",className:"rounded-circle ms-2 message-avatar",width:"36",height:"36"})]},String(s.id))))||[]]}),e.jsx("div",{className:"message-input-container border-top",style:{padding:"12px 16px"},children:e.jsxs("div",{className:"input-group",children:[e.jsx("input",{type:"text",className:"form-control message-input",placeholder:"Type your message...",value:w,onChange:s=>M(s.target.value),onKeyPress:s=>s.key==="Enter"&&k(),style:{padding:"12px 16px",fontSize:"16px",border:"1px solid #dee2e6",borderRadius:"24px 0 0 24px"}}),e.jsx("button",{className:"btn attach-button",style:{padding:"12px",border:"1px solid #dee2e6",borderLeft:0,borderRight:0},children:e.jsxs("svg",{width:"18",height:"18",fill:"currentColor",viewBox:"0 0 16 16",children:[e.jsx("path",{d:"M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z"}),e.jsx("path",{d:"M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8zm0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5z"})]})}),e.jsx("button",{className:"btn btn-success send-button",onClick:k,style:{padding:"12px 20px",fontSize:"14px",fontWeight:"600",borderRadius:"0 24px 24px 0"},children:"Send"})]})})]})]}),pe&&i&&e.jsx("div",{className:"modal fade show",style:{display:"block",backgroundColor:"rgba(0,0,0,0.5)"},onClick:N,children:e.jsx("div",{className:"modal-dialog modal-lg modal-dialog-centered",onClick:s=>s.stopPropagation(),children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h5",{className:"modal-title",children:"Book Request Details"}),e.jsx("button",{type:"button",className:"btn-close",onClick:N})]}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"row",children:[e.jsx("div",{className:"col-md-4",children:e.jsx("div",{className:"text-center mb-3",children:e.jsx("img",{src:((Z=i.book)==null?void 0:Z.image)||"https://via.placeholder.com/200x300?text=No+Image",alt:((ee=i.book)==null?void 0:ee.title)||"Book cover",className:"img-fluid rounded",style:{maxHeight:"250px",objectFit:"cover"}})})}),e.jsxs("div",{className:"col-md-8",children:[e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Book Title"}),e.jsx("h5",{className:"mb-0",children:((se=i.book)==null?void 0:se.title)||"N/A"})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Author"}),e.jsx("p",{className:"mb-0",children:((te=i.book)==null?void 0:te.author)||"N/A"})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Book Owner"}),e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("img",{src:((ie=(ae=i.book)==null?void 0:ae.owner)==null?void 0:ie.avatar)||`https://i.pravatar.cc/150?u=${(re=(ne=i.book)==null?void 0:ne.owner)==null?void 0:re.email}`,alt:(oe=(le=i.book)==null?void 0:le.owner)==null?void 0:oe.name,className:"rounded-circle me-2",width:"40",height:"40"}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-0 fw-medium",children:((ce=(de=i.book)==null?void 0:de.owner)==null?void 0:ce.name)||"N/A"}),e.jsx("small",{className:"text-muted",children:((he=(me=i.book)==null?void 0:me.owner)==null?void 0:he.email)||"N/A"})]})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Requester"}),e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("img",{src:i.avatar||`https://i.pravatar.cc/150?u=${i.email}`,alt:i.name,className:"rounded-circle me-2",width:"40",height:"40"}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-0 fw-medium",children:i.name||"N/A"}),e.jsx("small",{className:"text-muted",children:i.email||"N/A"})]})]})]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Request Status"}),U(i.status)]}),e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Request Date"}),e.jsx("p",{className:"mb-0",children:i.date||"N/A"})]}),i.message&&e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Request Message"}),e.jsx("p",{className:"mb-0 p-3 bg-light rounded",children:i.message})]}),((xe=i.book)==null?void 0:xe.description)&&e.jsxs("div",{className:"mb-3",children:[e.jsx("h6",{className:"text-muted mb-1",children:"Book Description"}),e.jsx("p",{className:"mb-0 text-muted",children:i.book.description})]})]})]})}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{type:"button",className:"btn btn-secondary",onClick:N,children:"Close"}),i.status==="pending"&&e.jsxs("div",{className:"d-flex gap-2",children:[e.jsx("button",{className:"btn btn-success",onClick:()=>{var s;j(i.requestId,"accepted",(s=i.book)==null?void 0:s._id),N()},children:"Accept Request"}),e.jsx("button",{className:"btn btn-danger",onClick:()=>{var s;j(i.requestId,"rejected",(s=i.book)==null?void 0:s._id),N()},children:"Reject Request"})]}),i.status==="accepted"&&e.jsx("button",{className:"btn btn-primary",children:"Contact for Exchange"})]})]})})})]}):e.jsx("div",{className:"d-flex justify-content-center align-items-center",style:{height:"100vh"},children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"spinner-border text-primary",role:"status",children:e.jsx("span",{className:"visually-hidden",children:"Loading..."})}),e.jsx("p",{className:"mt-2",children:"Loading inbox..."})]})})};export{De as default};
