// Vercel Serverless Function. Configure OPENAI_API_KEY in Vercel project settings.
const catalogue=require('../catalogue.json');
const SYSTEM=`You are the Saldus Opportunity Finder career and reskilling guide for working adults aged 25–33 in Saldus, Latvia.
Respond naturally, with varied, specific and actionable guidance, in the language requested (English, Latvian, or Russian). Understand free-form questions, follow-ups and the conversation history. If user asks about website design, prioritize UI/UX, Figma, HTML/CSS and related skills; never suggest unrelated courses as if they match.
Use the supplied DEMO CATALOGUE for course recommendations. Only recommend catalogue IDs that actually match the user's goal, and NEVER invent listings, dates, venues, registrations, prices, course availability, or links. If no matching demo course exists, say so and give useful general learning guidance instead. All catalogue entries are FICTIONAL and NOT current verified Saldus events. Make that distinction clear whenever recommending courses.
Ask at most one useful clarifying question when it helps. Do not demand personal details. Never promise employment or certifications.
Return ONLY JSON object with fields: reply (string), courseIds (array of integer IDs, up to 4). Do not include Markdown code fences.`;
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Server AI key not configured'});
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  const message=String(body.message||'').trim();
  if(!message||message.length>2000)return res.status(400).json({error:'Message must be 1–2000 characters'});
  const language=['en','lv','ru'].includes(body.language)?body.language:'en';
  const history=Array.isArray(body.history)?body.history.slice(-12).filter(x=>['user','assistant'].includes(x?.role)&&typeof x?.content==='string').map(x=>({role:x.role,content:x.content.slice(0,2000)})):[];
  const compact=catalogue.map(x=>({id:x.id,title:x.t,category:x.c,priceEUR:x.p,description:x.d,date:x.date,organiser:x.org}));
  const payload={model:process.env.OPENAI_MODEL||'gpt-4.1-mini',temperature:0.6,response_format:{type:'json_object'},messages:[{role:'system',content:SYSTEM+'\nRequested response language: '+language+'\nDEMO CATALOGUE: '+JSON.stringify(compact)},...history,{role:'user',content:message}],max_tokens:850};
  const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});
  const out=await r.json();if(!r.ok){console.error('OpenAI request failed',r.status,out?.error?.type);return res.status(502).json({error:'AI provider request failed'})}
  let parsed=JSON.parse(out.choices?.[0]?.message?.content||'{}');
  if(typeof parsed.reply!=='string'||!parsed.reply.trim())throw Error('Invalid model response');
  const ids=Array.isArray(parsed.courseIds)?[...new Set(parsed.courseIds.map(Number))].filter(id=>catalogue.some(x=>x.id===id)).slice(0,4):[];
  return res.status(200).json({reply:parsed.reply.slice(0,3500),courseIds:ids});
 }catch(e){console.error('Chat failed',e?.message);return res.status(500).json({error:'Unable to complete AI request'})}
};