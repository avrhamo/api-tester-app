import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, IconButton, TextField, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SpecialFieldModal = ({
    open,
    onClose,
    specialFieldType,
    handleRadioChange,
    encodedString,
    setEncodedString,
    handleDecodeBase64,
    fieldMappings,
    specialFieldName,
    setSpecialFieldName,
    handleFieldMappingChange,
    collectionFields,
    oauthData,
    setOauthData,
    handleOauthSubmit,
    jwtToken,
    setJwtToken,
    handleJwtDecode
}) => {
    const [decodedFields, setDecodedFields] = useState({});

    useEffect(() => {
        if (encodedString && encodedString.length > 0) {
            try {
                const decoded = JSON.parse(atob(encodedString));
                setDecodedFields(decoded);
            } catch (error) {
                console.error('Failed to decode Base64 string:', error);
            }
        }
    }, [encodedString]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '50%',
                    maxHeight: '80%',
                    overflowY: 'auto',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderRadius: 1,
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6" component="h2" gutterBottom>
                    Select Special Field Type
                </Typography>
                <FormControl component="fieldset">
                    <RadioGroup value={specialFieldType} onChange={handleRadioChange}>
                        <FormControlLabel value="encoded" control={<Radio />} label="Encoded Field" />
                        <FormControlLabel value="oauth" control={<Radio />} label="OAuth Handling" />
                        <FormControlLabel value="jwt" control={<Radio />} label="JWT Handling" />
                    </RadioGroup>
                </FormControl>

                {specialFieldType === 'encoded' && (
                    <div>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter Base64 encoded data"
                            value={encodedString}
                            onChange={(e) => {
                                setEncodedString(e.target.value);
                                handleDecodeBase64(e.target.value);
                            }}
                            sx={{ marginBottom: 2 }}
                        />
                        {Object.entries(decodedFields).map(([key, value]) => (
                            <Grid container spacing={2} key={key} alignItems="center" justifyContent="space-between">
                                <Grid item xs={6}>
                                    <Typography>{key}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Map to Field</InputLabel>
                                        <Select
                                            labelId={`${key}-label`}
                                            value={
                                                fieldMappings.specialFields?.find((field) => field.fieldName === specialFieldName)?.payload[key] || ''
                                            }
                                            onChange={(e) => handleFieldMappingChange(key, e.target.value)}
                                            label="Map to Field"
                                            renderValue={(selected) => (selected ? selected : 'Select a Field')}
                                        >
                                            {collectionFields.map((field) => (
                                                <MenuItem key={field} value={field}>
                                                    {field}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        ))}
                    </div>
                )}

                {specialFieldType === 'oauth' && (
                    <div>
                        <TextField
                            fullWidth
                            placeholder="Access Token URL"
                            value={oauthData.accessTokenUrl}
                            onChange={(e) => setOauthData({ ...oauthData, accessTokenUrl: e.target.value })}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            fullWidth
                            placeholder="Client ID"
                            value={oauthData.clientId}
                            onChange={(e) => setOauthData({ ...oauthData, clientId: e.target.value })}
                            sx={{ marginBottom: 2 }}
                        />
                        <TextField
                            fullWidth
                            placeholder="Client Secret"
                            value={oauthData.clientSecret}
                            onChange={(e) => setOauthData({ ...oauthData, clientSecret: e.target.value })}
                            sx={{ marginBottom: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOauthSubmit}
                            sx={{ bgcolor: '#51ed75', '&:hover': { bgcolor: '#aeebbc' }, marginBottom: 2 }}
                        >
                            Submit
                        </Button>
                    </div>
                )}

                {specialFieldType === 'jwt' && (
                    <div>
                        <TextField
                            fullWidth
                            multiline
                            rows={5}
                            placeholder="Enter JWT token"
                            value={jwtToken}
                            onChange={(e) => setJwtToken(e.target.value)}
                            sx={{ marginBottom: 2 }}
                        />
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#51ed75', '&:hover': { bgcolor: '#aeebbc' }, marginBottom: 2 }}
                            onClick={handleJwtDecode}
                        >
                            Decode JWT
                        </Button>
                    </div>
                )}
            </Box>
        </Modal>
    );
};

export default SpecialFieldModal;