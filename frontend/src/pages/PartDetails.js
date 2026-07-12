import React, { useState, useEffect } from 'react';
import { getPart, getReviews, createReview, createWishlistItem } from '../api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star, ShoppingCart, Heart, ArrowLeft, CheckCircle } from 'lucide-react';

export default function PartDetails({ partId, user, onBack, onAddToCart }) {
  const [part, setPart] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [partId]);

  const fetchData = async () => {
    try {
      const partRes = await getPart(partId);
      setPart(partRes.data);
      
      const reviewsRes = await getReviews({ part: partId });
      setReviews(reviewsRes.data);
    } catch (error) {
      toast.error('Failed to load part details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please login to use wishlist.');
      return;
    }
    try {
      await createWishlistItem({ part: partId, customer: user.customer_id });
      toast.success('Added to wishlist!');
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Item is already in your wishlist.');
      } else {
        toast.error('Failed to add to wishlist.');
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to leave a review.');
      return;
    }
    setSubmitting(true);
    try {
      await createReview({ part: partId, customer: user.customer_id, rating, comment });
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      fetchData(); // Refresh reviews
    } catch (error) {
      toast.error('Failed to submit review. You may have already reviewed this part.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner" style={{ padding: 100, textAlign: 'center' }}>Loading...</div>;
  if (!part) return <div style={{ padding: 100, textAlign: 'center' }}>Part not found.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="part-details-container"
      style={{ padding: '40px', maxWidth: 1200, margin: '0 auto', color: '#f8fafc' }}
    >
      <button onClick={onBack} className="btn btn-outline" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '60px' }}>
        {/* Left: Image / Showcase */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          {part.image ? (
            <img src={part.image} alt={part.name} style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
          ) : (
            <div style={{ opacity: 0.2 }}>
              <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div>
          <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            {part.category_name}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>{part.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
              <Star size={20} fill="#fbbf24" />
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{part.average_rating || 'No ratings'}</span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>
              ({part.reviews_count} reviews)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: part.stock_quantity > 0 ? '#10b981' : '#ef4444', fontSize: 14, fontWeight: 500, padding: '4px 12px', background: part.stock_quantity > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 20 }}>
              <CheckCircle size={16} />
              {part.stock_quantity > 0 ? `In Stock (${part.stock_quantity})` : 'Out of Stock'}
            </div>
          </div>

          <div style={{ fontSize: 32, fontWeight: 700, color: '#f8fafc', marginBottom: 32 }}>
            ${parseFloat(part.price).toFixed(2)}
          </div>

          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            {part.description || 'No description available for this part.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Brand</div>
              <div style={{ fontWeight: 500 }}>{part.brand}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Part Number</div>
              <div style={{ fontWeight: 500 }}>{part.part_number}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Vehicle</div>
              <div style={{ fontWeight: 500 }}>{part.vehicle_make} {part.vehicle_model} ({part.vehicle_year})</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>Condition</div>
              <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{part.condition}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: 16, fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
              onClick={() => {
                if (part.stock_quantity > 0) {
                  onAddToCart(part);
                  toast.success('Added to cart!');
                }
              }}
              disabled={part.stock_quantity <= 0}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '16px 24px', display: 'flex', alignItems: 'center' }}
              onClick={handleAddToWishlist}
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32 }}>Customer Reviews</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 48 }}>
          {/* Review List */}
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No reviews yet. Be the first to review this product!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontWeight: 600 }}>{review.customer_name}</div>
                      <div style={{ color: '#64748b', fontSize: 13 }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < review.rating ? '#fbbf24' : 'transparent'} stroke={i < review.rating ? '#fbbf24' : '#475569'} />
                      ))}
                    </div>
                    <p style={{ color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review */}
          {user && !user.is_staff && (
            <div>
              <div style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14 }}>Rating</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star size={24} fill={star <= rating ? '#fbbf24' : 'transparent'} stroke={star <= rating ? '#fbbf24' : '#64748b'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8, color: '#94a3b8', fontSize: 14 }}>Your Comment</label>
                    <textarea 
                      className="form-control" 
                      rows={4} 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike?"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
