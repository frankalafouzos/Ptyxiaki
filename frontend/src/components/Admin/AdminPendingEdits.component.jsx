import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Container, Card, Form, InputGroup, Row, Col, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../css/Admin/AdminPendingEdits.css';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter } from 'react-icons/fa';

const AdminPendingEdits = () => {
  const [pendingEdits, setPendingEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });
  const [filters, setFilters] = useState({
    changeTypes: [],
    dateRange: '',
    status: 'all'
  });
  const [filteredEdits, setFilteredEdits] = useState([]);

  useEffect(() => {
    const fetchPendingEdits = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pending-edits/admin');
        if (!response.ok) throw new Error('Failed to fetch pending edits');
        const data = await response.json();
        setPendingEdits(data);
        setFilteredEdits(data);
      } catch (error) {
        console.error('Error fetching pending edits:', error);
        toast.error('Could not retrieve pending edits');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingEdits();
  }, []);

  // Apply sorting, filtering, and search
  useEffect(() => {
    let result = [...pendingEdits];
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(edit => 
        (edit.restaurant?.name || '').toLowerCase().includes(searchLower) ||
        (edit.ownerDetails?.firstname || '').toLowerCase().includes(searchLower) ||
        (edit.ownerDetails?.lastname || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Apply filters
    if (filters.changeTypes.length > 0) {
      result = result.filter(edit => {
        if (!edit.changes) return false;
        return filters.changeTypes.some(type => edit.changes[type] !== undefined);
      });
    }
    
    if (filters.dateRange) {
      const now = new Date();
      const pastDate = new Date();
      
      switch(filters.dateRange) {
        case 'today':
          pastDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          pastDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          pastDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      result = result.filter(edit => new Date(edit.submittedAt) >= pastDate);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortConfig.key) {
          case 'restaurant':
            aVal = a.restaurant?.name || '';
            bVal = b.restaurant?.name || '';
            break;
          case 'owner':
            aVal = `${a.ownerDetails?.firstname || ''} ${a.ownerDetails?.lastname || ''}`;
            bVal = `${b.ownerDetails?.firstname || ''} ${b.ownerDetails?.lastname || ''}`;
            break;
          case 'submittedAt':
            aVal = new Date(a.submittedAt).getTime();
            bVal = new Date(b.submittedAt).getTime();
            break;
          case 'changes':
            aVal = Object.keys(a.changes || {}).length;
            bVal = Object.keys(b.changes || {}).length;
            break;
          default:
            aVal = a[sortConfig.key];
            bVal = b[sortConfig.key];
        }
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredEdits(result);
  }, [pendingEdits, searchTerm, sortConfig, filters]);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this edit?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/admins/approve-edit/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to approve edit');
      
      // Update the list
      setPendingEdits(prevEdits => 
        prevEdits.filter(edit => edit._id !== id)
      );
      
      toast.success('Edit approved successfully');
    } catch (error) {
      console.error('Error approving edit:', error);
      toast.error('Failed to approve edit');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this edit?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/admins/reject-edit/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Failed to reject edit');
      
      // Update the list
      setPendingEdits(prevEdits => 
        prevEdits.filter(edit => edit._id !== id)
      );
      
      toast.success('Edit rejected successfully');
    } catch (error) {
      console.error('Error rejecting edit:', error);
      toast.error('Failed to reject edit');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const summarizeChanges = (changes) => {
    if (!changes) return 'No changes';
    
    // Filter out image_changes for this summary
    const fieldChanges = Object.entries(changes).filter(([key]) => key !== 'images_changes');
    
    if (fieldChanges.length === 0) {
      return changes.images_changes ? 'Image changes only' : 'No changes';
    }
    
    return fieldChanges.map(([field]) => formatFieldName(field)).join(', ');
  };

  const formatFieldName = (field) => {
    switch(field) {
      case 'name': return 'Name';
      case 'price': return 'Price';
      case 'category': return 'Category';
      case 'location': return 'Location';
      case 'phone': return 'Phone';
      case 'email': return 'Email';
      case 'description': return 'Description';
      case 'Bookingduration': return 'Booking Duration';
      case 'openHour': return 'Opening Time';
      case 'closeHour': return 'Closing Time';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };
  
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  const toggleChangeTypeFilter = (type) => {
    setFilters(prev => {
      const newTypes = prev.changeTypes.includes(type)
        ? prev.changeTypes.filter(t => t !== type)
        : [...prev.changeTypes, type];
      
      return {
        ...prev,
        changeTypes: newTypes
      };
    });
  };
  
  const clearFilters = () => {
    setFilters({
      changeTypes: [],
      dateRange: '',
      status: 'all'
    });
    setSearchTerm('');
  };

  const getAvailableChangeTypes = () => {
    const types = new Set();
    pendingEdits.forEach(edit => {
      if (edit.changes) {
        Object.keys(edit.changes).forEach(key => types.add(key));
      }
    });
    return Array.from(types);
  };

  if (loading) {
    return <div className="d-flex justify-content-center pt-5"><div className="loader"></div></div>;
  }

  return (
    <Container className="py-5 admin-pending-edits">
      <h1 className="text-center mb-4">Restaurant Edit Requests</h1>
      
      {pendingEdits.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <Card.Title>No Pending Edits</Card.Title>
            <Card.Text>There are currently no edit requests waiting for approval.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Search by restaurant or owner name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    Clear
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex gap-2 justify-content-end">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  <FaFilter /> Filter Changes
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {getAvailableChangeTypes().map(type => (
                    <Dropdown.Item 
                      key={type} 
                      active={filters.changeTypes.includes(type)}
                      onClick={() => toggleChangeTypeFilter(type)}
                    >
                      {formatFieldName(type)}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setFilters(prev => ({...prev, changeTypes: []}))}> 
                    Clear Filters
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary">
                  Date Range
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item 
                    active={filters.dateRange === 'today'}
                    onClick={() => handleFilterChange('dateRange', 'today')}
                  >
                    Today
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={filters.dateRange === 'week'}
                    onClick={() => handleFilterChange('dateRange', 'week')}
                  >
                    Last 7 Days
                  </Dropdown.Item>
                  <Dropdown.Item 
                    active={filters.dateRange === 'month'}
                    onClick={() => handleFilterChange('dateRange', 'month')}
                  >
                    Last 30 Days
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => handleFilterChange('dateRange', '')}>
                    All Time
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              {(filters.changeTypes.length > 0 || filters.dateRange || searchTerm) && (
                <Button variant="outline-danger" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </Col>
          </Row>
          
          <div className="mb-2 text-muted">
            {filteredEdits.length} result{filteredEdits.length !== 1 ? 's' : ''} found
          </div>
          
          <Table responsive striped hover className="align-middle">
            <thead>
              <tr>
                <th onClick={() => requestSort('restaurant')} style={{cursor: 'pointer'}}>
                  Restaurant {getSortIcon('restaurant')}
                </th>
                <th onClick={() => requestSort('owner')} style={{cursor: 'pointer'}}>
                  Owner {getSortIcon('owner')}
                </th>
                <th onClick={() => requestSort('submittedAt')} style={{cursor: 'pointer'}}>
                  Submitted {getSortIcon('submittedAt')}
                </th>
                <th onClick={() => requestSort('changes')} style={{cursor: 'pointer'}}>
                  Changes {getSortIcon('changes')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEdits.map((edit) => (
                <tr key={edit._id}>
                  <td>{edit.restaurant?.name || 'Unknown'}</td>
                  <td>
                    {edit.ownerDetails ? 
                      `${edit.ownerDetails.firstname} ${edit.ownerDetails.lastname}` : 
                      'Unknown'}
                  </td>
                  <td>{formatDate(edit.submittedAt)}</td>
                  <td>{summarizeChanges(edit.changes)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/admin/pending-edits/${edit._id}`} 
                        className="btn btn-sm btn-info"
                      >
                        View
                      </Link>
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleApprove(edit._id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleReject(edit._id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default AdminPendingEdits;
