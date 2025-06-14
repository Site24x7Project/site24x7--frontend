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
  Warning, Error, FilterList, NotificationsActive,
  MoreVert, CheckCircleOutline, Alarm, Download
} from '@mui/icons-material';
import { api } from '../services/api';

const AlarmsTable = ({ compactMode = false, refreshKey }) => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(compactMode ? 5 : 10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('downtime_millis');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical Only' },
    { value: 'warning', label: 'Warning Only' }
  ];

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
    const dataToExport = filteredAlarms.map(alert => ({
      Monitor: alert.name,
      'Outage ID': alert.outage_id,
      Severity: alert.status === 2 ? 'Critical' : 'Warning',
      Duration: alert.duration,
      Reason: alert.down_reason,
      'Last Polled': new Date(alert.last_polled_time).toLocaleString()
    }));

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alarms-export-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Rest of existing code remains unchanged
  const loadAlarms = async () => {
    setLoading(true);
    try {
      const res = await api.getAlarms();
      setAlarms(res.data);
    } catch (err) {
      console.error('Failed to fetch alarms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlarms();
  }, [refreshKey]);

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

  const handleSeverityFilter = (severity) => {
    setSeverityFilter(severity);
    setPage(0);
    handleFilterClose();
  };

  const formatDuration = (millis) => {
    const hours = Math.floor(millis / (1000 * 60 * 60));
    const minutes = Math.floor((millis % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getSeverityColor = (status) => {
    return status === 2 ? 'error' : 'warning';
  };

  const getSeverityIcon = (status) => {
    return status === 2 ? <Error /> : <Warning />;
  };

  const filteredAlarms = alarms
    .filter(alarm => {
      const matchesSearch = 
        alarm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.outage_id.includes(searchTerm) ||
        alarm.down_reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = 
        severityFilter === 'all' ||
        (severityFilter === 'critical' && alarm.status === 2) ||
        (severityFilter === 'warning' && alarm.status !== 2);
      
      return matchesSearch && matchesSeverity;
    });

  const sortedAlarms = [...filteredAlarms].sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const paginatedAlarms = sortedAlarms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {filteredAlarms.length} Alerts Found
            </Typography>
            <Badge 
              badgeContent={filteredAlarms.filter(a => a.status === 2).length} 
              color="error"
              sx={{ mr: 2 }}
            >
              <Chip 
                icon={<Error />}
                label="Critical"
                size="small"
                color="error"
                variant="outlined"
              />
            </Badge>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search alerts..."
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
            {severityOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={severityFilter === option.value}
                onClick={() => handleSeverityFilter(option.value)}
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
            <Table stickyHeader aria-label="alarms table" size={compactMode ? 'small' : 'medium'}>
              {/* Existing table structure remains unchanged */}
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Monitor
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Outage ID</TableCell>
                  <TableCell align="center">Severity</TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'downtime_millis'}
                      direction={orderBy === 'downtime_millis' ? order : 'desc'}
                      onClick={() => handleSort('downtime_millis')}
                    >
                      Duration
                    </TableSortLabel>
                  </TableCell>
                  {!compactMode && (
                    <>
                      <TableCell>Reason</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'last_polled_time'}
                          direction={orderBy === 'last_polled_time' ? order : 'desc'}
                          onClick={() => handleSort('last_polled_time')}
                        >
                          Occurred At
                        </TableSortLabel>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAlarms.map((alarm) => (
                  <TableRow 
                    hover 
                    key={alarm.outage_id}
                    sx={{ 
                      '&:nth-of-type(even)': { 
                        bgcolor: 'action.hover' 
                      },
                      '&:hover': { 
                        bgcolor: 'error.light', 
                        opacity: 0.8 
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          bgcolor: getSeverityColor(alarm.status),
                          width: 24, 
                          height: 24,
                          mr: 1
                        }}>
                          {getSeverityIcon(alarm.status)}
                        </Avatar>
                        <Typography fontWeight="medium">
                          {alarm.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`#${alarm.outage_id}`}
                        size="small"
                        sx={{ 
                          bgcolor: 'grey.200',
                          fontFamily: 'monospace'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        icon={getSeverityIcon(alarm.status)}
                        label={alarm.status === 2 ? 'Critical' : 'Warning'}
                        color={getSeverityColor(alarm.status)}
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {formatDuration(alarm.downtime_millis)}
                      </Typography>
                    </TableCell>
                    {!compactMode && (
                      <>
                        <TableCell>
                          <Tooltip title={alarm.down_reason}>
                            <Typography sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {alarm.down_reason}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {new Date(alarm.last_polled_time).toLocaleString()}
                        </TableCell>
                      </>
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
              count={filteredAlarms.length}
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

export default AlarmsTable;