import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import './AdminProducts.css';

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'Vegetables',
        imageURL: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://vegetable-dhukhan-backend.onrender.com/api/admin/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingProduct 
                ? `https://vegetable-dhukhan-backend.onrender.com/api/admin/products/${editingProduct.id}`
                : 'https://vegetable-dhukhan-backend.onrender.com/api/admin/products';
            
            const method = editingProduct ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchProducts();
                resetForm();
                alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            category: product.category || 'Vegetables',
            imageURL: product.image || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://vegetable-dhukhan-backend.onrender.com/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchProducts();
                alert('Product deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: 'Vegetables',
            imageURL: ''
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="loading-container">Loading products...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-products">
                <div className="products-header">
                    <h1>Product Management</h1>
                    <button
  className="btn btn-add"
  onClick={() => { resetForm(); setShowForm(true); }}
  aria-label="Add Product"
  title="Add Product"
  style={{
    width: 28,
    height: 28,
    padding: 0,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: '28px',
    borderRadius: 6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0,0,0,0.12)',
    background: '#fff',
    cursor: 'pointer'
  }}
>
  <span style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>➕</span>
</button>
                </div>

                {showForm && (
                    <div className="product-form-container">
                        <form className="product-form" onSubmit={handleSubmit}>
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
                                        <option value="Herbs">Herbs</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    value={formData.imageURL}
                                    onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-submit">
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">No products found</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <img 
                                                src={product.image || '/logo192.png'} 
                                                alt={product.name}
                                                className="product-thumbnail"
                                                onError={(e) => { e.target.src = '/logo192.png'; }}
                                            />
                                        </td>
                                        <td>{product.name}</td>
                                        <td>₹{product.price}</td>
                                        <td>{product.stock}</td>
                                        <td>{product.category}</td>
                                        <td>
                                            <span className={`status-badge in-stock`}>
                                                In Stock
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn btn-edit"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button 
                                                    className="btn btn-delete"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminProducts;

