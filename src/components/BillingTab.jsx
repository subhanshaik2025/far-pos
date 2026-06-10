
import { GOLD, BOR, SURF, TX, DIM, MU, inp, goldBtn, ghostBtn } from '../utils/theme';

export default function BillingTab({ products, cart, setCart, discount, setDiscount, discountType, setDiscountType, subtotal, gst, gstPct, grandTotal, discountAmt, loadingBill, completeBill, showToast }) {
  const addToCart = (p) => {
    if (p.stock !== undefined && p.stock <= 0) { showToast('Out of stock','error'); return; }
    const ex = cart.find(c => c.id === p.id);
    setCart(ex ? cart.map(c => c.id === p.id ? {...c, qty: c.qty+1} : c) : [...cart, {...p, qty:1}]);
  };
  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(cart.filter(c => c.id !== id));
    else setCart(cart.map(c => c.id === id ? {...c, qty} : c));
  };

  return (
    <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
      <div style={{flex:1,minWidth:260}}>
        <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 14px'}}>Products</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8}}>
          {products.map(p=>(
            <div key={p.id} onClick={()=>addToCart(p)} style={{background:SURF,border:'1px solid '+(p.stock<=0?'#4A2020':BOR),borderRadius:12,padding:'12px 14px',cursor:p.stock<=0?'not-allowed':'pointer',opacity:p.stock<=0?0.5:1}}>
              <p style={{fontWeight:600,fontSize:13,margin:'0 0 4px',color:TX}}>{p.name}</p>
              <p style={{fontSize:14,fontWeight:700,color:GOLD,margin:'0 0 4px'}}>Rs. {p.price}</p>
              {p.stock!==undefined&&<p style={{fontSize:10,color:p.stock<=5?'#F87171':DIM,margin:0}}>Stock: {p.stock}</p>}
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,minWidth:260}}>
        <p style={{fontSize:11,letterSpacing:2,color:GOLD,textTransform:'uppercase',margin:'0 0 14px'}}>Cart</p>
        {cart.length===0&&<p style={{color:DIM,fontSize:13}}>No items added yet</p>}
        {cart.map(item=>(
          <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #222'}}>
            <div style={{flex:1}}>
              <p style={{fontSize:13,color:'#CCC',margin:0}}>{item.name}</p>
              <p style={{fontSize:11,color:DIM,margin:'2px 0 0'}}>Rs. {item.price} each</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button onClick={()=>updateQty(item.id,item.qty-1)} style={{background:'#222',border:'1px solid #333',color:TX,width:26,height:26,borderRadius:6,cursor:'pointer',fontSize:14}}>-</button>
              <span style={{fontSize:13,fontWeight:600,minWidth:20,textAlign:'center'}}>{item.qty}</span>
              <button onClick={()=>updateQty(item.id,item.qty+1)} style={{background:'#222',border:'1px solid #333',color:TX,width:26,height:26,borderRadius:6,cursor:'pointer',fontSize:14}}>+</button>
              <span style={{fontWeight:600,fontSize:13,color:TX,minWidth:60,textAlign:'right'}}>Rs. {(item.price*item.qty).toLocaleString()}</span>
              <button onClick={()=>setCart(cart.filter(c=>c.id!==item.id))} style={{background:'#2A1010',border:'1px solid #4A2020',color:'#CC4444',borderRadius:6,padding:'2px 7px',cursor:'pointer',fontSize:12}}>×</button>
            </div>
          </div>
        ))}
        {cart.length>0&&(
          <div style={{marginTop:16}}>
            <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
              <span style={{fontSize:12,color:MU}}>Discount:</span>
              <input type='number' value={discount} onChange={e=>setDiscount(Number(e.target.value))} style={{...inp,width:80,padding:'6px 10px'}} placeholder='0' />
              <button onClick={()=>setDiscountType(discountType==='percent'?'flat':'percent')} style={{...ghostBtn,padding:'6px 12px',fontSize:12}}>{discountType==='percent'?'%':'Rs'}</button>
            </div>
            <div style={{borderTop:'1px solid #222',paddingTop:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13,color:MU}}><span>Subtotal</span><span style={{color:TX}}>Rs. {subtotal.toLocaleString()}</span></div>
              {discountAmt>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:5,fontSize:13,color:MU}}><span>Discount</span><span style={{color:'#F87171'}}>- Rs. {discountAmt.toLocaleString()}</span></div>}
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:13,color:MU}}><span>GST ({gstPct}%)</span><span style={{color:TX}}>Rs. {Math.round(gst).toLocaleString()}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:20,fontWeight:600,margin:'14px 0'}}><span>Total</span><span style={{color:GOLD}}>Rs. {Math.round(grandTotal).toLocaleString()}</span></div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>completeBill('cash')} disabled={loadingBill} style={{flex:1,padding:14,background:loadingBill?'#555':GOLD,color:'#000',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:loadingBill?'not-allowed':'pointer'}}>{loadingBill?'Saving...':'Cash'}</button>
                <button onClick={()=>completeBill('upi')} disabled={loadingBill} style={{flex:1,padding:14,background:'transparent',color:GOLD,border:'1px solid '+GOLD+'66',borderRadius:10,fontSize:14,fontWeight:600,cursor:loadingBill?'not-allowed':'pointer'}}>{loadingBill?'...':'UPI'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
