const MOODS = { office: [55, 82.41], hub: [65.41, 98], approval: [61.74, 92.5], button: [73.42, 110], loop: [51.91, 77.78], archive: [65.41, 130.81], gallery: [55, 110], observatory: [65.41, 196], garden: [87.31, 174.61], quiet: [73.42, 146.83], records: [61.74, 110], mirror: [58.27, 116.54], stairwell: [55, 110], workshop: [69.3, 138.59], flood: [49, 98], rooftop: [65.41, 196] };
export class Soundscape {
  constructor() { this.enabled=true; this.voice=false; this.room='office'; this.ctx=null; this.nextNote=0; this.voices=[]; if('speechSynthesis' in window) { this.voices=speechSynthesis.getVoices(); speechSynthesis.addEventListener('voiceschanged',()=>{this.voices=speechSynthesis.getVoices();}); } }
  unlock() {
    if(!this.ctx) {
      const Context=window.AudioContext || window.webkitAudioContext;
      if(!Context) return;
      this.ctx=new Context(); this.master=this.ctx.createGain(); this.master.gain.value=this.enabled?0.32:0; this.master.connect(this.ctx.destination);
      this.drone=this.ctx.createGain(); this.drone.gain.value=0.09; this.drone.connect(this.master);
      this.osc=[0,1].map((_,i)=>{const o=this.ctx.createOscillator();o.type='sine';o.frequency.value=MOODS[this.room][i];o.connect(this.drone);o.start();return o;});
      const size=this.ctx.sampleRate*2; const noise=this.ctx.createBuffer(1,size,this.ctx.sampleRate); const data=noise.getChannelData(0); let v=0;
      for(let i=0;i<size;i++) { v=(v+(Math.random()*2-1)*0.04)/1.02; data[i]=v; }
      const source=this.ctx.createBufferSource();source.buffer=noise;source.loop=true;
      const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=480;
      const gain=this.ctx.createGain();gain.gain.value=0.16;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();
    }
    if(this.ctx.state==='suspended') this.ctx.resume().catch(()=>{});
  }
  mood(room) { this.room=room; if(this.ctx) this.osc.forEach((o,i)=>o.frequency.setTargetAtTime(MOODS[room][i],this.ctx.currentTime,1.2)); }
  mute(muted) { this.enabled=!muted; if(this.ctx) this.master.gain.setTargetAtTime(muted?0:0.32,this.ctx.currentTime,0.18); if(muted && 'speechSynthesis' in window) speechSynthesis.cancel(); }
  tone(hz,duration=0.16,volume=0.1,type='sine') {
    if(!this.ctx || !this.enabled) return; const now=this.ctx.currentTime;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(volume,now+0.012);g.gain.exponentialRampToValueAtTime(0.0001,now+duration);o.connect(g);g.connect(this.master);o.start();o.stop(now+duration+0.05);
  }
  step() { this.tone(this.room==='garden'?120:90,0.07,0.075,'triangle'); }
  click() { this.tone(420,0.09,0.13,'triangle'); }
  transition() { [196,293.66,392].forEach((hz,i)=>setTimeout(()=>this.tone(hz,1.1,0.06),i*100)); }
  update(time) {
    if(time<this.nextNote) return; this.nextNote=time+3.4;
    if(['archive','observatory','garden','quiet','mirror','flood','rooftop','records'].includes(this.room)) {
      const notes=this.room==='garden'?[174.61,220,261.63,349.23,440]:[130.81,196,261.63,329.63,392];this.tone(notes[Math.floor(time/3.4)%notes.length],2.5,0.05);
    }
  }
  narrate(text) {
    if(!this.voice || !this.enabled || !('speechSynthesis' in window)) return;
    const voice=this.voices.find(v=>v.localService && v.lang.startsWith('en') && /David|Daniel|George/.test(v.name)) || this.voices.find(v=>v.localService && v.lang.startsWith('en'));
    if(!voice) return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.rate=0.94;u.pitch=0.83;u.volume=0.65;speechSynthesis.speak(u);
  }
  stopVoice() { if('speechSynthesis' in window) speechSynthesis.cancel(); }
}
