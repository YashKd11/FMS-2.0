import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const token = localStorage.getItem('token')
  return (
    <div className="overflow-hidden">
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 border border-indigo-100 hover:bg-indigo-600 hover:text-white ease-in-out">
              v2.0 Now Available
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
              Turn Feedback into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Actionable Growth
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Collect, analyze, and act on customer feedback in real-time. 
              The minimalistic dashboard designed for modern teams.
            </p>
            <div className="flex justify-center gap-4">
              <Link to={token ? "/dashboard" : "/login"} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link to="/features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8"
        >
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { label: 'Active Users', val: '12,403' },
                { label: 'Feedback Items', val: '8,230' },
                { label: 'Avg Rating', val: '4.8/5' }
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-3xl font-bold text-slate-900">{stat.val}</div>
                  <div className="text-slate-500 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;