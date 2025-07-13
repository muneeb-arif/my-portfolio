import React, { useState, useEffect } from 'react';
import { Mail, FileText, CheckCircle, Clock, AlertCircle, Star, MessageSquare } from 'lucide-react';
import { publicPortfolioService } from '../../services/serviceAdapter';
import './QueriesManager.css';

const QueriesManager = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [filter, setFilter] = useState('all'); // all, contact, onboarding
  const [statusFilter, setStatusFilter] = useState('all'); // all, new, in_progress, completed

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const result = await publicPortfolioService.getContactQueries();
      
      if (result.success) {
        setQueries(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch queries');
      console.error('Error fetching queries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (queryId, newStatus) => {
    try {
      const result = await publicPortfolioService.updateQueryStatus(queryId, newStatus);
      
      if (result.success) {
        // Update the query in the local state
        setQueries(prev => 
          prev.map(query => 
            query.id === queryId 
              ? { ...query, status: newStatus, updated_at: new Date().toISOString() }
              : query
          )
        );
        
        // Update selected query if it's the one being updated
        if (selectedQuery && selectedQuery.id === queryId) {
          setSelectedQuery(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert('Failed to update status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredQueries = queries.filter(query => {
    if (filter !== 'all' && query.form_type !== filter) return false;
    if (statusFilter !== 'all' && query.status !== statusFilter) return false;
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <Star className="w-4 h-4 text-red-500" />;
      case 'high': return <Star className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Star className="w-4 h-4 text-gray-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderQueryDetails = (query) => {
    if (query.form_type === 'contact') {
      return (
        <div className="query-details">
          <div className="detail-section">
            <h4>Contact Information</h4>
            <div className="detail-grid">
              <div><strong>Name:</strong> {query.name}</div>
              <div><strong>Email:</strong> {query.email}</div>
              <div><strong>Phone:</strong> {query.phone || 'Not provided'}</div>
              <div><strong>Company:</strong> {query.company || 'Not provided'}</div>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Project Information</h4>
            <div className="detail-grid">
              <div><strong>Inquiry Type:</strong> {query.inquiry_type}</div>
              <div><strong>Subject:</strong> {query.subject}</div>
              <div><strong>Budget:</strong> {query.budget || 'To be discussed'}</div>
              <div><strong>Timeline:</strong> {query.timeline || 'Flexible'}</div>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Message</h4>
            <div className="message-content">{query.message}</div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="query-details">
          <div className="detail-section">
            <h4>Company Information</h4>
            <div className="detail-grid">
              <div><strong>Company:</strong> {query.company_name}</div>
              <div><strong>Contact Person:</strong> {query.contact_person}</div>
              <div><strong>Communication Channel:</strong> {query.communication_channel}</div>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Business Details</h4>
            <div className="detail-text">
              <div><strong>Business Description:</strong></div>
              <p>{query.business_description}</p>
              
              <div><strong>Target Customer:</strong></div>
              <p>{query.target_customer}</p>
              
              {query.unique_value && (
                <>
                  <div><strong>Unique Value:</strong></div>
                  <p>{query.unique_value}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Project Requirements</h4>
            <div className="detail-text">
              <div><strong>Problem to Solve:</strong></div>
              <p>{query.problem_solving}</p>
              
              <div><strong>Core Features:</strong></div>
              <p>{query.core_features}</p>
              
              {query.existing_system && (
                <>
                  <div><strong>Existing System:</strong></div>
                  <p>{query.existing_system}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Budget & Timeline</h4>
            <div className="detail-grid">
              <div><strong>Budget Range:</strong> {query.budget_range}</div>
              <div><strong>Launch Date:</strong> {query.launch_date || 'Flexible'}</div>
            </div>
          </div>
          
          {(query.brand_guide || query.color_preferences || query.tone_of_voice) && (
            <div className="detail-section">
              <h4>Design Preferences</h4>
              <div className="detail-grid">
                {query.brand_guide && <div><strong>Brand Guide:</strong> {query.brand_guide}</div>}
                {query.color_preferences && <div><strong>Colors:</strong> {query.color_preferences}</div>}
                <div><strong>Tone:</strong> {query.tone_of_voice}</div>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="queries-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading queries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="queries-manager">
        <div className="error-state">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3>Error Loading Queries</h3>
          <p>{error}</p>
          <button onClick={fetchQueries} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="queries-manager">
      <div className="queries-header">
        <div className="header-content">
          <h2>Contact Queries & Project Submissions</h2>
          <p>Manage and respond to client inquiries and project requests</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-number">{queries.length}</div>
            <div className="stat-label">Total Queries</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{queries.filter(q => q.status === 'new').length}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{queries.filter(q => q.status === 'in_progress').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{queries.filter(q => q.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <div className="queries-filters">
        <div className="filter-group">
          <label>Form Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="contact">Contact Forms</option>
            <option value="onboarding">Onboarding Forms</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="queries-content">
        <div className="queries-list">
          {filteredQueries.length === 0 ? (
            <div className="empty-state">
              <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
              <h3>No Queries Found</h3>
              <p>No queries match your current filters.</p>
            </div>
          ) : (
            filteredQueries.map(query => (
              <div 
                key={query.id} 
                className={`query-item ${selectedQuery?.id === query.id ? 'selected' : ''}`}
                onClick={() => setSelectedQuery(query)}
              >
                <div className="query-header">
                  <div className="query-type">
                    {query.form_type === 'contact' ? (
                      <Mail className="w-5 h-5 text-blue-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-purple-500" />
                    )}
                    <span className="type-label">
                      {query.form_type === 'contact' ? 'Contact' : 'Onboarding'}
                    </span>
                  </div>
                  
                  <div className="query-meta">
                    {getPriorityIcon(query.priority)}
                    {getStatusIcon(query.status)}
                  </div>
                </div>
                
                <div className="query-content">
                  <h4>{query.subject || query.company_name}</h4>
                  <p className="query-sender">
                    {query.form_type === 'contact' ? query.name : query.contact_person}
                    {query.company && ` • ${query.company}`}
                    {query.form_type === 'onboarding' && ` • ${query.company_name}`}
                  </p>
                  <p className="query-preview">
                    {query.form_type === 'contact' 
                      ? query.message?.substring(0, 100) + '...'
                      : query.business_description?.substring(0, 100) + '...'
                    }
                  </p>
                </div>
                
                <div className="query-footer">
                  <span className="query-date">{formatDate(query.created_at)}</span>
                  <span className={`status-badge status-${query.status}`}>
                    {query.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedQuery && (
          <div className="query-details-panel">
            <div className="panel-header">
              <div className="panel-title">
                <h3>
                  {selectedQuery.form_type === 'contact' ? selectedQuery.subject : selectedQuery.company_name}
                </h3>
                <p>{selectedQuery.form_type === 'contact' ? selectedQuery.name : selectedQuery.contact_person}</p>
              </div>
              
              <div className="panel-actions">
                <select 
                  value={selectedQuery.status} 
                  onChange={(e) => handleStatusUpdate(selectedQuery.id, e.target.value)}
                  className="status-select"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="panel-content">
              {renderQueryDetails(selectedQuery)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueriesManager; 