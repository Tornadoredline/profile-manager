import { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';

export const useProfiles = (category = 'personal') => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    banned: 0,
    sold: 0
  });

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileAPI.getProfiles(category);
      setProfiles(data);
      calculateStats(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch profiles');
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (profilesData) => {
    const stats = {
      total: profilesData.length,
      active: profilesData.filter(p => p.status === 'active').length,
      pending: profilesData.filter(p => p.status === 'pending').length,
      banned: profilesData.filter(p => p.status === 'banned').length,
      sold: profilesData.filter(p => p.status === 'sold').length
    };
    setStats(stats);
  };

  const createProfile = async (profileData) => {
    try {
      const newProfile = await profileAPI.createProfile(profileData);
      setProfiles(prev => [newProfile, ...prev]);
      return { success: true, profile: newProfile };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create profile' 
      };
    }
  };

  const updateProfile = async (id, profileData) => {
    try {
      const updatedProfile = await profileAPI.updateProfile(id, profileData);
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === id ? updatedProfile : profile
        )
      );
      return { success: true, profile: updatedProfile };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile' 
      };
    }
  };

  const deleteProfile = async (id) => {
    try {
      await profileAPI.deleteProfile(id);
      setProfiles(prev => prev.filter(profile => profile.id !== id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete profile' 
      };
    }
  };

  const bulkDeleteProfiles = async (ids) => {
    try {
      await Promise.all(ids.map(id => profileAPI.deleteProfile(id)));
      setProfiles(prev => prev.filter(profile => !ids.includes(profile.id)));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete profiles' 
      };
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [category]);

  return {
    profiles,
    loading,
    error,
    stats,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    bulkDeleteProfiles
  };
};