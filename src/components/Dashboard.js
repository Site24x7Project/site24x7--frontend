import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Button, Card, CardContent, 
  Divider, Chip, useTheme, Paper, Fade, Grow, Zoom,
  Tooltip as MuiTooltip, IconButton, Badge, alpha
} from '@mui/material';
import { 
  Refresh, TrendingUp, Warning,
  ShowChart, Timeline, Dashboard as DashboardIcon,
  GroupAdd, Delete as DeleteIcon,
  Troubleshoot as RcaIcon,
  NotificationsActive,
  InfoOutlined
} from '@mui/icons-material';
import MetricsTable from './MetricsTable';
import AlarmsTable from './AlarmsTable';
import CreateMonitor from './CreateMonitor';
import CreateMonitorGroup from './CreateMonitorGroup';
import StatusSummary from './StatusSummary';
import RCA from './RCA';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

const PerformanceChart = ({ data }) => {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
        <XAxis 
          dataKey="last_polled_time" 
          tickFormatter={(time) => new Date(time).toLocaleTimeString()}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
        />
        <YAxis 
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            boxShadow: theme.shadows[4]
          }}
        />
<Line 
  type="monotone" 
  dataKey="attribute_value" 
  stroke={theme.palette.primary.main}
  strokeWidth={2}
  activeDot={{ r: 5 }}
/>

      </LineChart>
    </ResponsiveContainer>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [viewMode, setViewMode] = useState('dashboard');
  const [chartData, setChartData] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(0);

  useEffect(() => {
    const fakeChartData = Array.from({ length: 24 }, (_, i) => {
      const baseDate = new Date();
      baseDate.setHours(baseDate.getHours() - 24 + i);
      return {
        last_polled_time: baseDate.toISOString(),
        attribute_value: Math.floor(Math.random() * 500) + 200
      };
    });
    setChartData(fakeChartData);
    setCriticalAlertsCount(Math.floor(Math.random() * 10));
  }, [lastUpdated]);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const viewModeButtons = [
    { mode: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { mode: 'monitors', icon: <ShowChart />, label: 'Monitors' },
    { mode: 'alerts', icon: <Warning />, label: 'Alerts' },
    { mode: 'create', icon: <TrendingUp />, label: 'Create Monitor' },
    { mode: 'createGroup', icon: <GroupAdd />, label: 'Create Group' },
    { mode: 'delete', icon: <DeleteIcon />, label: 'Delete Monitor' },
    { mode: 'rca', icon: <RcaIcon />, label: 'RCA Analyzer' }
  ];

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon sx={{ 
            fontSize: 32,
            color: theme.palette.primary.main,
            borderRadius: '50%',
            p: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.1)
          }} />
          <Typography variant="h4" fontWeight="bold">
            Site24x7 Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`Updated: ${lastUpdated.toLocaleTimeString()}`}
            size="small"
            color="info"
            variant="outlined"
            icon={<InfoOutlined fontSize="small" />}
          />
          <Button
            variant="contained"
            startIcon={<Refresh sx={{
              transition: 'transform 0.5s ease',
              transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)'
            }} />}
            onClick={refreshData}
            disabled={isRefreshing}
            sx={{
              borderRadius: 4,
              px: 3,
              minWidth: 120,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: theme.shadows[2]
              }
            }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* View Mode Toggle */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ 
          display: 'inline-flex', 
          p: 0.5,
          borderRadius: 4,
          bgcolor: theme.palette.action.selected,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'auto',
          maxWidth: '100%'
        }}>
          {viewModeButtons.map(({ mode, icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'contained' : 'text'}
              onClick={() => setViewMode(mode)}
              sx={{
                borderRadius: 3,
                px: 3,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&.MuiButton-contained': {
                  boxShadow: theme.shadows[1]
                }
              }}
              startIcon={icon}
            >
              {label}
            </Button>
          ))}
        </Paper>
      </Box>

      {viewMode === 'dashboard' && (
        <>
          <StatusSummary refreshKey={lastUpdated} />
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 4,
                boxShadow: theme.shadows[2],
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme.shadows[6],
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.03)
                  }}>
                    <Typography variant="h6" fontWeight="bold">
                      <Timeline sx={{ mr: 1, color: theme.palette.primary.main }} />
                      Performance Overview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['Day', 'Week', 'Month'].map((period, index) => (
                        <Button 
                          key={period}
                          size="small" 
                          variant={index === 0 ? 'contained' : 'outlined'}
                          sx={{ borderRadius: 2, minWidth: 60 }}
                        >
                          {period}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 3, height: 350 }}>
                    <PerformanceChart data={chartData} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 4,
                boxShadow: theme.shadows[2],
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme.shadows[6],
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.error.main, 0.03)
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Warning sx={{ color: theme.palette.error.main }} />
                      <Typography variant="h6" fontWeight="bold">
                        Critical Alerts
                      </Typography>
                    </Box>
                    <Badge 
                      badgeContent={criticalAlertsCount} 
                      color="error"
                      overlap="circular"
                    >
                      <Chip 
                        label="Real-time" 
                        size="small" 
                        color="error" 
                        variant="outlined"
                        icon={<NotificationsActive fontSize="small" />}
                      />
                    </Badge>
                  </Box>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <AlarmsTable compactMode refreshKey={lastUpdated} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {viewMode === 'monitors' && (
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: theme.shadows[2],
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[6],
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.03)
            }}>
              <Typography variant="h6" fontWeight="bold">
                All Monitors
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 3 }}>
              <MetricsTable refreshKey={lastUpdated} />
            </Box>
          </CardContent>
        </Card>
      )}

      {viewMode === 'alerts' && (
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: theme.shadows[2],
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[6],
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 3,
              bgcolor: alpha(theme.palette.error.main, 0.03)
            }}>
              <Typography variant="h6" fontWeight="bold">
                All Alerts
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ p: 3 }}>
              <AlarmsTable refreshKey={lastUpdated} />
            </Box>
          </CardContent>
        </Card>
      )}

      {viewMode === 'create' && <CreateMonitor />}
      {viewMode === 'createGroup' && <CreateMonitorGroup />}
      {viewMode === 'rca' && <RCA />}
    </Box>
  );
};

export default Dashboard;