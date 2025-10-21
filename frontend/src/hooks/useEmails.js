import { useState, useEffect } from 'react';
import { emailAPI } from '../services/api';

export const useEmails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    used: 0,
    blocked: 0
  });

  const fetchEmails = async (page = 1, limit = 20, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await emailAPI.getEmails(page, limit, filters);
      setEmails(data.emails);
      setStats(data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch emails');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await emailAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching email stats:', err);
    }
  };

  const createEmail = async (emailData) => {
    try {
      const newEmail = await emailAPI.createEmail(emailData);
      setEmails(prev => [newEmail.email, ...prev]);
      await fetchStats();
      return { success: true, email: newEmail.email };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create email' 
      };
    }
  };

  const bulkCreateEmails = async (emailsData) => {
    try {
      const result = await emailAPI.bulkCreateEmails(emailsData);
      await fetchEmails();
      await fetchStats();
      return { success: true, result: result.results };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create emails' 
      };
    }
  };

  const updateEmail = async (id, emailData) => {
    try {
      await emailAPI.updateEmail(id, emailData);
      setEmails(prev => 
        prev.map(email => 
          email.id === id ? { ...email, ...emailData } : email
        )
      );
      await fetchStats();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update email' 
      };
    }
  };

  const deleteEmail = async (id) => {
    try {
      await emailAPI.deleteEmail(id);
      setEmails(prev => prev.filter(email => email.id !== id));
      await fetchStats();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete email' 
      };
    }
  };

  const getAvailableEmail = async () => {
    try {
      const email = await emailAPI.getAvailableEmail();
      return { success: true, email };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'No available emails' 
      };
    }
  };

  useEffect(() => {
    fetchEmails();
    fetchStats();
  }, []);

  return {
    emails,
    loading,
    error,
    stats,
    fetchEmails,
    fetchStats,
    createEmail,
    bulkCreateEmails,
    updateEmail,
    deleteEmail,
    getAvailableEmail
  };
};