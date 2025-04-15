
import React, { useState, useEffect } from 'react';
import { submitUserInvitations } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { UserPlus, X, Mail } from 'lucide-react';

interface UserInvitationFormProps {
  formToken: string;
  availableUsers?: number;
  activeUsers?: number;
  existingEmails?: string;
}

interface UserData {
  name: string;
  email: string;
}

const UserInvitationForm: React.FC<UserInvitationFormProps> = ({ 
  formToken, 
  availableUsers = 0, 
  activeUsers = 0,
  existingEmails = ''
}) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [existingUsers, setExistingUsers] = useState<UserData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [localAvailableUsers, setLocalAvailableUsers] = useState(availableUsers);
  const [localActiveUsers, setLocalActiveUsers] = useState(activeUsers);

  useEffect(() => {
    // Initialize form with empty fields based on available users
    const initialUsers = Array(availableUsers).fill(null).map(() => ({ name: '', email: '' }));
    setUsers(initialUsers);
    setLocalAvailableUsers(availableUsers);
    setLocalActiveUsers(activeUsers);
    
    // Parse existing emails if any
    if (existingEmails) {
      try {
        const parsedUsers = JSON.parse(existingEmails);
        if (Array.isArray(parsedUsers)) {
          setExistingUsers(parsedUsers);
        }
      } catch (e) {
        console.error('Error parsing existing emails:', e);
        // If not valid JSON, try to parse as comma-separated
        const emailsArray = existingEmails.split(',').map(email => ({
          name: email.trim().split('@')[0] || 'User',
          email: email.trim()
        }));
        setExistingUsers(emailsArray.filter(user => user.email));
      }
    }
  }, [availableUsers, activeUsers, existingEmails]);

  const handleUserChange = (index: number, field: keyof UserData, value: string) => {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setUsers(updatedUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty entries
    const validUsers = users.filter(user => user.name && user.email);
    
    if (validUsers.length === 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitUserInvitations({
        formToken,
        users: validUsers
      });
      
      // Update local counts
      const invitedCount = validUsers.length;
      setLocalAvailableUsers(prev => Math.max(0, prev - invitedCount));
      setLocalActiveUsers(prev => prev + invitedCount);
      
      setSuccessMessage('Users submitted! Invites will arrive shortly!');
      
      // Add newly invited users to existing users
      setExistingUsers(prev => [...prev, ...validUsers]);
      
      // Reset form after successful submission - only show fields up to available slots
      const remainingSlots = Math.max(0, localAvailableUsers - invitedCount);
      const newUsers = Array(remainingSlots).fill(null).map(() => ({ name: '', email: '' }));
      setUsers(newUsers);
    } catch (error) {
      console.error('Error inviting users:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (availableUsers === 0 && existingUsers.length === 0) {
    return (
      <div className="glass-card p-8 animate-fade-in">
        <div className="text-center py-6">
          <UserPlus size={48} className="mx-auto mb-4 text-zinc-400" />
          <h2 className="text-2xl font-semibold mb-2 text-white">No User Slots Available</h2>
          <p className="text-zinc-300">
            Need more user slots? Please contact Revenue Aigency at <a href="mailto:ruben@revenueaigency.com" className="text-brand hover:underline">ruben@revenueaigency.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center text-white">Invite Users</h2>
      
      <div className="flex justify-center items-center mb-6 space-x-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand">{localActiveUsers}</div>
          <div className="text-sm text-zinc-400">Active Users</div>
        </div>
        <div className="h-10 border-r border-zinc-600"></div>
        <div className="text-center">
          <div className="text-3xl font-bold text-brand">{localAvailableUsers}</div>
          <div className="text-sm text-zinc-400">Available Slots</div>
        </div>
      </div>
      
      {existingUsers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm uppercase text-zinc-400 mb-3 font-medium">Existing Users</h3>
          <div className="space-y-2">
            {existingUsers.map((user, index) => (
              <div 
                key={`existing-${index}`} 
                className="bg-[#333333] px-4 py-3 rounded-md flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-sm text-zinc-400">{user.email}</div>
                </div>
                <div className="bg-brand/20 text-brand text-xs font-medium px-2 py-1 rounded">
                  Invited
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {localAvailableUsers > 0 && (
        <>
          <div className="text-zinc-300 mb-6 text-center">
            Please enter the names and email addresses of the users you'd like to invite.
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {users.slice(0, localAvailableUsers).map((user, index) => (
              <div 
                key={index} 
                className="space-y-3 p-4 border border-zinc-700 rounded-lg bg-[#333333]/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-zinc-300">User {index + 1}</h3>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedUsers = [...users];
                        updatedUsers.splice(index, 1);
                        setUsers(updatedUsers);
                      }}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div>
                  <label htmlFor={`name-${index}`} className="block text-xs font-medium text-zinc-400 mb-1">
                    Name
                  </label>
                  <input
                    id={`name-${index}`}
                    type="text"
                    value={user.name}
                    onChange={(e) => handleUserChange(index, 'name', e.target.value)}
                    required={index === 0}
                    className="input-field w-full"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor={`email-${index}`} className="block text-xs font-medium text-zinc-400 mb-1">
                    Email
                  </label>
                  <input
                    id={`email-${index}`}
                    type="email"
                    value={user.email}
                    onChange={(e) => handleUserChange(index, 'email', e.target.value)}
                    required={index === 0}
                    className="input-field w-full"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            ))}
            
            {users.length < localAvailableUsers && (
              <button
                type="button"
                onClick={() => setUsers([...users, { name: '', email: '' }])}
                className="w-full py-3 border border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-zinc-300 hover:border-zinc-500 transition-all duration-300"
              >
                + Add Another User
              </button>
            )}
            
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting || users.length === 0 || (users[0].name === '' && users[0].email === '')}
                className="btn-primary w-full sm:w-auto flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="border-white" />
                    <span className="ml-2">Inviting...</span>
                  </>
                ) : (
                  'Invite Users'
                )}
              </button>
            </div>
            
            {successMessage && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-800 rounded-md text-center text-green-300">
                {successMessage}
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default UserInvitationForm;
