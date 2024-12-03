import React from 'react'; 
import AdminContent from '../components/admin/AdminContent.jsx';

export default function AdminPage() {

  return (
    <div className="container pt-4">
      <h3>Create a page for the admin to access and update services</h3>
      <AdminContent />
    </div>
  );
}