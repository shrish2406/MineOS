import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage () {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />
  async function submit (event: FormEvent) {
    event.preventDefault()
    setError('')
    if (!email.trim()) return setError('Enter your registered email address.')
    if (mode === 'register' && name.trim().length < 2)
      return setError('Enter your name using at least 2 characters.')
    if (password.length < 8)
      return setError('Password must contain at least 8 characters.')
    setWorking(true)
    const result =
      mode === 'login'
        ? await login(email, password, remember)
        : await register(name, email, password, remember)
    setWorking(false)
    if (!result.success)
      return setError(result.message ?? 'Unable to complete the request.')
    navigate('/dashboard')
  }
  const registerMode = mode === 'register'
  return (
    <main className='lg:grid lg:grid-cols-[1.05fr_.95fr] bg-slate-100 min-h-screen'>
      <section className='hidden relative lg:flex lg:flex-col lg:justify-between bg-minsos-900 px-12 py-12 overflow-hidden'>
        <div className='-top-24 -right-32 absolute border border-cyan-300/10 rounded-full w-96 h-96' />
        <div className='bottom-0 left-0 absolute bg-[linear-gradient(135deg,transparent_45%,rgba(12,92,156,.18)_45%,rgba(12,92,156,.18)_55%,transparent_55%)] w-full h-64' />
        <div className='relative flex items-center gap-4'>
          <img
            src='/logo.jpeg'
            alt='MINSOS logo'
            className='rounded-xl w-14 h-14 object-cover'
          />
          <div>
            <p className='font-bold text-white text-xl tracking-[.14em]'>
              MINSOS
            </p>
            <p className='text-slate-400 text-sm'>
              Mining Intelligence & Smart Operations System
            </p>
          </div>
        </div>
        <div className='relative max-w-lg'>
          <p className='font-semibold text-cyan-300 text-xs uppercase tracking-[.2em]'>
            Governance workspace
          </p>
          <h1 className='mt-5 font-semibold text-white text-4xl leading-tight'>
            Clear oversight for safer, compliant mine operations.
          </h1>
          <p className='mt-6 text-slate-300 text-base leading-7'>
            A single operational view for compliance, inspections, corrective
            actions and governance monitoring across coal mines.
          </p>
          <div className='gap-5 grid grid-cols-3 mt-10 pt-6 border-white/10 border-t text-sm'>
            <div>
              <p className='font-bold text-white text-2xl'>18</p>
              <p className='mt-1 text-slate-400'>Mines monitored</p>
            </div>
            <div>
              <p className='font-bold text-white text-2xl'>Secure</p>
              <p className='mt-1 text-slate-400'>Server sign-in</p>
            </div>
            <div>
              <p className='font-bold text-white text-2xl'>24/7</p>
              <p className='mt-1 text-slate-400'>Visibility</p>
            </div>
          </div>
        </div>
        <p className='relative text-slate-500 text-xs'>
          Local development environment · Authentication is backed by the MINSOS
          API
        </p>
      </section>
      <section className='flex justify-center items-center px-5 sm:px-10 py-10 min-h-screen'>
        <div className='w-full max-w-md'>
          <div className='lg:hidden flex items-center gap-3 mb-9'>
            <img
              src='/logo.jpeg'
              alt='MINSOS logo'
              className='rounded-lg w-11 h-11 object-cover'
            />
            <div>
              <p className='font-bold text-minsos-900 tracking-[.14em]'>
                MINSOS
              </p>
              <p className='text-slate-500 text-xs'>Governance workspace</p>
            </div>
          </div>
          <p className='font-semibold text-minsos-600 text-sm'>
            {registerMode ? 'Account setup' : 'Secure access'}
          </p>
          <h2 className='mt-2 font-bold text-slate-900 text-3xl tracking-tight'>
            {registerMode ? 'Create local access' : 'Sign in to your workspace'}
          </h2>
          <p className='mt-3 text-slate-600 text-sm leading-6'>
            {registerMode
              ? 'Create a development account. Your backend role controls available API permissions.'
              : 'Sign in using an account registered in the MINSOS backend.'}
          </p>
          <form onSubmit={submit} className='space-y-5 mt-8' noValidate>
            {registerMode && (
              <div>
                <label
                  htmlFor='name'
                  className='block mb-1.5 font-semibold text-slate-700 text-sm'
                >
                  Full name
                </label>
                <input
                  id='name'
                  value={name}
                  onChange={event => setName(event.target.value)}
                  autoComplete='name'
                  placeholder='Your name'
                  className='bg-white px-3.5 py-3 border border-slate-300 focus:border-minsos-500 rounded-lg outline-none focus:ring-4 focus:ring-minsos-100 w-full placeholder:text-slate-400 text-sm transition'
                />
              </div>
            )}
            <div>
              <label
                htmlFor='email'
                className='block mb-1.5 font-semibold text-slate-700 text-sm'
              >
                Registered email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete='username'
                placeholder='name@organisation.gov.in'
                className='bg-white px-3.5 py-3 border border-slate-300 focus:border-minsos-500 rounded-lg outline-none focus:ring-4 focus:ring-minsos-100 w-full placeholder:text-slate-400 text-sm transition'
              />
            </div>
            <div>
              <label
                htmlFor='password'
                className='block mb-1.5 font-semibold text-slate-700 text-sm'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={visible ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete={
                    registerMode ? 'new-password' : 'current-password'
                  }
                  placeholder='Minimum 8 characters'
                  className='bg-white px-3.5 py-3 pr-14 border border-slate-300 focus:border-minsos-500 rounded-lg outline-none focus:ring-4 focus:ring-minsos-100 w-full placeholder:text-slate-400 text-sm transition'
                />
                <button
                  type='button'
                  onClick={() => setVisible(!visible)}
                  className='right-0 absolute inset-y-0 px-3.5 font-semibold text-minsos-600 hover:text-minsos-800 text-xs'
                >
                  {visible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && (
              <p
                role='alert'
                className='bg-red-50 px-3 py-2.5 border border-red-200 rounded-lg text-red-700 text-sm'
              >
                {error}
              </p>
            )}
            <label className='flex items-center gap-2 text-slate-600 text-sm cursor-pointer'>
              <input
                type='checkbox'
                checked={remember}
                onChange={event => setRemember(event.target.checked)}
                className='border-slate-300 rounded focus:ring-minsos-500 w-4 h-4 text-minsos-600'
              />
              Remember this device
            </label>
            <button
              disabled={working}
              className='bg-minsos-600 hover:bg-minsos-700 disabled:opacity-70 shadow-sm px-4 py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-minsos-200 w-full font-semibold text-white text-sm transition disabled:cursor-wait'
            >
              {working
                ? 'Contacting MINSOS…'
                : registerMode
                ? 'Create account'
                : 'Access MINSOS'}
            </button>
          </form>
          <button
            type='button'
            onClick={() => {
              setMode(registerMode ? 'login' : 'register')
              setError('')
            }}
            className='mt-5 w-full font-semibold text-minsos-600 hover:text-minsos-800 text-sm text-center'
          >
            {registerMode
              ? 'Already have an account? Sign in'
              : 'Need local development access? Create an account'}
          </button>
          <p className='mt-6 text-slate-500 text-xs text-center leading-5'>
            Development authentication is connected to the backend. Production
            account approval and role assignment will be controlled by the
            server.
          </p>
        </div>
      </section>
    </main>
  )
}
