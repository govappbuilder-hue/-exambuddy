'use client'
import { useState } from 'react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match!')
      return
    }
    if (password.length < 6) {
      setMessage('❌ Password must be 6+ characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('https://ttybrjpvrwlbxunterfl.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eWJyanB2cndsbHh1bnRlcmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTkzOTEsImV4cCI6MjA5MzYzNTM5MX0.cuvZ0RwwIT6ySurd7F6M4-FANjCBTJfpZ0zx9qTjUgk',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eWJyanB2cndsbHh1bnRlcmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTkzOTEsImV4cCI6MjA5MzYzNTM5MX0.cuvZ0RwwIT6ySurd7F6M4-FANjCBTJfpZ0zx9qTjUgk'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          data: { full_name: name.trim() }
        })
      })
      const data = await res.json()
      if (data.error || data.msg) {
        setMessage('❌ ' + (data.error_description || data.msg || data.error))
      } else {
        setMessage('✅ Account created successfully!')
      }
    } catch (err) {
      setMessage('❌ Network error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <div style={{width:'100%',maxWidth:'400px',padding:'32px',background:'white',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
        <h1 style={{textAlign:'center',color:'#2563eb',fontSize:'28px',fontWeight:'bold',marginBottom:'8px'}}>ExamBuddy 🎓</h1>
        <p style={{textAlign:'center',color:'#6b7280',marginBottom:'24px'}}>Create your free account</p>
        <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)}
          style={{width:'100%',padding:'12px',border:'1px solid #e5e7eb',borderRadius:'8px',marginBottom:'12px',fontSize:'14px',boxSizing:'border-box'}}/>
        <input type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)}
          style={{width:'100%',padding:'12px',border:'1px solid #e5e7eb',borderRadius:'8px',marginBottom:'12px',fontSize:'14px',boxSizing:'border-box'}}/>
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)}
          style={{width:'100%',padding:'12px',border:'1px solid #e5e7eb',borderRadius:'8px',marginBottom:'12px',fontSize:'14px',boxSizing:'border-box'}}/>
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}
          style={{width:'100%',padding:'12px',border:'1px solid #e5e7eb',borderRadius:'8px',marginBottom:'16px',fontSize:'14px',boxSizing:'border-box'}}/>
        {message && (
          <div style={{padding:'12px',borderRadius:'8px',marginBottom:'16px',textAlign:'center',background:message.includes('✅')?'#f0fdf4':'#fef2f2',color:message.includes('✅')?'#16a34a':'#dc2626'}}>
            {message}
          </div>
        )}
        <button onClick={handleRegister} disabled={loading}
          style={{width:'100%',padding:'12px',background:loading?'#93c5fd':'#2563eb',color:'white',border:'none',borderRadius:'8px',fontSize:'16px',fontWeight:'500',cursor:'pointer'}}>
          {loading ? '⏳ Creating...' : 'Create Account 🚀'}
        </button>
      </div>
    </main>
  )
}