/* Photo-preserving local deformation. No external libraries or generated video. */
(()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=!document.hidden;document.addEventListener('visibilitychange',()=>{visible=!document.hidden});
const hero=document.querySelector('.hero'),sky=document.querySelector('.night-sky'),landscape=document.querySelector('.hero-photo');
// Conservative clear-sky boundary in original-photo coordinates; excludes trees, clouds and ridgeline.
const skyBoundary=[[.50,0],[1,0],[1,.025],[.94,.035],[.88,.055],[.82,.09],[.76,.14],[.70,.17],[.64,.19],[.58,.20],[.54,.19],[.50,.17]];
function clipClearSky(ctx){if(!landscape.naturalWidth)return false;const image=landscape.getBoundingClientRect(),section=hero.getBoundingClientRect(),style=getComputedStyle(landscape),position=style.objectPosition.split(' ').map(v=>parseFloat(v)/100),scale=Math.max(image.width/landscape.naturalWidth,image.height/landscape.naturalHeight),width=landscape.naturalWidth*scale,height=landscape.naturalHeight*scale,left=image.left-section.left+(image.width-width)*position[0],top=image.top-section.top+(image.height-height)*position[1];ctx.beginPath();skyBoundary.forEach(([x,y],i)=>{if(i===0)ctx.moveTo(left+x*width,top+y*height);else ctx.lineTo(left+x*width,top+y*height)});ctx.closePath();ctx.clip();return true;}
if(sky){const ctx=sky.getContext('2d');let active=true,w=1,h=1,last=0,next=3,meteors=[];let seed=27;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};const stars=Array.from({length:115},()=>({x:rnd(),y:rnd()*.49,r:.4+rnd()*.9,a:.18+rnd()*.55,phase:rnd()*6.28,speed:.003+rnd()*.004}));
new ResizeObserver(()=>{w=hero.clientWidth;h=hero.clientHeight;const d=Math.min(devicePixelRatio||1,1.5);sky.width=w*d;sky.height=h*d;ctx.setTransform(d,0,0,d,0,0)}).observe(hero);
new IntersectionObserver(e=>{active=e[0].isIntersecting}).observe(hero);
function draw(ms){requestAnimationFrame(draw);if(reduced.matches||!visible||!active||ms-last<32)return;last=ms;const t=ms/1000;ctx.clearRect(0,0,w,h);ctx.save();if(!clipClearSky(ctx)){ctx.restore();return;}for(const s of stars){const x=((s.x+t*s.speed*.012)%1)*w,y=s.y*h;ctx.globalAlpha=s.a*(.7+.3*Math.sin(t*.65+s.phase));ctx.fillStyle='#e9f2ff';ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
if(t>next){meteors.push({start:t,x:w*(.25+rnd()*.65),y:h*(.04+rnd()*.15),len:Math.min(w*.22,230)});next=t+6+rnd()*5;}
meteors=meteors.filter(m=>t-m.start<1.35);for(const m of meteors){const a=(t-m.start)/1.35,x=m.x-a*w*.3,y=m.y+a*h*.22,tail=m.len*Math.sin(Math.PI*a),g=ctx.createLinearGradient(x,y,x+tail,y-tail*.45);g.addColorStop(0,'rgba(235,247,255,.95)');g.addColorStop(1,'rgba(200,225,255,0)');ctx.globalAlpha=Math.sin(Math.PI*a);ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+tail,y-tail*.45);ctx.stroke();}ctx.globalAlpha=1;ctx.restore();}
requestAnimationFrame(draw);}
const vertex=`attribute vec2 a;varying vec2 uv;void main(){uv=vec2((a.x+1.0)*.5,(1.0-a.y)*.5);gl_Position=vec4(a,0.,1.);}`;
const fragment=`precision highp float;varying vec2 uv;uniform sampler2D image;uniform float t;uniform float scene;uniform vec4 view;
float oval(vec2 p,vec2 c,vec2 r){vec2 q=(p-c)/r;return exp(-dot(q,q)*2.0);}
vec2 rot(vec2 p,vec2 c,float a){float co=cos(a),si=sin(a);return c+mat2(co,-si,si,co)*(p-c);}
void main(){vec2 p=uv*view.xy+view.zw;vec2 q=p;float light=1.;
if(scene<.5){
float beat=sin(t*5.8),alt=sin(t*5.8+3.14159);
float arm=oval(p,vec2(.785,.405),vec2(.046,.15));float left=oval(p,vec2(.65,.57),vec2(.075,.105));
q=mix(q,rot(p,vec2(.777,.495),beat*.18),arm);
q=mix(q,rot(p,vec2(.687,.52),alt*.12),left);
float membrane=oval(p,vec2(.385,.405),vec2(.054,.25));float hit=pow(max(0.,sin(t*5.8)),12.);q.x+=membrane*hit*.0025*sin(p.y*80.-t*28.);
float torso=oval(p,vec2(.739,.57),vec2(.066,.12));q.x+=torso*beat*.0015;
}else{
vec3 source=texture2D(image,p).rgb;float warmth=smoothstep(.05,.30,source.r-source.b)*smoothstep(.12,.6,source.r);
float region=smoothstep(.55,.72,p.x)*(1.-smoothstep(.70,.87,p.y))*smoothstep(.08,.22,p.y);
float flame=warmth*region;float wave=sin(p.y*34.-t*5.2)+.42*sin(p.y*67.-t*8.1+p.x*21.);
q.x+=wave*.009*flame;q.y+=(sin(p.x*45.+t*6.)*.006+sin(t*4.1)*.004)*flame;
float heat=oval(p,vec2(.83,.30),vec2(.17,.23));q.x+=sin(p.y*90.-t*7.5)*.0018*heat;
light+=flame*(sin(t*7.3)*.045+sin(t*11.7)*.025);
}gl_FragColor=vec4(texture2D(image,clamp(q,vec2(.001),vec2(.999))).rgb*light,1.);}`;
for(const canvas of document.querySelectorAll('.living-photo')){
const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl){canvas.hidden=true;continue;}
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s;}
try{const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');gl.useProgram(program);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
const timeLoc=gl.getUniformLocation(program,'t'),viewLoc=gl.getUniformLocation(program,'view');gl.uniform1f(gl.getUniformLocation(program,'scene'),canvas.dataset.scene==='taiko'?0:1);gl.uniform1i(gl.getUniformLocation(program,'image'),0);
let active=false,ready=false,last=0;const section=canvas.closest('section');new IntersectionObserver(e=>{active=e[0].isIntersecting}).observe(section);
const img=new Image();img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);ready=true;canvas.dataset.motionReady='true';};img.onerror=()=>{canvas.hidden=true};img.src=canvas.dataset.image;
function frame(ms){requestAnimationFrame(frame);if(!ready||!active||!visible||reduced.matches||ms-last<32)return;last=ms;const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio||1,1.4),cw=Math.round(w*d),ch=Math.round(h*d);if(!w||!h)return;if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;gl.viewport(0,0,cw,ch);}const scale=Math.max(w/img.width,h/img.height),vx=w/(img.width*scale),vy=h/(img.height*scale),focus=innerWidth<=640?(canvas.dataset.scene==='taiko'?.62:.65):.5;gl.useProgram(program);gl.uniform4f(viewLoc,vx,vy,(1-vx)*focus,(1-vy)*.5);gl.uniform1f(timeLoc,ms/1000);gl.drawArrays(gl.TRIANGLES,0,6);}
requestAnimationFrame(frame);canvas.addEventListener('webglcontextlost',e=>{canvas.hidden=true;});
}catch{canvas.hidden=true;}
}
})();
