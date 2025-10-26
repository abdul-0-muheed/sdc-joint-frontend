// app/EventsActivities/get_club_details/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/app/navbar';

const GetClubDetails = () => {
  const router = useRouter();
  const [clubs, setClubs] = useState([]);
  const [programs, setPrograms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('club'); // 'club' or 'program'
  const [currentClub, setCurrentClub] = useState({
    club_name: '',
    description: '',
    head_of_club: '',
    contact_email: ''
  });
  const [currentProgram, setCurrentProgram] = useState({
    club_id: '',
    program_name: '',
    description: '',
    program_date: '',
    start_time: '',
    end_time: '',
    venue: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [viewMode, setViewMode] = useState('clubs'); // 'clubs' or 'programs'

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

  // Fetch clubs and programs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clubs
        let clubsQuery = supabase
          .from('clubs')
          .select('*')
          .order('club_name', { ascending: true });

        if (departmentFilter) {
          clubsQuery = clubsQuery.ilike('club_name', `%${departmentFilter}%`);
        }

        const { data: clubsData, error: clubsError } = await clubsQuery;

        if (clubsError) throw clubsError;

        setClubs(clubsData || []);

        // Fetch all programs
        const { data: programsData, error: programsError } = await supabase
          .from('club_programs')
          .select('*')
          .order('program_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (programsError) throw programsError;

        // Group programs by club_id
        const groupedPrograms = {};
        (programsData || []).forEach(program => {
          if (!groupedPrograms[program.club_id]) {
            groupedPrograms[program.club_id] = [];
          }
          groupedPrograms[program.club_id].push(program);
        });

        setPrograms(groupedPrograms);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [departmentFilter]);

  const handleClubChange = (e) => {
    const { name, value } = e.target;
    setCurrentClub(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProgramChange = (e) => {
    const { name, value } = e.target;
    setCurrentProgram(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClubSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('clubs')
          .update(currentClub)
          .eq('id', currentClub.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clubs')
          .insert([currentClub]);
        
        if (error) throw error;
      }
      
      // Refresh data
      const { data: clubsData, error: fetchError } = await supabase
        .from('clubs')
        .select('*')
        .order('club_name', { ascending: true });

      if (fetchError) throw fetchError;
      setClubs(clubsData);
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProgramSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditingProgram) {
        const { error } = await supabase
          .from('club_programs')
          .update(currentProgram)
          .eq('id', currentProgram.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('club_programs')
          .insert([currentProgram]);
        
        if (error) throw error;
      }
      
      // Refresh programs
      const { data: programsData, error: fetchError } = await supabase
        .from('club_programs')
        .select('*')
        .order('program_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      // Group programs by club_id
      const groupedPrograms = {};
      (programsData || []).forEach(program => {
        if (!groupedPrograms[program.club_id]) {
          groupedPrograms[program.club_id] = [];
        }
        groupedPrograms[program.club_id].push(program);
      });

      setPrograms(groupedPrograms);
      closeProgramModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClub = (club) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentClub(club);
    setIsEditing(true);
    setModalType('club');
    setIsModalOpen(true);
  };

  const handleDeleteClub = async (id) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this club and all its programs?')) return;
    
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh data
      const { data: clubsData, error: fetchError } = await supabase
        .from('clubs')
        .select('*')
        .order('club_name', { ascending: true });

      if (fetchError) throw fetchError;
      setClubs(clubsData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditProgram = (program) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentProgram(program);
    setIsEditingProgram(true);
    setModalType('program');
    setIsModalOpen(true);
  };

  const handleDeleteProgram = async (id) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    try {
      const { error } = await supabase
        .from('club_programs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh programs
      const { data: programsData, error: fetchError } = await supabase
        .from('club_programs')
        .select('*')
        .order('program_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;

      // Group programs by club_id
      const groupedPrograms = {};
      (programsData || []).forEach(program => {
        if (!groupedPrograms[program.club_id]) {
          groupedPrograms[program.club_id] = [];
        }
        groupedPrograms[program.club_id].push(program);
      });

      setPrograms(groupedPrograms);
    } catch (err) {
      setError(err.message);
    }
  };

  const openClubModal = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentClub({
      club_name: '',
      description: '',
      head_of_club: '',
      contact_email: ''
    });
    setIsEditing(false);
    setModalType('club');
    setIsModalOpen(true);
  };

  const openProgramModal = (clubId) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentProgram({
      club_id: clubId,
      program_name: '',
      description: '',
      program_date: '',
      start_time: '',
      end_time: '',
      venue: ''
    });
    setIsEditingProgram(false);
    setModalType('program');
    setIsModalOpen(true);
  };

  const closeProgramModal = () => {
    setIsModalOpen(false);
    setCurrentProgram({
      club_id: '',
      program_name: '',
      description: '',
      program_date: '',
      start_time: '',
      end_time: '',
      venue: ''
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentClub({
      club_name: '',
      description: '',
      head_of_club: '',
      contact_email: ''
    });
  };

  const viewClubPrograms = (club) => {
    setSelectedClub(club);
    setViewMode('programs');
  };

  const goBackToClubs = () => {
    setViewMode('clubs');
    setSelectedClub(null);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {viewMode === 'clubs' ? 'Clubs' : `${selectedClub?.club_name} Programs`}
            </h1>
            <div className="flex space-x-3">
              {viewMode === 'programs' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goBackToClubs}
                  className="px-4 py-2 bg-gray-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Back to Clubs
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={viewMode === 'clubs' ? openClubModal : () => openProgramModal(selectedClub?.id)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {viewMode === 'clubs' ? 'Add Club' : 'Add Program'}
              </motion.button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Department/Club Name
                </label>
                <input
                  type="text"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  placeholder="Search clubs..."
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

          {viewMode === 'clubs' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs?.length > 0 ? (
                clubs.map((club, index) => (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => viewClubPrograms(club)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{club.club_name}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mt-2">{club.description}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        {club.head_of_club && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Head: {club.head_of_club}</span>
                          </div>
                        )}
                        
                        {club.contact_email && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{club.contact_email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {programs[club.id]?.length || 0} programs
                        </span>
                        <div className="flex space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClub(club);
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClub(club.id);
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">No clubs found</div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{selectedClub?.club_name} Programs</h2>
                <p className="text-gray-600 dark:text-gray-300">{selectedClub?.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs[selectedClub?.id]?.length > 0 ? (
                  programs[selectedClub.id].map((program, index) => (
                    <motion.div
                      key={program.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{program.program_name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">{program.description}</p>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{format(parseISO(program.program_date), 'MMM dd, yyyy')}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{program.start_time} - {program.end_time}</span>
                          </div>
                          
                          {program.venue && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{program.venue}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            onClick={() => handleEditProgram(program)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(program.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400">No programs found for this club</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal for Add/Edit Club */}
          <AnimatePresence>
            {isModalOpen && modalType === 'club' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {isEditing ? 'Edit Club' : 'Add New Club'}
                  </h2>
                  
                  <form onSubmit={handleClubSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Club Name
                        </label>
                        <input
                          type="text"
                          name="club_name"
                          value={currentClub.club_name}
                          onChange={handleClubChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={currentClub.description}
                          onChange={handleClubChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Head of Club
                        </label>
                        <input
                          type="text"
                          name="head_of_club"
                          value={currentClub.head_of_club}
                          onChange={handleClubChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          name="contact_email"
                          value={currentClub.contact_email}
                          onChange={handleClubChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow hover:shadow-md transition-all"
                      >
                        {isEditing ? 'Update' : 'Add'} Club
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal for Add/Edit Program */}
          <AnimatePresence>
            {isModalOpen && modalType === 'program' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {isEditingProgram ? 'Edit Program' : 'Add New Program'}
                  </h2>
                  
                  <form onSubmit={handleProgramSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Program Name
                        </label>
                        <input
                          type="text"
                          name="program_name"
                          value={currentProgram.program_name}
                          onChange={handleProgramChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={currentProgram.description}
                          onChange={handleProgramChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Program Date
                        </label>
                        <input
                          type="date"
                          name="program_date"
                          value={currentProgram.program_date}
                          onChange={handleProgramChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="start_time"
                            value={currentProgram.start_time}
                            onChange={handleProgramChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            name="end_time"
                            value={currentProgram.end_time}
                            onChange={handleProgramChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Venue
                        </label>
                        <input
                          type="text"
                          name="venue"
                          value={currentProgram.venue}
                          onChange={handleProgramChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={closeProgramModal}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow hover:shadow-md transition-all"
                      >
                        {isEditingProgram ? 'Update' : 'Add'} Program
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default GetClubDetails;