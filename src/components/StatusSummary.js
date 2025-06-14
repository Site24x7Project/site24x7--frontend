import React from 'react';
import useMetrics from '../hooks/useMetrics';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { 
  ArrowUpward, 
  ArrowDownward,
  Warning,
  SettingsSuggest,
  Error 
} from '@mui/icons-material';

const StatusSummary = () => {
  const { metrics } = useMetrics();

  const statusCounts = metrics.reduce((acc, metric) => {
    acc[metric.monitor_status] = (acc[metric.monitor_status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { 
      title: 'Up', 
      value: statusCounts[1] || 0,
      icon: <ArrowUpward sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success'
    },
    { 
      title: 'Trouble', 
      value: statusCounts[2] || 0,
      icon: <Warning sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning'
    },
    { 
      title: 'Config Errors', 
      value: statusCounts[10] || 0,
      icon: <SettingsSuggest sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error'
    },
    { 
      title: 'Down', 
      value: statusCounts[0] || 0,
      icon: <ArrowDownward sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary'
    }
  ];

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
      {stats.map((stat) => (
        <Grid 
          key={stat.title}
          item
          xs={12}
          sm={6}
          md={3}
          sx={{ px: 1, py: 1 }}
        >
          <Card sx={{ 
            bgcolor: `${stat.color}.light`,
            height: '100%',
            boxShadow: 1
          }}>
            <CardContent>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <Typography 
                    variant="h3" 
                    component="div"
                    color={`${stat.color}.dark`}
                    sx={{ fontWeight: 700 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color={`${stat.color}.dark`}
                    sx={{ mt: 1 }}
                  >
                    {stat.title}
                  </Typography>
                </div>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatusSummary;