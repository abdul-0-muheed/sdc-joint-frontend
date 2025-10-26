// app/complaint_form/submit/page.js
'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/app/navbar';

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    department: '',
    complaint_text: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('student_complaints')
        .insert([{
          ...formData,
          status: 'Pending'
        }]);
      
      if (error) throw error;
      
      setSuccess(true);
      setFormData({
        student_name: '',
        student_email: '',
        department: '',
        complaint_text: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Submit a Complaint</h1>
            
            {success ? (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Complaint submitted successfully! We'll review it shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="student_name"
                      value={formData.student_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="student_email"
                      value={formData.student_email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                                            
                
                    <option value="Aeronautical Engineering">Aeronautical Engineering (B.E.)</option>
                    <option value="Civil Engineering">Civil Engineering (B.E.)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering (B.E.)</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (B.E.)</option>
                    <option value="Information Science & Engineering">Information Science & Engineering (B.E.)</option>
                    <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                    <option value="Training and Placement Department">Training and Placement Department</option>
                    <option value="Shree Devi College of Interior Design">Shree Devi College of Interior Design</option>
                    <option value="ECE Department (Example Lab Detail)">ECE Department (Example Lab Detail)</option>

                    <option value="Shree Devi College of Pharmacy">Shree Devi College of Pharmacy (B.Pharm, D.Pharm)</option>
                    <option value="Shree Devi College of Physiotherapy">Shree Devi College of Physiotherapy (BPT)</option>
                    <option value="Shree Devi College of Nursing">Shree Devi College of Nursing (B.Sc. Nursing, GNM)</option>
                    <option value="Shree Devi School Of Nursing">Shree Devi School Of Nursing (GNM)</option>
                    <option value="Shree Devi College of Hotel Management">Shree Devi College of Hotel Management (BHM, B.Sc, Diploma)</option>
                    <option value="Sri Devi College of Fashion Design">Sri Devi College of Fashion Design</option>
                    <option value="Shree Devi College of Allied Health Sciences">Shree Devi College of Allied Health Sciences (B.Sc. MLT, B.Sc. MIT)</option>
                    <option value="Department of Computer Applications (MCA)">Department of Computer Applications (MCA)</option>
                    <option value="Management Studies - BBM">Management Studies (BBM)</option>
                    <option value="Management Studies - BHRD">Management Studies (BHRD)</option>
                    <option value="Management Studies - BCA">Management Studies (BCA)</option>
                    <option value="Management Studies - B.Com">Management Studies (B.Com)</option>
                    <option value="Food Technology Department">Food Technology Department</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Complaint Details *
                    </label>
                    <textarea
                      name="complaint_text"
                      value={formData.complaint_text}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Please describe your complaint in detail..."
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div className="mt-8">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SubmitComplaint;