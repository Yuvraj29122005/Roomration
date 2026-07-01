import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { HiUser, HiPhone, HiMoon, HiSun, HiKey } from 'react-icons/hi';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { members, updateMember } = useData();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = () => {
    updateMember(user.id, { name, mobile });
    updateProfile({ name, mobile });
    toast.success('Profile updated');
    setEditing(false);
  };

  const handlePasswordChange = () => {
    const member = members.find(m => m.id === user.id);
    if (!member || member.password !== oldPassword) {
      toast.error('Incorrect current password');
      return;
    }
    updateMember(user.id, { password: newPassword });
    toast.success('Password changed');
    setShowPasswordChange(false);
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your account details</p>
      </div>

      <div className="max-w-lg space-y-4">
        {/* Avatar & Name */}
        <Card padding="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3 ${getAvatarColor(user?.name || 'U')}`}>
              {getInitials(user?.name || 'User')}
            </div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-dark-400">@{user?.username}</p>
          </div>

          {editing ? (
            <div className="space-y-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} icon={HiUser} />
              <Input label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} icon={HiPhone} />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setEditing(false)} fullWidth>Cancel</Button>
                <Button onClick={handleSave} fullWidth>Save</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                <HiUser className="w-4 h-4 text-dark-400" />
                <div>
                  <p className="text-xs text-dark-400">Name</p>
                  <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
                <HiPhone className="w-4 h-4 text-dark-400" />
                <div>
                  <p className="text-xs text-dark-400">Mobile</p>
                  <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{user?.mobile || 'Not set'}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setEditing(true)} fullWidth>Edit Profile</Button>
            </div>
          )}
        </Card>

        {/* Change Password */}
        <Card padding="p-5">
          <div className="flex items-center gap-3 mb-4">
            <HiKey className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-dark-900 dark:text-white">Change Password</h3>
          </div>
          {showPasswordChange ? (
            <div className="space-y-3">
              <Input label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setShowPasswordChange(false)} fullWidth>Cancel</Button>
                <Button onClick={handlePasswordChange} fullWidth>Change</Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setShowPasswordChange(true)} fullWidth>Change Password</Button>
          )}
        </Card>

        {/* Theme */}
        <Card padding="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? <HiMoon className="w-5 h-5 text-primary-500" /> : <HiSun className="w-5 h-5 text-accent-500" />}
              <div>
                <h3 className="font-semibold text-dark-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-dark-400">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
