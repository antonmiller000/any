(function(){
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.2, rootMargin:"0px 0px -8% 0px"});
    revealEls.forEach(function(el){ io.observe(el); });

    var stepEls = document.querySelectorAll(".solar-steps__item");
    var stepIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add("in"); stepIo.unobserve(entry.target); }
      });
    }, {threshold:.5});
    stepEls.forEach(function(el){ stepIo.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in"); });
  }

  /* ---- nav visibility ---- */
  var nav = document.getElementById("siteNav");
  var hero = document.getElementById("hero");
  if(nav && hero && "IntersectionObserver" in window){
    var navIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        nav.classList.toggle("visible", !entry.isIntersecting);
      });
    }, {threshold:.15});
    navIo.observe(hero);
  }

  /* ---- hero actions ---- */
  var flash = document.getElementById("light-flash");
  var enterBtn = document.getElementById("enterField");
  var searchBtn = document.getElementById("beginSearch");

  function scrollToId(id){
    var el = document.getElementById(id);
    if(el){ el.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block:"start"}); }
  }

  if(enterBtn){
    enterBtn.addEventListener("click", function(){
      if(flash){
        flash.classList.remove("flashing");
        void flash.offsetWidth;
        flash.classList.add("flashing");
      }
      setTimeout(function(){ window.location.href = "the-project/"; }, reduceMotion ? 0 : 900);
    });
  }
  if(searchBtn){
    searchBtn.addEventListener("click", function(){ window.location.href = "field-journal/"; });
  }

  /* ---- energy chain accordion ---- */
  var nodes = document.querySelectorAll("#energyChain .node");
  nodes.forEach(function(node){
    var btn = node.querySelector(".node__btn");
    var textEl = node.querySelector(".node__text");
    textEl.textContent = node.getAttribute("data-text");
    btn.addEventListener("click", function(){
      var isActive = node.classList.contains("active");
      nodes.forEach(function(n){
        n.classList.remove("active");
        n.querySelector(".node__btn").setAttribute("aria-expanded","false");
      });
      if(!isActive){
        node.classList.add("active");
        btn.setAttribute("aria-expanded","true");
      }
    });
  });

  /* ---- starfield ---- */
  function initStarfield(canvas, opts){
    if(!canvas) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size(){
      var rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var count = opts.count || Math.round((w*h)/9000);
      stars = [];
      for(var i=0;i<count;i++){
        stars.push({
          x: Math.random()*w,
          y: Math.random()*h,
          r: Math.random()*1.2 + .3,
          phase: Math.random()*Math.PI*2,
          speed: .002 + Math.random()*.004,
          amber: Math.random() < .12
        });
      }
    }

    function draw(t){
      ctx.clearRect(0,0,w,h);
      for(var i=0;i<stars.length;i++){
        var s = stars[i];
        var a = reduceMotion ? .5 : (0.35 + 0.45 * Math.sin(t*s.speed + s.phase));
        ctx.beginPath();
        ctx.fillStyle = s.amber ? "rgba(217,130,63,"+a+")" : "rgba(245,237,224,"+a+")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fill();
      }
    }

    size();
    draw(0);

    if(!reduceMotion){
      var raf;
      function loop(t){ draw(t); raf = requestAnimationFrame(loop); }
      if("IntersectionObserver" in window){
        var obs = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting){ if(!raf) raf = requestAnimationFrame(loop); }
            else { if(raf) cancelAnimationFrame(raf); raf = null; }
          });
        }, {threshold:0});
        obs.observe(canvas.parentElement);
      } else {
        raf = requestAnimationFrame(loop);
      }
    }

    var resizeTimer;
    window.addEventListener("resize", function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){ size(); draw(0); }, 200);
    });
  }

  initStarfield(document.getElementById("heroCanvas"), {count: 140});
  initStarfield(document.getElementById("manifestoCanvas"), {count: 220});
})();
