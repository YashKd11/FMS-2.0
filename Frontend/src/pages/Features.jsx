import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, BarChart3, Users, Layers, MessageSquare } from 'lucide-react';

const features = [
  { icon: <Zap size={24} />, title: 'Real-time Sync', desc: 'Feedback updates instantly across all devices.' },
  { icon: <Shield size={24} />, title: 'Secure Data', desc: 'Enterprise-grade encryption for all your data.' },
  { icon: <BarChart3 size={24} />, title: 'Deep Analytics', desc: 'Visualize trends with automated reports.' },
  { icon: <Users size={24} />, title: 'Team Collaboration', desc: 'Assign tasks and comment on feedback.' },
  { icon: <Layers size={24} />, title: 'Integrations', desc: 'Works with Slack, Jira, and GitHub.' },
  { icon: <MessageSquare size={24} />, title: 'Public Roadmap', desc: 'Let users vote on what to build next.' },
];

const Features = () => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need</h2>
          <p className="mt-4 text-slate-600">Powerful features wrapped in a simple interface.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => ( 
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm mb-6 group-hover:scale-110 transition-transform cursor-pointer">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default Features;