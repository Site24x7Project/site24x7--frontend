import React, { useState } from 'react';
import { 
  Box, TextField, Button, Card, CardContent,
  Typography, Grid, Select, MenuItem, InputLabel,
  FormControl, Divider, Alert, CircularProgress
} from '@mui/material';
import { 
  AddCircle, Public, Schedule, 
  Notifications, LocationOn, TrendingUp
} from '@mui/icons-material';
import { api } from '../services/api';

const CreateMonitor = () => {
  const [form, setForm] = useState({
    name: '',
    url: 'https://',
    checkFrequency: '5',
    monitorType: 'website',
    notificationProfile: 'default',
    locationProfile: 'global'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createMonitor({
        display_name: form.name,
        website: form.url,
        check_frequency: form.checkFrequency,
        type: form.monitorType
      });
      setSuccess('Monitor created successfully!');
      setForm({
        name: '',
        url: 'https://',
        checkFrequency: '5',
        monitorType: 'website'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create monitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ 
      width: '100%',
      boxShadow: 3,
      borderRadius: 2
    }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 3
        }}>
          <AddCircle color="primary" sx={{ mr: 1 }} />
          Create New Monitor
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monitor Name"
                variant="outlined"
                required
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                InputProps={{
                  startAdornment: <TrendingUp sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website URL"
                variant="outlined"
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm({...form, url: e.target.value})}
                InputProps={{
                  startAdornment: <Public sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Monitor Type</InputLabel>
                <Select
                  value={form.monitorType}
                  onChange={(e) => setForm({...form, monitorType: e.target.value})}
                  label="Monitor Type"
                >
                  <MenuItem value="website">Website</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="server">Server</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Check Frequency (minutes)"
                variant="outlined"
                type="number"
                required
                inputProps={{ min: 1, max: 60 }}
                value={form.checkFrequency}
                onChange={(e) => setForm({...form, checkFrequency: e.target.value})}
                InputProps={{
                  startAdornment: <Schedule sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Notification Profile</InputLabel>
                <Select
                  value={form.notificationProfile}
                  onChange={(e) => setForm({...form, notificationProfile: e.target.value})}
                  label="Notification Profile"
                  InputProps={{
                    startAdornment: <Notifications sx={{ mr: 1, color: 'action.active' }} />
                  }}
                >
                  <MenuItem value="default">Default</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="business-hours">Business Hours</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddCircle />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Monitor'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateMonitor;