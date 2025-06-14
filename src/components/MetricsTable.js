import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, TextField, 
  IconButton, LinearProgress, Tooltip, Box,
  TablePagination, TableSortLabel, Chip, Typography,
  Avatar, Menu, MenuItem, Button, Badge
} from '@mui/material';
import { 
  Search, Refresh, ArrowUpward, ArrowDownward,
  CheckCircle, Warning, Error, FilterList,
  MoreVert, Star, StarBorder, Download
} from '@mui/icons-material';
import { api } from '../services/api';

const MetricsTable = ({ compactMode = false, refreshKey }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(compactMode ? 5 : 10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('attribute_value');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'up', label: 'Up Only' },
    { value: 'critical', label: 'Critical Only' },
    { value: 'down', label: 'Down Only' }
  ];

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [refreshKey]);

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
    const dataToExport = filteredMetrics.map(metric => ({
      'Monitor Name': metric.monitor_name,
      Type: metric.monitor_type,
      Status: metric.monitor_status === 1 ? 'Up' : metric.monitor_status === 2 ? 'Critical' : 'Down',
      'Response Time': `${metric.attribute_value} ${metric.unit}`,
      'Last Checked': new Date(metric.last_polled_time).toLocaleString(),
      'Downtime Duration': metric.duration
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics-export-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(0);
    handleFilterClose();
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  const filteredMetrics = metrics
    .filter(metric => {
      const matchesSearch = 
        metric.monitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.monitor_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'up' && metric.monitor_status === 1) ||
        (statusFilter === 'critical' && metric.monitor_status === 2) ||
        (statusFilter === 'down' && (metric.monitor_status === 0 || metric.monitor_status === 10));
      
      return matchesSearch && matchesStatus;
    });

  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const paginatedMetrics = sortedMetrics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const StatusIcon = ({ status }) => {
    switch(status) {
      case 1: return <CheckCircle color="success" fontSize="small" />;
      case 2: return <Warning color="warning" fontSize="small" />;
      default: return <Error color="error" fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 1: return 'success';
      case 2: return 'warning';
      default: return 'error';
    }
  };

  return (
    <Paper sx={{ 
      width: '100%', 
      overflow: 'hidden',
      borderRadius: 3,
      boxShadow: 'none'
    }}>
      <Box sx={{ 
        p: compactMode ? 0 : 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'transparent'
      }}>
        {!compactMode && (
          <Typography variant="subtitle1" fontWeight="bold">
            {filteredMetrics.length} Monitors Found
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search monitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              sx: { 
                borderRadius: 4,
                backgroundColor: 'background.paper'
              }
            }}
            sx={{ 
              width: compactMode ? 180 : 250,
              '& .MuiOutlinedInput-root': {
                height: 36
              }
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{
              borderRadius: 4,
              height: 36,
              textTransform: 'none'
            }}
          >
            Export
          </Button>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
            sx={{
              borderRadius: 4,
              height: 36,
              textTransform: 'none'
            }}
          >
            Filter
          </Button>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={statusFilter === option.value}
                onClick={() => handleStatusFilter(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          <TableContainer sx={{ 
            maxHeight: compactMode ? 300 : 600,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Table stickyHeader aria-label="metrics table" size={compactMode ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }}></TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'monitor_name'}
                      direction={orderBy === 'monitor_name' ? order : 'asc'}
                      onClick={() => handleSort('monitor_name')}
                    >
                      Monitor Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'monitor_type'}
                      direction={orderBy === 'monitor_type' ? order : 'asc'}
                      onClick={() => handleSort('monitor_type')}
                    >
                      Type
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">
                    <TableSortLabel
                      active={orderBy === 'monitor_status'}
                      direction={orderBy === 'monitor_status' ? order : 'asc'}
                      onClick={() => handleSort('monitor_status')}
                      sx={{ justifyContent: 'center' }}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'attribute_value'}
                      direction={orderBy === 'attribute_value' ? order : 'desc'}
                      onClick={() => handleSort('attribute_value')}
                    >
                      Response Time
                    </TableSortLabel>
                  </TableCell>
                  {!compactMode && (
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'last_polled_time'}
                        direction={orderBy === 'last_polled_time' ? order : 'desc'}
                        onClick={() => handleSort('last_polled_time')}
                      >
                        Last Checked
                      </TableSortLabel>
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMetrics.map((metric) => (
                  <TableRow 
                    hover 
                    key={metric.monitor_id}
                    sx={{ 
                      '&:nth-of-type(even)': { 
                        bgcolor: 'action.hover' 
                      },
                      '&:hover': { 
                        bgcolor: 'primary.light', 
                        opacity: 0.9 
                      }
                    }}
                  >
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleFavorite(metric.monitor_id)}
                      >
                        {favorites.includes(metric.monitor_id) ? (
                          <Star color="warning" fontSize="small" />
                        ) : (
                          <StarBorder fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {metric.monitor_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={metric.monitor_type} 
                        size="small"
                        sx={{ 
                          bgcolor: 'secondary.light',
                          color: 'secondary.contrastText'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={
                        metric.monitor_status === 1 ? 'Operational' :
                        metric.monitor_status === 2 ? 'Performance Issues' : 'Down'
                      }>
                        <Chip
                          icon={<StatusIcon status={metric.monitor_status} />}
                          label={
                            metric.monitor_status === 1 ? 'Up' :
                            metric.monitor_status === 2 ? 'Critical' : 'Down'
                          }
                          color={getStatusColor(metric.monitor_status)}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            minWidth: 80,
                            fontWeight: 'bold'
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        color={
                          metric.attribute_value > 5000 ? 'error.main' : 
                          metric.attribute_value > 2000 ? 'warning.main' : 'success.main'
                        }
                        fontWeight="bold"
                      >
                        {metric.attribute_value} {metric.unit}
                      </Typography>
                    </TableCell>
                    {!compactMode && (
                      <TableCell>
                        {new Date(metric.last_polled_time).toLocaleString()}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {!compactMode && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMetrics.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ 
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            />
          )}
        </>
      )}
    </Paper>
  );
};

export default MetricsTable;