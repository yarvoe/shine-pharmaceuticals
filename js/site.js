/* ============================================================
   AIDTECH Liberia — shared site behaviour (zero dependencies)
   ============================================================ */
(function(){
  "use strict";
  var d=document;

  /* ---------- helpers ---------- */
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
  var WA=(window.SITE&&window.SITE.wa)||"";

  /* ---------- mobile nav ---------- */
  var nav=$(".nav"),burger=$(".burger");
  if(nav&&burger){
    burger.addEventListener("click",function(){
      var open=nav.classList.toggle("is-open");
      d.body.style.overflow=open?"hidden":"";
    });
    $$(".mobile-menu a").forEach(function(a){a.addEventListener("click",function(){
      nav.classList.remove("is-open");d.body.style.overflow="";
    })});
  }

  /* ---------- link-aware home ----------
     Each site is standalone, so its brand link points at #top by default.
     When a visitor arrives FROM the showcase hub (?from=hq), the brand link
     is repointed to the portfolio index so they can get back to the list. */
  (function(){
    var params=new URLSearchParams(window.location.search);
    var fromHub=params.get("from")==="hq";
    d.documentElement.classList.toggle("from-hub",fromHub);
    var home=d.querySelector(".brand[href='#top'], .brand[href='#']");
    if(fromHub&&home){
      home.setAttribute("href","../showcase/index.html");
      home.setAttribute("title","Back to the AIDTECH portfolio");
    }
  })();

  /* ---------- sticky nav state ---------- */
  var onScroll=function(){
    if(nav){nav.classList.toggle("is-scrolled",window.scrollY>10)}
  };
  window.addEventListener("scroll",onScroll,{passive:true});onScroll();

  /* ---------- reveal on scroll ---------- */
  var reveals=$$(".reveal");
  if("IntersectionObserver" in window&&reveals.length){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add("is-in");io.unobserve(e.target)}
      });
    },{threshold:.12,rootMargin:"0px 0px -40px 0px"});
    reveals.forEach(function(el){io.observe(el)});
  }else{reveals.forEach(function(el){el.classList.add("is-in")})}

  /* ---------- menu tabs ---------- */
  $$(".menu-tabs").forEach(function(group){
    var tabs=$$(".menu-tab",group);
    tabs.forEach(function(tab){
      tab.addEventListener("click",function(){
        var target=tab.getAttribute("data-target");
        tabs.forEach(function(t){t.classList.remove("is-active");t.setAttribute("aria-selected","false")});
        tab.classList.add("is-active");tab.setAttribute("aria-selected","true");
        var scope=group.getAttribute("data-scope");
        var root=scope?$(scope):d;
        $$(".menu-panel",root).forEach(function(p){p.classList.toggle("is-active",p.id===target)});
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lb=$(".lightbox");
  if(lb){
    var lbImg=$("img",lb);
    $$("[data-lightbox]").forEach(function(el){
      el.addEventListener("click",function(){
        lbImg.src=el.getAttribute("data-lightbox");lb.classList.add("is-open");lb.setAttribute("aria-hidden","false");d.body.style.overflow="hidden";
      });
    });
    var closeLb=function(){lb.classList.remove("is-open");lb.setAttribute("aria-hidden","true");d.body.style.overflow=""};
    lb.addEventListener("click",function(e){if(e.target===lb||e.target.closest(".lb-close"))closeLb()});
    d.addEventListener("keydown",function(e){if(e.key==="Escape")closeLb()});
  }

  /* ---------- toast ---------- */
  var toastEl=null,toastTimer=null;
  function toast(msg){
    if(!d.body)return;
    if(!toastEl){
      toastEl=d.createElement("div");
      toastEl.className="toast";
      toastEl.innerHTML='<span class="t-ic">'+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'+'</span><span class="t-msg"></span><button class="t-cart">View basket</button><button class="t-x" aria-label="Dismiss">&times;</button>';
      d.body.appendChild(toastEl);
      toastEl.querySelector(".t-x").addEventListener("click",hideToast);
      toastEl.querySelector(".t-cart").addEventListener("click",function(){hideToast();renderCart();openCart()});
    }
    toastEl.querySelector(".t-msg").textContent=msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(hideToast,3400);
  }
  function hideToast(){if(toastEl)toastEl.classList.remove("is-on")}

  /* ---------- cart (services/products) ---------- */
  var cart=[]
  var overlay=$(".cart-overlay"),drawer=$(".cart-drawer");
  function money(n){return "$"+n.toFixed(2)}
  function cartTotal(){return cart.reduce(function(t,i){return t+i.price*i.qty},0)}

  function renderCart(){
    var list=$(".cart-items"),countEls=$$(".cart-count"),totalEl=$(".cart-total b");
    if(!list)return;
    if(!cart.length){
      list.innerHTML='<div class="cart-empty">Your cart is empty.<br><span class="tiny">Tap “Add” on any item to start an order.</span></div>';
    }else{
      list.innerHTML=cart.map(function(i,ix){
        return '<div class="cart-item">'+
          (i.img?'<img src="'+i.img+'" alt="" loading="lazy">':'')+
          '<div class="ci-main"><b>'+i.name+'</b><span>'+money(i.price)+' each</span></div>'+
          '<div class="qty"><button data-q="-1" data-ix="'+ix+'" aria-label="Decrease">−</button><span>'+i.qty+'</span><button data-q="1" data-ix="'+ix+'" aria-label="Increase">+</button></div>'+
        '</div>';
      }).join("");
    }
    var total=cart.reduce(function(t,i){return t+i.qty},0);
    countEls.forEach(function(el){el.textContent=total;el.style.display=total?"grid":"none"});
    if(totalEl)totalEl.textContent=money(cartTotal());
    var waBtn=$("#cart-wa");
    if(waBtn){
      var lines=cart.map(function(i){return "• "+i.qty+" × "+i.name+" — "+money(i.price*i.qty)});
      var msg="Hello "+(window.SITE?window.SITE.name:"")+"! I'd like to order:\n"+lines.join("\n")+"\n\nTotal: "+money(cartTotal())+"\n\nName:\nDelivery address / pick-up time:";
      waBtn.href="https://wa.me/"+WA+"?text="+encodeURIComponent(msg);
    }
  }
  function openCart(){if(!drawer)return;drawer.classList.add("is-open");overlay&&overlay.classList.add("is-open");d.body.style.overflow="hidden"}
  function closeCart(){if(!drawer)return;drawer.classList.remove("is-open");overlay&&overlay.classList.remove("is-open");d.body.style.overflow=""}

  $$("[data-add]").forEach(function(btn){
    btn.addEventListener("click",function(){
      var el=btn.getAttribute("data-add");
      var data=window.CATALOG&&window.CATALOG[el];
      if(!data)return;
      var found=cart.filter(function(i){return i.id===el})[0];
      if(found){found.qty++}else{cart.push({id:el,name:data.name,price:data.price,img:data.img||"",qty:1})}
      renderCart();
      toast(data.name+" added to basket");
    });
  });
  if(drawer){
    $$(".cart-toggle").forEach(function(b){b.addEventListener("click",function(e){e.preventDefault();renderCart();openCart()})});
    overlay&&overlay.addEventListener("click",closeCart);
    $$("[data-cart-close]").forEach(function(b){b.addEventListener("click",closeCart)});
    drawer.addEventListener("click",function(e){
      var b=e.target.closest("[data-q]");
      if(b){
        var ix=+b.getAttribute("data-ix"),q=+b.getAttribute("data-q");
        cart[ix].qty+=q;
        if(cart[ix].qty<=0)cart.splice(ix,1);
        renderCart();
      }
    });
    d.addEventListener("keydown",function(e){if(e.key==="Escape")closeCart()});
    renderCart();
  }

  /* ---------- generic inquiry forms → WhatsApp ---------- */
  $$("form[data-wa-form]").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var lines=[];
      $$("input,select,textarea",form).forEach(function(f){
        if(!f.name||f.type==="submit")return;
        var v=(f.type==="checkbox")?(f.checked?"Yes":"No"):f.value.trim();
        if(!v)return;
        var label=f.getAttribute("data-label")||f.name;
        lines.push(label+": "+v);
      });
      var intro=form.getAttribute("data-wa-intro")||("Hello "+(window.SITE?window.SITE.name:"")+"! New enquiry from your website:");
      var msg=intro+"\n\n"+lines.join("\n");
      var success=$(".form-success",form);
      if(success)success.classList.add("is-visible");
      var waNum=form.getAttribute("data-wa")||WA;
      window.open("https://wa.me/"+waNum+"?text="+encodeURIComponent(msg),"_blank");
      var email=form.getAttribute("data-email");
      if(email){
        setTimeout(function(){
          var subj=encodeURIComponent((window.SITE?window.SITE.name:"Website")+" — new enquiry");
          window.location.href="mailto:"+email+"?subject="+subj+"&body="+encodeURIComponent(msg);
        },400);
      }
      form.reset();
    });
  });

  /* ---------- year ---------- */
  $$("[data-year]").forEach(function(el){el.textContent=new Date().getFullYear()});

  /* ---------- footer "today" highlight for hours ---------- */
  var today=new Date().getDay();
  $$("[data-day]").forEach(function(row){
    if(+row.getAttribute("data-day")===today)row.classList.add("is-today");
  });
})();
