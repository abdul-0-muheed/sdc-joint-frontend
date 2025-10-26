// app/complaint_form/manage/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { Navbar } from '@/components/app/navbar';
import { useRouter } from 'next/navigation';

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Check user session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        let query = supabase
          .from('student_complaints')
          .select('*')
          .order('created_at', { ascending: false });

        if (statusFilter !== 'All') {
          query = query.eq('status', statusFilter);
        }

        if (searchTerm) {
          query = query.or(
            `student_name.ilike.%${searchTerm}%,student_email.ilike.%${searchTerm}%,complaint_text.ilike.%${searchTerm}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;
        setComplaints(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchComplaints();
    }
  }, [user, statusFilter, searchTerm]);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('student_complaints')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh complaints
      const { data, error: fetchError } = await supabase
        .from('student_complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setComplaints(data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRespond = async (complaint) => {
    if (!user) return;
    
    try {
      // Update status to "In Progress" when responding
      const { error } = await supabase
        .from('student_complaints')
        .update({ 
          status: 'In Progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaint.id);
      
      if (error) throw error;
      
      // Refresh complaints
      const { data, error: fetchError } = await supabase
        .from('student_complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setComplaints(data || []);
      
      // Create email content
      const subject = encodeURIComponent(`Response to your Complaint`);
      const body = encodeURIComponent(
        `Dear ${complaint.student_name},\n\n` +
        `Thank you for bringing your concern to our attention. We have received your complaint regarding ${complaint.department || 'your department'}:\n\n` +
        `"${complaint.complaint_text}"\n\n` +
        `We are reviewing your complaint and will take appropriate action. We will contact you again once the matter has been resolved.\n\n` +
        `If you have any further questions or need additional information, please don't hesitate to contact us.\n\n` +
        `Best regards,\n` +
        `Complaints Management Team`
      );
      
      // Open email client with pre-filled content
      window.open(`mailto:${complaint.student_email}?subject=${subject}&body=${body}`, '_blank');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Loading...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300 text-center">
            <h3>Please log in to view complaints</h3>
            <button 
              className='mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
              onClick={() => router.push("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Complaints</h1>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Complaints
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or content..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Complaint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {complaints.length > 0 ? (
                    complaints.map((complaint, index) => (
                      <motion.tr
                        key={complaint.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{complaint.student_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{complaint.student_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {complaint.department || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {complaint.complaint_text}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            complaint.status === 'Pending' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                              : complaint.status === 'In Progress' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : complaint.status === 'Resolved' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {format(parseISO(complaint.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={complaint.status}
                              onChange={(e) => handleUpdateStatus(complaint.id, e.target.value)}
                              className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <button
                              onClick={() => handleRespond(complaint)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                            >
                              Respond
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">No complaints found</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageComplaints;