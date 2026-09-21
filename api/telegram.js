export default async function handler(req, res) {
  const allowedOrigin='https://luiskabuto.github.io';
  res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Method not allowed'});
  const token=process.env.TELEGRAM_BOT_TOKEN,chatId=process.env.TELEGRAM_CHAT_ID,firebaseApiKey=process.env.FIREBASE_WEB_API_KEY;
  if(!token||!chatId||!firebaseApiKey)return res.status(500).json({ok:false,error:'Telegram no configurado en el servidor'});
  const authHeader=String(req.headers.authorization||''),idToken=authHeader.startsWith('Bearer ')?authHeader.slice(7).trim():'';
  if(!idToken)return res.status(401).json({ok:false,error:'Sesión no válida'});
  try{
    const authCheck=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idToken})});
    const authData=await authCheck.json();
    if(!authCheck.ok||!authData.users?.length||authData.users[0].disabled)return res.status(401).json({ok:false,error:'Sesión Firebase no válida'});
    const body=req.body||{},text=String(body.text||'').trim();
    if(!text||text.length>4096)return res.status(400).json({ok:false,error:'Mensaje inválido'});
    const telegram=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})});
    const data=await telegram.json();
    if(!telegram.ok||!data.ok)return res.status(502).json({ok:false,error:data.description||'Telegram rechazó el mensaje'});
    return res.status(200).json({ok:true});
  }catch(error){return res.status(502).json({ok:false,error:error.message||'Error enviando Telegram'});}
}