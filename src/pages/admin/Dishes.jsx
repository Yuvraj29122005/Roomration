import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/helpers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import SearchBar from '../../components/common/SearchBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { HiPlus, HiPencil, HiTrash, HiCollection, HiCurrencyDollar } from 'react-icons/hi';
import { useForm } from 'react-hook-form';

export default function Dishes() {
  const { dishes, addDish, updateDish, deleteDish } = useData();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filtered = dishes.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditingDish(null);
    reset({ name: '', price: '' });
    setModalOpen(true);
  };

  const openEdit = (dish) => {
    setEditingDish(dish);
    reset(dish);
    setModalOpen(true);
  };

  const onSubmit = (data) => {
    const parsed = { ...data, price: parseFloat(data.price) };
    if (editingDish) {
      updateDish(editingDish.id, parsed);
      toast.success('Dish updated successfully');
    } else {
      addDish(parsed);
      toast.success('Dish added successfully');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    deleteDish(deleteId);
    toast.success('Dish deleted');
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Master Dishes</h1>
          <p className="page-subtitle">{dishes.length} dishes — prices set once, used everywhere</p>
        </div>
        <Button icon={HiPlus} onClick={openAdd} size="lg">Add Dish</Button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search dishes..." className="mb-6" />

      {filtered.length === 0 ? (
        <EmptyState icon={HiCollection} title="No dishes found" description="Add your first dish to get started" action={<Button icon={HiPlus} onClick={openAdd}>Add Dish</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((dish) => (
              <motion.div key={dish.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card padding="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-accent-50 dark:bg-accent-500/10 rounded-xl flex items-center justify-center">
                        <HiCollection className="w-5 h-5 text-accent-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-white">{dish.name}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <HiCurrencyDollar className="w-3.5 h-3.5 text-success-500" />
                          <span className="text-lg font-bold text-success-600 dark:text-success-400">{formatCurrency(dish.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm" icon={HiPencil} onClick={() => openEdit(dish)} className="flex-1">Edit</Button>
                    <Button variant="ghost" size="sm" icon={HiTrash} onClick={() => setDeleteId(dish.id)} className="text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingDish ? 'Edit Dish' : 'Add Dish'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Dish Name" {...register('name', { required: 'Dish name is required' })} error={errors.name?.message} placeholder="e.g. Chicken Curry" />
          <Input label="Price (₹)" type="number" {...register('price', { required: 'Price is required', min: { value: 1, message: 'Price must be positive' } })} error={errors.price?.message} placeholder="e.g. 250" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" fullWidth>{editingDish ? 'Update' : 'Add Dish'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Dish" message="Are you sure you want to delete this dish?" />
    </div>
  );
}
