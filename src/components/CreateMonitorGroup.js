import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Card, CardContent,
  Typography, Grid, Divider, Alert, CircularProgress,
  Chip, Autocomplete, FormControl, InputLabel
} from '@mui/material';
import { AddCircle, GroupAdd, Close } from '@mui/icons-material';
import { api } from '../services/api';

const CreateMonitorGroup = () => {
  const [form, setForm] = useState({
    display_name: '',
    monitors: [],
    health_threshold_count: 1,
    group_type: 1,
    alert_periodically: true,
    alert_frequency: 10,
    healing_period: 15,
    selection_type: 2,
    suppress_alert: false
  });
  const [allMonitors, setAllMonitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMonitors, setFetchingMonitors] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchMonitors = async () => {
      setFetchingMonitors(true);
      try {
        const response = await api.getMonitors();
        setAllMonitors(response.data);
      } catch (err) {
        setError('Failed to fetch monitors');
      } finally {
        setFetchingMonitors(false);
      }
    };
    fetchMonitors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...form,
        monitors: form.monitors.map(monitor => monitor.monitor_id),
        healthcheck_profile_id: "49235000000018014",
        notification_profile_id: "49084000000008001", 
        user_group_ids: ["49235000000002009"], 
        tags: []
      };

      const response = await api.createMonitorGroup(payload);
      setSuccess(`Monitor group created successfully! ID: ${response.data.group_id}`);
      setForm({
        ...form,
        display_name: '',
        monitors: []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create monitor group');
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
          <GroupAdd color="primary" sx={{ mr: 1 }} />
          Create New Monitor Group
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Group Name"
                variant="outlined"
                required
                value={form.display_name}
                onChange={(e) => setForm({...form, display_name: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel shrink>Select Monitors</InputLabel>
                <Autocomplete
                  multiple
                  options={allMonitors}
                  getOptionLabel={(option) => option.monitor_name}
                  value={form.monitors}
                  onChange={(e, newValue) => {
                    setForm({...form, monitors: newValue});
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Select monitors..."
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.monitor_name}
                        {...getTagProps({ index })}
                        deleteIcon={<Close />}
                      />
                    ))
                  }
                  loading={fetchingMonitors}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Health Threshold Count"
                type="number"
                inputProps={{ min: 1 }}
                value={form.health_threshold_count}
                onChange={(e) => setForm({...form, health_threshold_count: e.target.value})}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alert Frequency (minutes)"
                type="number"
                inputProps={{ min: 1 }}
                value={form.alert_frequency}
                onChange={(e) => setForm({...form, alert_frequency: e.target.value})}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || form.monitors.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <GroupAdd />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateMonitorGroup;