import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { getInitials, getAvatarColor, formatDate } from '../../utils/helpers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import SearchBar from '../../components/common/SearchBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { HiPlus, HiPencil, HiTrash, HiPhone, HiBan, HiCheckCircle, HiUsers } from 'react-icons/hi';
import { useForm } from 'react-hook-form';

export default function Members() {
  const { members, addMember, updateMember, deleteMember, toggleMemberActive } = useData();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filteredMembers = members.filter(m => 
    m.role !== 'admin' && m.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingMember(null);
    reset({ name: '', mobile: '', username: '', password: '', joinDate: '' });
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    reset(member);
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    if (editingMember) {
      updateMember(editingMember.id, data);
      toast.success('Member updated successfully');
    } else {
      addMember(data);
      toast.success('Member added successfully');
    }
    setModalOpen(false);
    reset();
  };

  const handleDelete = () => {
    deleteMember(deleteId);
    toast.success('Member deleted');
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{filteredMembers.length} members</p>
        </div>
        <Button icon={HiPlus} onClick={openAdd} size="lg">Add Member</Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search members..." className="mb-6" />

      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={HiUsers}
          title="No members found"
          description="Add your first member to get started"
          action={<Button icon={HiPlus} onClick={openAdd}>Add Member</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card padding="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold ${getAvatarColor(member.name)}`}>
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white">{member.name}</h3>
                        <p className="text-xs text-dark-400">@{member.username}</p>
                      </div>
                    </div>
                    <span className={member.active ? 'badge-success' : 'badge-danger'}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                      <HiPhone className="w-4 h-4" />
                      <span>{member.mobile || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-dark-400">
                      Joined: {formatDate(member.joinDate)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={HiPencil} onClick={() => openEdit(member)} className="flex-1">Edit</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={member.active ? HiBan : HiCheckCircle}
                      onClick={() => { toggleMemberActive(member.id); toast.success(member.active ? 'Member deactivated' : 'Member activated'); }}
                    >
                      {member.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm" icon={HiTrash} onClick={() => setDeleteId(member.id)} className="text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMember ? 'Edit Member' : 'Add Member'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} placeholder="Enter full name" />
          <Input label="Mobile Number" {...register('mobile')} placeholder="Enter mobile number" />
          <Input label="Username" {...register('username', { required: 'Username is required' })} error={errors.username?.message} placeholder="Enter username" />
          <Input label="Password" type="password" {...register('password', { required: !editingMember && 'Password is required' })} error={errors.password?.message} placeholder="Enter password" />
          <Input label="Joining Date" type="date" {...register('joinDate')} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editingMember ? 'Update' : 'Add Member'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
      />
    </div>
  );
}
