import React, { useState } from 'react'

const ALL_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"
]

export function JoinForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: '',
    state: '',
    mobile: ''
  })
  
  const [joined, setJoined] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^\+?\d{7,15}$/.test(formData.mobile.replace(/[\s-()]/g, ''))) {
      newErrors.mobile = 'Invalid mobile format'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false)
      setJoined(true)
    }, 1000)
  }

  return (
    <div className="bg-[#0f8a4a]/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-lg shadow-xl max-w-xl mx-auto w-full transition-all duration-300">
      {joined ? (
        <div className="text-center py-10 animate-fade-in">
          <div className="w-16 h-16 bg-[#ffe14d] text-[#0f4a2c] rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg animate-bounce">
            ✓
          </div>
          <h3 
            className="text-white text-3xl font-black mb-3 tracking-wide uppercase"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            YOU'RE IN!
          </h3>
          <p className="text-[#dff5e8] text-base font-medium">
            Thank you for joining the movement. Together, we will build a better Nigeria 2.0.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input 
              type="text" 
              name="fullName"
              placeholder="Full name" 
              value={formData.fullName}
              onChange={handleChange}
              disabled={isSubmitting}
              className="interactive-input w-full rounded-sm bg-white px-5 py-4 font-semibold text-lg text-[#0f2a1c] placeholder:text-[#6b7a70] shadow-sm disabled:opacity-50"
            />
            {errors.fullName && <p className="text-[#ffe14d] text-xs font-bold mt-1 pl-2">{errors.fullName}</p>}
          </div>

          <div>
            <input 
              type="email" 
              name="email"
              placeholder="Email address" 
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className="interactive-input w-full rounded-sm bg-white px-5 py-4 font-semibold text-lg text-[#0f2a1c] placeholder:text-[#6b7a70] shadow-sm disabled:opacity-50"
            />
            {errors.email && <p className="text-[#ffe14d] text-xs font-bold mt-1 pl-2">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input 
                type="text" 
                name="location"
                placeholder="Location" 
                value={formData.location}
                onChange={handleChange}
                disabled={isSubmitting}
                className="interactive-input w-full rounded-sm bg-white px-5 py-4 font-semibold text-lg text-[#0f2a1c] placeholder:text-[#6b7a70] shadow-sm disabled:opacity-50"
              />
              {errors.location && <p className="text-[#ffe14d] text-xs font-bold mt-1 pl-2">{errors.location}</p>}
            </div>
            
            <div>
              <select 
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={isSubmitting}
                className="interactive-input w-full rounded-sm bg-white px-4 py-4 font-semibold text-lg text-[#0f2a1c] placeholder:text-[#6b7a70] shadow-sm cursor-pointer disabled:opacity-50"
              >
                <option value="">State</option>
                {ALL_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="text-[#ffe14d] text-xs font-bold mt-1 pl-2">{errors.state}</p>}
            </div>
          </div>

          <div>
            <input 
              type="tel" 
              name="mobile"
              placeholder="Mobile number" 
              value={formData.mobile}
              onChange={handleChange}
              disabled={isSubmitting}
              className="interactive-input w-full rounded-sm bg-white px-5 py-4 font-semibold text-lg text-[#0f2a1c] placeholder:text-[#6b7a70] shadow-sm disabled:opacity-50"
            />
            {errors.mobile && <p className="text-[#ffe14d] text-xs font-bold mt-1 pl-2">{errors.mobile}</p>}
          </div>

          <p className="text-[#dff5e8] font-semibold text-[11px] sm:text-xs leading-relaxed mt-1">
            Enter your phone number above to receive updates from Nigeria 2.0. By providing your mobile number, you agree to the{' '}
            <a href="#" className="text-white hover:underline font-bold">
              Privacy Policy &amp; Terms of Service
            </a>{' '}
            for recurring campaign messages.
          </p>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-primary w-full bg-[#ffe14d] text-[#0f4a2c] disabled:bg-[#ffe14d]/60 font-black text-xl sm:text-2xl tracking-wide py-4.5 rounded-sm shadow-md mt-2 cursor-pointer uppercase flex items-center justify-center gap-2"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-3 border-[#0f4a2c] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "JOIN THE MOVEMENT"
            )}
          </button>
        </form>
      )}
    </div>
  )
}
