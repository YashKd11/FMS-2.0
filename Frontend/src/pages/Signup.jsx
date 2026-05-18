import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });

  const API = axios.create({
    baseURL: 'https://fms-2-0.onrender.com/api/users'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters required';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage({ type: '', text: '' });

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await API.post('/signup', {
        username: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      setServerMessage({
        type: 'success',
        text: 'Account created successfully!'
      });
      
      setTimeout(() => {
        navigate('/reports');
      }, 1000);

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

    } catch (err) {
      setServerMessage({
        type: 'error',
        text: err.response?.data?.message || 'Signup failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (field) => {
    return `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-300'
        : 'border-slate-300 focus:ring-indigo-300'
    }`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        {serverMessage.text && (
          <div className={`mb-4 p-2 text-sm rounded ${
            serverMessage.type === 'error'
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600'
          }`}>
            {serverMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className={getInputClass('fullName')}
          />
          {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-3 ${getInputClass('email')}`}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={`mt-3 ${getInputClass('password')}`}
          />
          {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`mt-3 ${getInputClass('confirmPassword')}`}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-5 bg-indigo-600 text-white py-2 rounded-lg"
          >
            {isLoading ? 'Creating...' : 'Sign Up'}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Signup;